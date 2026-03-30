import type { auth } from "@server/auth";
import db from "@server/db";
import { projectShips } from "@server/db/schema";
import { avg, count, max, min, sum } from "drizzle-orm";
import { Hono } from "hono";

export const adminRoute = new Hono<{
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null
	}
}>()
	.get("/stats", async (c) => {
		const user = c.get("user")

		if (!user) return c.json({ message: "Unauthorized" }, 401)
		if (user.type != "admin") return c.json({ message: "Forbidden" }, 403)

		const shipStatsRes = await db.select({
			payoutsGiven: sum(projectShips.payout).mapWith(Number),
			shipsMade: count(),
			minPayout: min(projectShips.payout).mapWith(Number),
			maxPayout: max(projectShips.payout).mapWith(Number),
			avgPayout: avg(projectShips.payout).mapWith(Number),
			avgLoggedTimePerShip: avg(projectShips.loggedTime).mapWith(Number),
			totalShipTime: sum(projectShips.timeSpent).mapWith(Number),
			totalLoggedShipTime: sum(projectShips.loggedTime).mapWith(Number)
		}).from(projectShips)
		if (shipStatsRes.length == 0) {
			console.log(shipStatsRes)
			return c.json({ message: "Something went wrong" }, 500)
		}
		const reviewStatsRes = await db.select({ n: count(), state: projectShips.state }).from(projectShips).groupBy(projectShips.state)

		const shipStats = shipStatsRes[0]!

		return c.json({
			...shipStats,
			finishedShips: reviewStatsRes.filter((rs) => rs.state == "finished")[0]?.n || 0,
			failedShips: reviewStatsRes.filter((rs) => rs.state == "failed")[0]?.n || 0,
			shipsInVoting: reviewStatsRes.filter((rs) => rs.state == "voting")[0]?.n || 0,
			shipsAwaitingNormalReview: reviewStatsRes.filter((rs) => rs.state == "pre-initial")[0]?.n || 0,
			shipsAwaitingFraudReview: reviewStatsRes.filter((rs) => rs.state == "pre-fraud")[0]?.n || 0,
			shipsAwaitingPayout: reviewStatsRes.filter((rs) => rs.state == "pre-payout")[0]?.n || 0,
		}, 200)

	})

import { zValidator } from "@hono/zod-validator";
import type { auth } from "@server/auth";
import db from "@server/db";
import { addresses, hackatimeProjectLinks, projects, shopOrders, users, userStats } from "@server/db/schema";
import hackatime from "@server/hackatime";
import { and, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { Hono } from "hono";
import { NewAddressSchema } from "@shared/validation/addresses"
import z from "zod";

const searchSchema = z.object({
	q: z.string().min(1).max(100),
	limit: z.coerce.number().int().min(1).max(50).default(20),
	offset: z.coerce.number().int().min(0).default(0),
});

export const usersRoutes = new Hono<{
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null
	}
}>()
	.get("/hackatime-projects", async (c) => {
		const user = c.get("user")

		if (!user) return c.json({ message: "Unauthorized" }, 401)

		const res = await hackatime.userProjectDetails(user.slackId, {
			startDate: new Date(process.env.START_DATE!),
		})

		if (!res.success) {
			console.log(res.error)
			return c.json({ message: "Something went wrong" }, 500)
		}

		const dbRes = await db.select({
			hackatimeProjects: hackatimeProjectLinks.hackatimeProjectId
		}).from(hackatimeProjectLinks).leftJoin(projects, and(
			eq(hackatimeProjectLinks.projectId, projects.id),
			eq(projects.creatorId, user.id)
		))

		const alreadyInUse = dbRes.map(p => p.hackatimeProjects)

		return c.json({
			used: alreadyInUse,
			unused: res.projects.filter(p => !alreadyInUse.includes(p.name)).map(p => p.name),
		}, 200)

	})
	.get("/stats", async (c) => {
		const user = c.get("user")
		if (!user) return c.json({ message: "Unauthorized" }, 401)

		const res = await db.select({ votesCast: userStats.votesCast }).from(userStats).where(eq(userStats.userId, user.id))

		if (res.length == 0) {
			return c.json({ message: "Not found" }, 404)
		}


		return c.json({ stats: res[0]! }, 200)
	})

	.post("/addresses", zValidator("json", NewAddressSchema), async (c) => {
		const user = c.get("user")
		if (!user) return c.json({ message: "Unauthorized" }, 401)

		const data = c.req.valid("json")

		const res = await db.insert(addresses).values({
			...data,
			userId: user.id
		}).returning()
		if (res.length == 0) {
			return c.json({ message: "Something went wrong" }, 500)
		}

		return c.json({ address: res[0]! }, 201)
	})
	.get("/addresses", async (c) => {
		const user = c.get("user")

		if (!user) return c.json({ message: "Unauthorized" }, 401)

		const res = await db.select().from(addresses).where(eq(addresses.userId, user.id))

		return c.json({ addresses: res }, 200)
	})
	.post("/:id/ban", async (c) => {
		const user = c.get("user")
		if (!user) return c.json({ message: "Unauthorized" }, 401)
		if (user.type != "fraud" && user.type != "admin") return c.json({ message: "Forbidden" }, 403)

		const { id } = c.req.param()

		await db.update(users).set({ banned: true, type: "participant", coins: 0 }).where(eq(users.id, id))
		await db.delete(shopOrders).where(and(
			eq(shopOrders.userId, id),
			isNull(shopOrders.fulfilledAt)
		))

		const alreadyFulfilled = db.select().from(shopOrders).where(and(
			eq(shopOrders.userId, id),
			isNotNull(shopOrders.fulfilledAt)
		))

		return c.json({ message: "User successfully banned!", alreadyFulfilledOrders: alreadyFulfilled })
	})
	.get("/search", zValidator("query", searchSchema), async (c) => {
		const user = c.get("user")
		if (!user || user.type != "admin") return c.json({ message: "Unauthorized" }, 401)

		const { q, limit, offset } = c.req.valid("query");

		const tsQuery = q
			.trim()
			.split(/\s+/)
			.map((word) => `${word}:*`) // this does prefixes as well
			.join(" & ");

		const results = await db
			.select({
				id: users.id,
				name: users.name,
				nickname: users.nickname,
				slackId: users.slackId,
				type: users.type,
				image: users.image,
				rank: sql<number>`ts_rank(search_vector, to_tsquery('english', ${tsQuery}))`,
			})
			.from(users)
			.where(
				sql`search_vector @@ to_tsquery('english', ${tsQuery})`
			)
			.orderBy(desc(sql`ts_rank(search_vector, to_tsquery('english', ${tsQuery}))`))
			.limit(limit)
			.offset(offset);

		return c.json({ results, query: q }, 200);
	}
	);

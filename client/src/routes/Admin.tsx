import { Input } from "@client/components/Input"
import { client } from "@client/lib/api-client"
import { useErrors } from "@client/lib/context/ErrorContext"
import { secondsToFormatTime } from "@client/lib/time"
import { useUserSearch } from "@client/lib/userSearch"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

export default function AdminPage() {
	const [query, setQuery] = useState("");
	const { data, isLoading } = useUserSearch(query);

	const { pushError } = useErrors()
	const { data: stats, isPending } = useQuery({
		queryKey: ["adminStats"],
		queryFn: async () => {
			const res = await client.api.admin.stats.$get()
			if (!res.ok) {
				const data = await res.json()
				pushError(data.message)
				throw data.message
			}

			const data = await res.json()
			return data

		}
	})

	if (!stats || isPending) {
		return <p>loading</p>
	}
	return (
		<main className="w-full min-h-screen p-4 text-4xl flex flex-col gap-4">
			<div className="flex flex-row w-full gap-4">
				<div className="p-4 bg-egg-yellow text-light-brown border-dark-red border-4 w-fit rounded-4xl h-fit">
					<h2 className="bold text-6xl text-dark-brown">Payout</h2>
					<p>Total book payout: {stats.payoutsGiven || 0}</p>
					<p>Average payout per ship: {stats.avgPayout || 0}</p>
					<p>Biggest payout: {stats.maxPayout || 0}</p>
					<p>Smallest payout: {stats.minPayout || 0}</p>
				</div>
				<div className="p-4 bg-egg-yellow text-light-brown border-dark-red border-4 w-fit rounded-4xl h-fit">
					<h2 className="bold text-6xl text-dark-brown">Ships</h2>
					<p>Number of ships made: {stats.shipsMade} ({stats.finishedShips} finished; {stats.failedShips} failed)</p>
					<p>Average (logged) time per ship: {secondsToFormatTime(stats.avgLoggedTimePerShip)}</p>
					<p>In voting: {stats.shipsInVoting}</p>
					<p>Awaiting normal review: {stats.shipsAwaitingNormalReview}</p>
					<p>Awaiting fraud review: {stats.shipsAwaitingFraudReview}</p>
					<p>Awaiting payout review: {stats.shipsAwaitingPayout}</p>
				</div>
			</div>

			<div className="p-4 bg-egg-yellow text-light-brown border-dark-red border-4 w-fit rounded-4xl h-fit">
				<h2 className="bold text-6xl text-dark-brown">User search</h2>
				<Input type="text" placeholder="User ID/Slack ID/Email/Real Name/..." label={""} name="q" onInput={(v) => setQuery(v)} />
				<div className="flex flex-col pt-4">
					{data?.results.map((user) => (
						<a key={user.id} className="flex flex-row items-center gap-2 border-dark-red border-2 rounded-2xl p-4" href={`/admin/user-history/${user.id}`}>
							{user.image && (
								<img alt="user pfp" src={user.image} className="size-20 rounded-full" />
							)}
							<span>{user.nickname} ({user.slackId})</span>
							<span className="border border-dark-red rounded-full p-1 text-xl">{user.type}</span>

							<strong className="blur hover:blur-none">{user.name}</strong>
						</a>
					))}
					{isLoading && <p>loading</p>}
					{data && data.results.length === 0 && (
						<p>No users found for "{data.query}"</p>
					)}
				</div>
			</div>

		</main>
	)
}

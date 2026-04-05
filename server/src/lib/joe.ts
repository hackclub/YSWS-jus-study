interface FraudRequestBody {
	name: string
	codeLink: string
	demoLink?: string
	submitter: {
		slackId: string
	} | {
		hackatimeId: string
	} | {
		email: string
	}
	hackatimeProjects: string[]
	organizerPlatformId?: string
}
export async function requestFraudReview(body: FraudRequestBody) {
	const res = await fetch(`https://joe.fraud.hackclub.com/api/v1/ysws/events/${process.env.JOE_EVENT_ID!}/projects`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${process.env.JOE_API_KEY!}`
		},
		body: JSON.stringify(body)
	})
	if (!res.ok) {
		throw new Error(`Failed posting fraud review with status ${res.status}`)
	}

	return await res.json() as {
		id: string, // uuid
		status: string,
		message: string
	}
}

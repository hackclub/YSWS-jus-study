import pino from "pino";

const transport = pino.transport({
	targets: [
		{
			target: "pino-loki",
			options: {
				host: process.env.GRAFANA_LOKI_HOST!,
				labels: {
					app: "jus-study frontend",
					namespace: process.env.NODE_ENV || "development",
					runtime: `nodejs/${process.version}`
				}
			},
			...(process.env.NODE_ENV === "development" ? {
				target: "pino-pretty",
				options: { colorize: true },
			} : undefined),
		}
	]
})
export const logger = pino({
	level: process.env.LOG_LEVEL ?? "info",
},
	transport
);


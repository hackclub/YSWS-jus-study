import { defineConfig } from 'vocs'

export default defineConfig({
	description: 'Guides to help you learn build!',
	title: 'JUS\'Study Guides',
	basePath: "/docs",
	checkDeadlinks: true,
	aiCta: false,
	sidebar: [
		{
			text: "Getting Started",
			link: "/docs"
		},
		{
			text: "Hardware",
			collapsed: false,
			items: [
				{
					text: "Building a simple pomodoro timer",
					link: "/docs/hw/first-project"
				},
				{
					text: "Further Ressources",
					link: "/docs/hw/ressources"
				}
			]
		},
		{
			text: "Software",
			collapsed: false,
			items: [
				{
					text: "Building a simple to-do website",
					link: "/docs/hw/first-project"
				},
				{
					text: "Further Ressources",
					link: "/docs/sw/ressources"
				}
			]
		}
	]
})

import { skeleton } from "@skeletonlabs/tw-plugin";
import forms from "@tailwindcss/forms";

const config = {
	darkMode: "class",
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/@skeletonlabs/skeleton-svelte/**/*.{html,js,svelte,ts}'
	],
	plugins: [
		forms,
		skeleton({
			themes: {
				preset: [
					{
						name: "skeleton",
						enhancements: true
					},
					{
						name: "wintry",
						enhancements: true
					},
					{
						name: "modern",
						enhancements: true
					}
				]
			}
		})
	]
};

export default config;

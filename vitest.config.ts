import { defineConfig } from "vitest/config";

/** Unit tests deliberately avoid the Cloudflare Vite plugin and its dev ports. */
export default defineConfig({
	test: {
		environment: "node",
		include: ["tests/**/*.test.ts"],
		clearMocks: true,
	},
});

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    // The default "forks" pool times out spawning workers on some Windows
    // machines; "threads" runs the suite reliably everywhere.
    pool: "threads",
  },
});

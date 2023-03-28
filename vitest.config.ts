/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    return {
        plugins: [react(), tsconfigPaths()],
        test: {
            globals: true,
            environment: "happy-dom",
            setupFiles: ["./test/setup-test-env.ts"],
            env
        }
    };
});

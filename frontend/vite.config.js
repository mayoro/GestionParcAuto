import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
    plugins: [react()],

    resolve: {
        dedupe: ["react", "react-dom"],
        alias: {
            react: path.resolve("./node_modules/react"),
            "react-dom": path.resolve("./node_modules/react-dom")
        }
    },

    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/Tests/setup.js",
        exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "**/e2e/**"
        ]
    }
});
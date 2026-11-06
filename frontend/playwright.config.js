import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    timeout: 30_000,

    use: {
        baseURL: "http://localhost:5173",
        headless: true,
        screenshot: "only-on-failure",
        trace: "on-first-retry"
    },

    webServer: {
        command: "npm run dev -- --host localhost",
        url: "http://localhost:5173",
        reuseExistingServer: true
    },

    projects: [
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"]
            }
        }
    ]
});
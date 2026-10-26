import { defineConfig } from '@playwright/test'

const sizes = [[1440, 900], [1024, 768], [768, 1024], [390, 844], [360, 800], [844, 390]]

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5190',
    // Use the full Chromium build, also suitable for headed visual review.
    channel: 'chromium',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: sizes.map(([width, height]) => ({
    name: `${width}x${height}`,
    use: { viewport: { width, height }, hasTouch: width < 1024 },
  })),
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5190 --strictPort',
    url: 'http://127.0.0.1:5190',
    reuseExistingServer: !process.env.CI,
  },
})

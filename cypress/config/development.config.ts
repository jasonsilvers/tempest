import { defineConfig } from 'cypress'

export default defineConfig({
  video: false,
  viewportWidth: 1280,
  viewportHeight: 800,
  defaultCommandTimeout: 20000,
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: 'http://localhost:3000/',
  },
})

const { defineConfig } = require("cypress");
const dotenvPlugin = require('cypress-dotenv');

module.exports = defineConfig({
  e2e: {
    specPattern: "cypress/tests/**/*.spec.{js,jsx,ts,tsx}",
    defaultCommandTimeout: 200000,
    pageLoadTimeout: 200000,
    responseTimeout: 200000,
    viewportWidth: 1920,
    viewportHeight: 1080,
    experimentalOriginDependencies: true,
    experimentalModifyObstructiveThirdPartyCode: true,
    experimentalSessionAndOrigin: true,
    watchForFileChanges: false,
    setupNodeEvents(on, config) {
        config = dotenvPlugin(config)
        return config
    },
  },
});

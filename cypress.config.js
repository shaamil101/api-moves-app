/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  video: false,
  screenshotOnRunFailure: false,
  e2e: {
    baseUrl: 'http://localhost:9090',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});

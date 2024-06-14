module.exports = {
  ci: {
    upload: { target: 'lhci', serverBaseUrl: process.env.URL_PARAMETER, token: process.env.API_KEY_PARAMETER },
    collect: {
      url: process.env.TARGET_PARAMETER,
      chromeDebuggingPort: 9222,
      numberOfRuns: 1,
      settings: { chromeFlags: '--no-sandbox --disable-dev-shm-usage' },
    },
  },
};

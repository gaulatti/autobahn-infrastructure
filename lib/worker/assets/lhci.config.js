module.exports = {
  ci: {
    upload: { target: 'lhci', serverBaseUrl: process.env.URL_PARAMETER, token: process.env.API_KEY_PARAMETER },
  },
};

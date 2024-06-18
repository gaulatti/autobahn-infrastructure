module.exports = {
  ci: {
    upload: { target: 'lhci', serverBaseUrl: `http://${process.env.URL_PARAMETER}`, token: process.env.API_KEY_PARAMETER },
  },
};

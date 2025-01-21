const config = {
  email: {
    service: "gmail",
    auth: {
      user: "sumit.vairagar.puppeteer@gmail.com",
      pass: "PLACE_YOUR_APP_PASSWORD",
    },
    from: "sumit.vairagar.puppeteer@gmail.com",
    to: "sumit.vairagar.puppeteer@gmail.com",
    subject: "Amazon Product Alert: ",
  },
  browser: {
    headless: true,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  },
  amazon: {
    baseUrl: "https://www.amazon.com",
    defaultProductUrl:
      "https://www.amazon.com/Apple-iPhone-Version-Natural-Titanium/dp/B0DHJ86J52",
  },
};

module.exports = config;

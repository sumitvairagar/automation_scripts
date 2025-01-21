const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const config = require("./config.js");

// Logging utility
function log(type, message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = {
    timestamp,
    type,
    message,
    ...(data && { data }),
  };
  console.log(JSON.stringify(logMessage, null, 2));
}

async function sendEmailAlert(productDetails) {
  log("info", "Initializing email transport");
  const transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: config.email.auth,
  });

  log("info", "Creating email content", { product: productDetails.title });
  const emailContent = `
    <h2>Amazon Product Details</h2>
    <p><strong>Product:</strong> ${productDetails.title}</p>
    <p><strong>Price:</strong> ${productDetails.price}</p>
    <p><strong>Rating:</strong> ${productDetails.rating}</p>
    <p><strong>Reviews:</strong> ${productDetails.reviewCount}</p>
    <p><strong>Availability:</strong> ${productDetails.availability}</p>
    <p><strong>Seller:</strong> ${productDetails.seller}</p>
    
    <h3>Product Features:</h3>
    <ul>
      ${productDetails.features
        .map((feature) => `<li>${feature}</li>`)
        .join("")}
    </ul>
  `;

  const mailOptions = {
    from: config.email.from,
    to: config.email.to,
    subject: `${config.email.subject}${productDetails.title}`,
    html: emailContent,
  };

  try {
    log("info", "Attempting to send email");
    const info = await transporter.sendMail(mailOptions);
    log("success", "Email sent successfully", { messageId: info.messageId });
    return true;
  } catch (error) {
    log("error", "Failed to send email", { error: error.message });
    return false;
  }
}

(async () => {
  log("info", "Starting browser automation");
  const browser = await puppeteer.launch({
    headless: config.browser.headless,
  });

  try {
    log("info", "Creating new page");
    const page = await browser.newPage();

    log("info", "Setting user agent");
    await page.setUserAgent(config.browser.userAgent);

    log("info", "Navigating to product page", {
      url: config.amazon.defaultProductUrl,
    });
    await page.goto(config.amazon.defaultProductUrl, {
      waitUntil: "domcontentloaded",
    });

    log("info", "Extracting product details");
    const productDetails = await page.evaluate(() => {
      const title = document.querySelector("#productTitle")?.innerText.trim();
      const price = document
        .querySelector(".a-price .a-offscreen")
        ?.innerText.trim();
      const rating = document
        .querySelector("span.a-icon-alt")
        ?.innerText.trim();
      const reviewCount = document
        .querySelector("#acrCustomerReviewText")
        ?.innerText.trim();
      const availability = document
        .querySelector("#availability span")
        ?.innerText.trim();
      const seller = document.querySelector("#merchant-info")?.innerText.trim();
      const features = Array.from(
        document.querySelectorAll("#feature-bullets li span")
      )
        .map((el) => el.innerText.trim())
        .filter((text) => text !== "");

      return {
        title,
        price,
        rating,
        reviewCount,
        availability,
        seller,
        features,
      };
    });

    log("info", "Product details extracted", {
      title: productDetails.title,
      price: productDetails.price,
    });

    // Save to file
    const fs = require("fs");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `product-${timestamp}.json`;

    log("info", "Saving product details to file", { fileName });
    fs.writeFileSync(fileName, JSON.stringify(productDetails, null, 2));
    log("success", "Data saved to file");

    // Send email
    log("info", "Initiating email alert");
    await sendEmailAlert(productDetails);
  } catch (error) {
    log("error", "Script execution failed", {
      error: error.message,
      stack: error.stack,
    });
  } finally {
    log("info", "Closing browser");
    await browser.close();
    log("info", "Script execution completed");
  }
})();

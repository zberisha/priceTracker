const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"PriceTracker" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    logger.error(`Email failed to ${to}: ${error.message}`);
  }
};

const sendPriceDropAlert = async (user, product, oldPrice, newPrice) => {
  const percentDrop = (((oldPrice - newPrice) / oldPrice) * 100).toFixed(1);
  await sendEmail({
    to: user.email,
    subject: `Price Drop Alert: ${product.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a73e8;">Price Drop Alert</h2>
        <p><strong>${product.name}</strong> dropped by <strong>${percentDrop}%</strong>!</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;">Previous Price</td><td style="padding: 8px; border: 1px solid #ddd;"><s>$${oldPrice.toFixed(2)}</s></td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;">Current Price</td><td style="padding: 8px; border: 1px solid #ddd; color: #0d7c3d; font-weight: bold;">$${newPrice.toFixed(2)}</td></tr>
        </table>
        <p style="color: #666; font-size: 12px;">You're receiving this because you set up a price alert on PriceTracker.</p>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendPriceDropAlert };

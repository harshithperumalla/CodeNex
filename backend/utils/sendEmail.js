const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Configured to fallback safely
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.mailtrap.io",
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || "CodeNex"} <${process.env.FROM_EMAIL || "noreply@codenex.io"}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;

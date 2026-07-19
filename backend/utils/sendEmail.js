const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const smtpHost = process.env.SMTP_HOST || "";
  const smtpUser = process.env.SMTP_USER || "";
  const isGmail = smtpHost.includes("gmail") || 
                  smtpUser.endsWith("@gmail.com") || 
                  process.env.SMTP_SERVICE === "gmail";

  let transporterConfig;
  if (isGmail) {
    transporterConfig = {
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: process.env.SMTP_PASS || "",
      },
    };
  } else {
    const isSecure = Number(process.env.SMTP_PORT) === 465;
    transporterConfig = {
      host: process.env.SMTP_HOST || "smtp.mailtrap.io",
      port: Number(process.env.SMTP_PORT) || 2525,
      secure: isSecure,
      auth: {
        user: smtpUser,
        pass: process.env.SMTP_PASS || "",
      },
      tls: {
        rejectUnauthorized: false,
      },
    };
  }

  const transporter = nodemailer.createTransport(transporterConfig);

  const message = {
    from: `${process.env.FROM_NAME || "CodeNex"} <${process.env.FROM_EMAIL || "noreply@codenex.io"}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || undefined,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log("✉️ Password reset email sent successfully via SMTP:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ SMTP sendMail failed.");
    console.error("Attempted configuration:", {
      service: isGmail ? "gmail" : undefined,
      host: transporterConfig.host,
      port: transporterConfig.port,
      secure: transporterConfig.secure,
      user: smtpUser ? `${smtpUser.slice(0, 3)}...` : "none",
    });
    console.error("Detailed error trace:", error);
    throw error;
  }
};

module.exports = sendEmail;

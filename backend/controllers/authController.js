const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const formatAuthResponse = (user, token) => ({
  success: true,
  token,
  user: user.toPublicProfile(),
  role: user.role === "user" ? "student" : user.role,
  message: "Success",
});

const signup = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    // SECURITY: Public registration ALWAYS creates a Student account (role: "user").
    // Ignore any role provided by client to prevent role escalation.
    const user = await User.create({
      fullName,
      email,
      phone: phone || "",
      password,
      role: "user",
    });

    const token = generateToken(user._id, user.role);
    res.status(201).json(formatAuthResponse(user, token));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, portalRole } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please enter email and password" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Your account has been deactivated" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // SECURITY: Validate portal restriction if logging in from a role-specific portal
    if (portalRole) {
      const actualRole = user.role === "user" ? "student" : user.role;
      const targetRole = portalRole === "user" ? "student" : portalRole;
      if (actualRole !== targetRole) {
        return res.status(403).json({
          success: false,
          message: `Access denied. This portal is for ${targetRole} accounts only.`,
        });
      }
    }

    const token = generateToken(user._id, user.role);
    res.json(formatAuthResponse(user, token));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      user: user.toPublicProfile(),
      role: user.role === "user" ? "student" : user.role,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide your email" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No user found with that email" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and save to DB
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:8080"}/reset-password/${resetToken}`;
    console.log("ℹ️ Password Reset Link (for development):", resetUrl);

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please visit the following link to reset your password:\n\n${resetUrl}\n\nThis link is valid for 15 minutes. If you did not request this, please ignore this email and your password will remain unchanged.\n`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center; margin-bottom: 24px;">CodeNex Password Reset</h2>
        <p>Hello,</p>
        <p>You are receiving this email because you (or someone else) requested a password reset for your CodeNex account.</p>
        <p>Please click the button below to reset your password. This link is valid for <strong>15 minutes</strong>:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #4f46e5;"><a href="${resetUrl}">${resetUrl}</a></p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777;">If you did not request this password reset, please ignore this email. Your password will remain secure and unchanged.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "CodeNex Password Reset Request",
        message,
        html,
      });

      res.json({
        success: true,
        message: "Password reset link has been sent to your email.",
      });
    } catch (err) {
      console.error("❌ SMTP sending failed. Error details:", err);
      
      if (process.env.NODE_ENV !== "development") {
        return res.status(500).json({
          success: false,
          message: "Email could not be sent. Please try again later.",
        });
      }

      // Still return success in development so developer can use the link printed in console
      res.json({
        success: true,
        message: "Password reset link generated. Check console/logs.",
        resetUrlDev: resetUrl, // optionally share in dev mode
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    // Hash token from URL
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    const token = generateToken(user._id, user.role);
    res.json(formatAuthResponse(user, token));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { credential, email, name, picture, portalRole } = req.body;

    let userEmail = email;
    let userName = name;
    let userPicture = picture;

    // Decode JWT credential if sent directly from Google GSI
    if (credential) {
      try {
        const base64Url = credential.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const payload = JSON.parse(jsonPayload);
        userEmail = payload.email || userEmail;
        userName = payload.name || payload.given_name || userName;
        userPicture = payload.picture || userPicture;
      } catch (e) {
        console.warn("Could not parse Google ID token payload:", e);
      }
    }

    if (!userEmail) {
      return res.status(400).json({ success: false, message: "Invalid Google account data" });
    }

    const cleanEmail = userEmail.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    const targetRole = portalRole === "user" ? "student" : (portalRole || "student");

    // SECURITY: Reject unknown Google accounts attempting to access Admin or Mentor portals
    if (targetRole === "admin" || targetRole === "mentor") {
      if (!user) {
        return res.status(403).json({
          success: false,
          message: `Access denied. No ${targetRole} account found for this Google email.`,
        });
      }

      const actualRole = user.role === "user" ? "student" : user.role;
      if (actualRole !== targetRole) {
        return res.status(403).json({
          success: false,
          message: `Access denied. This email is registered as a ${actualRole}, not a ${targetRole}.`,
        });
      }
    }

    // SECURITY: Ensure admins/mentors logging in from student portal are redirected to their respective portals
    if (targetRole === "student" && user) {
      const actualRole = user.role === "user" ? "student" : user.role;
      if (actualRole !== "student") {
        return res.status(403).json({
          success: false,
          message: `Access denied. This portal is for student accounts. Please sign in via the ${actualRole.charAt(0).toUpperCase() + actualRole.slice(1)} Portal.`,
        });
      }
    }

    // Create new account ONLY if accessed via Student portal
    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString("hex");
      user = await User.create({
        fullName: userName || cleanEmail.split("@")[0],
        email: cleanEmail,
        password: randomPassword,
        role: "user", // ALWAYS Student for public signups
        avatar: userPicture || "",
        profileImageUrl: userPicture || "",
      });
    } else if (userPicture && !user.avatar) {
      user.avatar = userPicture;
      await user.save();
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Your account has been deactivated" });
    }

    const token = generateToken(user._id, user.role);
    res.json(formatAuthResponse(user, token));
  } catch (err) {
    console.error("Google Auth error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  googleAuth,
};
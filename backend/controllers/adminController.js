const User = require("../models/User");
const Course = require("../models/Course");
const Problem = require("../models/Problem");
const Submission = require("../models/Submission");

exports.getDashboard = async (_req, res) => {
  try {
    const mongoose = require("mongoose");
    const EnglishProgress = mongoose.models.EnglishProgress || require("../models/EnglishProgress");

    const [totalUsers, mentors, courses, problems, submissions, recentUsers, englishProgressCount] =
      await Promise.all([
        User.countDocuments({ role: "user" }),
        User.countDocuments({ role: "mentor" }),
        Course.countDocuments({ isPublished: true }),
        Problem.countDocuments({ isActive: true }),
        Submission.countDocuments({ status: "accepted" }),
        User.find().sort({ createdAt: -1 }).limit(5).select("fullName name email role createdAt"),
        EnglishProgress ? EnglishProgress.countDocuments() : Promise.resolve(0),
      ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const userGrowthData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthUsers = await User.countDocuments({
        createdAt: { $gte: d, $lt: nextMonth }
      });
      userGrowthData.push({
        month: months[d.getMonth()],
        users: monthUsers,
      });
    }

    const categoryData = [
      { name: "Coding Submissions", count: submissions },
      { name: "English Activity", count: englishProgressCount },
      { name: "Published Courses", count: courses },
      { name: "Practice Problems", count: problems },
      { name: "Active Mentors", count: mentors },
    ];

    const stats = [
      { label: "Total Users", value: totalUsers.toLocaleString() },
      { label: "Active Courses", value: String(courses) },
      { label: "Mentors", value: String(mentors) },
      { label: "Problems", value: String(problems) },
    ];

    const recentActivity = recentUsers.map((u) => ({
      text: `New ${u.role} registered: ${u.email}`,
      time: u.createdAt,
      type: u.role,
    }));

    res.json({
      success: true,
      stats,
      revenueData: userGrowthData,
      categoryData,
      recentActivity,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { fullName: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users: users.map((u) => ({
        id: u._id,
        ...u.toPublicProfile(),
        isActive: u.isActive,
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { role, isActive, assignedMentor } = req.body;
    const updates = {};

    if (role && ["admin", "mentor", "user"].includes(role)) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;
    if (assignedMentor !== undefined) {
      updates.assignedMentor = (assignedMentor === "" || assignedMentor === "null" || assignedMentor === null) ? null : assignedMentor;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: user.toPublicProfile() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAnalytics = async (_req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [newUsers, submissions, topCourses] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Submission.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Course.find().sort({ students: -1 }).limit(5).select("title students rating"),
    ]);

    res.json({
      success: true,
      analytics: {
        newUsersLast30Days: newUsers,
        submissionsLast30Days: submissions,
        topCourses,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { fullName, email, role, phone, tempPassword } = req.body;
    if (!fullName || !email || !role) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    const rawPassword = tempPassword || `CodeNex#${Math.floor(1000 + Math.random() * 9000)}`;
    const user = await User.create({
      fullName,
      email: cleanEmail,
      role: role === "student" ? "user" : role,
      phone: phone || "",
      password: rawPassword,
    });

    const portalName = role === "admin" ? "Admin Portal" : role === "mentor" ? "Mentor Portal" : "Student Portal";
    const loginPath = role === "admin" ? "/admin/login" : role === "mentor" ? "/mentor/login" : "/login";
    const loginUrl = `${process.env.CLIENT_URL || "http://localhost:8080"}${loginPath}`;

    const sendEmail = require("../utils/sendEmail");
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 8px; background-color: #0f172a; color: #f8fafc;">
        <h2 style="color: #8b5cf6; text-align: center; margin-bottom: 20px;">Welcome to CodeNex ${portalName}</h2>
        <p>Hello <strong>${fullName}</strong>,</p>
        <p>An account has been created for you on CodeNex with the role of <strong>${role.toUpperCase()}</strong>.</p>
        <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155;">
          <p style="margin: 5px 0;"><strong>Login Email:</strong> ${cleanEmail}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="color: #38bdf8; font-size: 14px;">${rawPassword}</code></p>
        </div>
        <p>Please log in using the link below and set/update your credentials:</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${loginUrl}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Access ${portalName}</a>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: cleanEmail,
        subject: `Welcome to CodeNex - Your ${portalName} Account Details`,
        message: `Welcome to CodeNex. Your account has been created. Email: ${cleanEmail}, Password: ${rawPassword}. Login link: ${loginUrl}`,
        html,
      });
    } catch (emailErr) {
      console.warn("Onboarding email notification failed (user created successfully):", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: `${role.toUpperCase()} account created successfully. Credentials sent to ${cleanEmail}.`,
      user: user.toPublicProfile(),
      tempPassword: rawPassword,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

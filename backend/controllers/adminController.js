const User = require("../models/User");
const Course = require("../models/Course");
const Problem = require("../models/Problem");
const Submission = require("../models/Submission");

exports.getDashboard = async (_req, res) => {
  try {
    const [totalUsers, mentors, courses, problems, submissions, recentUsers] =
      await Promise.all([
        User.countDocuments({ role: "user" }),
        User.countDocuments({ role: "mentor" }),
        Course.countDocuments({ isPublished: true }),
        Problem.countDocuments({ isActive: true }),
        Submission.countDocuments({ status: "accepted" }),
        User.find().sort({ createdAt: -1 }).limit(5).select("fullName email role createdAt"),
      ]);

    const revenueData = [
      { month: "Jan", revenue: 180000, users: 800 },
      { month: "Feb", revenue: 220000, users: 1200 },
      { month: "Mar", revenue: 310000, users: 1800 },
      { month: "Apr", revenue: 280000, users: 2100 },
      { month: "May", revenue: 420000, users: 2800 },
      { month: "Jun", revenue: 380000, users: 3200 },
      { month: "Jul", revenue: 520000, users: 4100 },
    ];

    const categoryData = [
      { name: "Coding", count: submissions },
      { name: "Aptitude", count: Math.floor(totalUsers * 0.4) },
      { name: "English", count: Math.floor(totalUsers * 0.3) },
      { name: "Courses", count: courses * 10 },
      { name: "Games", count: Math.floor(totalUsers * 0.15) },
    ];

    const stats = [
      { label: "Total Users", value: totalUsers.toLocaleString(), change: "+12%" },
      { label: "Active Courses", value: String(courses), change: "+8%" },
      { label: "Mentors", value: String(mentors), change: "+5%" },
      { label: "Problems", value: String(problems), change: "+3%" },
    ];

    const recentActivity = recentUsers.map((u) => ({
      text: `New ${u.role} signup: ${u.email}`,
      time: u.createdAt,
      type: u.role,
    }));

    res.json({
      success: true,
      stats,
      revenueData,
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
    const { fullName, email, role, phone } = req.body;
    if (!fullName || !email || !role) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }
    const bcrypt = require("bcryptjs");
    const password = await bcrypt.hash("password123", 10);
    const user = await User.create({
      fullName,
      email,
      role,
      phone: phone || "",
      password,
    });
    res.status(201).json({ success: true, user: user.toPublicProfile() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

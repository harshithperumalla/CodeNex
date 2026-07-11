const User = require("../models/User");
const Submission = require("../models/Submission");
const Course = require("../models/Course");

// Self-healing LeetCode-style streak logic
const updateUserStreak = (user) => {
  user.lastActiveAt = new Date();
  
  if (!user.completedDates || user.completedDates.length === 0) {
    user.streak = 0;
    return;
  }

  const dateSet = new Set(user.completedDates);
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const hasToday = dateSet.has(todayStr);
  const hasYesterday = dateSet.has(yesterdayStr);

  if (!hasToday && !hasYesterday) {
    user.streak = 0;
  } else {
    let currentStreak = 0;
    let checkDate = hasToday ? new Date(today) : new Date(yesterday);
    let safetyCounter = 0;
    while (safetyCounter < 1000) {
      const checkStr = checkDate.toISOString().split("T")[0];
      if (dateSet.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
        safetyCounter++;
      } else {
        break;
      }
    }
    user.streak = currentStreak;
  }
};

const checkAndAwardBadges = (user) => {
  const badgeMap = [
    { name: "First Course Completed", check: () => user.coursesWatched >= 1 },
    { name: "First Coding Problem", check: () => user.codingSolved >= 1 },
    { name: "10 Coding Problems", check: () => user.codingSolved >= 10 },
    { name: "25 Coding Problems", check: () => user.codingSolved >= 25 },
    { name: "50 Coding Problems", check: () => user.codingSolved >= 50 },
    { name: "100 Coding Problems", check: () => user.codingSolved >= 100 },
    { name: "250 Coding Problems", check: () => user.codingSolved >= 250 },
    { name: "500 Coding Problems", check: () => user.codingSolved >= 500 },
    { name: "1000 Coding Problems", check: () => user.codingSolved >= 1000 },
    { name: "First Aptitude Quiz", check: () => user.aptitudeCompleted >= 1 },
    { name: "Aptitude Beginner", check: () => user.aptitudeCompleted >= 5 },
    { name: "Aptitude Intermediate", check: () => user.aptitudeCompleted >= 15 },
    { name: "Aptitude Master", check: () => user.aptitudeCompleted >= 30 },
    { name: "7-Day Streak", check: () => user.streak >= 7 },
    { name: "15-Day Streak", check: () => user.streak >= 15 },
    { name: "30-Day Streak", check: () => user.streak >= 30 },
    { name: "100-Day Streak", check: () => user.streak >= 100 },
    { name: "First Meeting", check: () => (user.meetingsAttended || 0) >= 1 },
    { name: "First Certificate", check: () => (user.certificatesEarned || 0) >= 1 },
  ];

  if (!user.badgesEarned) user.badgesEarned = [];
  badgeMap.forEach((badge) => {
    if (badge.check() && !user.badgesEarned.includes(badge.name)) {
      user.badgesEarned.push(badge.name);
    }
  });
};

const updateUserRank = async (user) => {
  const count = await User.countDocuments({
    role: "user",
    isActive: true,
    $or: [
      { points: { $gt: user.points } },
      { points: user.points, codingSolved: { $gt: user.codingSolved } }
    ]
  });
  user.rank = count + 1;
};

exports.getDashboard = async (req, res) => {
  try {
    const user = req.user;
    
    // Always self-heal streak on dashboard load
    updateUserStreak(user);
    await user.save();

    const enrollments = user.enrollments || [];

    const courseIds = enrollments.map((e) => e.course);
    const courses = await Course.find({ _id: { $in: courseIds } }).lean();

    const recentCourses = enrollments
      .map((enrollment) => {
        const course = courses.find((c) => c._id.toString() === enrollment.course.toString());
        if (!course) return null;
        return { name: course.title, progress: enrollment.progress };
      })
      .filter(Boolean)
      .slice(0, 5);

    const recentSubmissions = await Submission.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("problem", "title difficulty points")
      .lean();

    // Calculate dynamic weekly activity from MongoDB submissions
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const submissionsLast7Days = await Submission.find({
      user: user._id,
      createdAt: { $gte: sevenDaysAgo },
    }).lean();

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyActivity = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = daysOfWeek[d.getDay()];
      
      const codSolves = submissionsLast7Days.filter(sub => {
        const subDate = new Date(sub.createdAt);
        return subDate.getFullYear() === d.getFullYear() &&
               subDate.getMonth() === d.getMonth() &&
               subDate.getDate() === d.getDate() &&
               sub.status === "accepted";
      }).length;

      const isToday = d.getDate() === new Date().getDate() &&
                      d.getMonth() === new Date().getMonth() &&
                      d.getFullYear() === new Date().getFullYear();
      const aptSolves = isToday ? (user.completedAptitude ? user.completedAptitude.length % 3 : 0) : 0;

      weeklyActivity.push({
        day: dayName,
        coding: codSolves,
        aptitude: aptSolves,
      });
    }

    const rankHistory = [
      { week: "W1", rank: Math.max(1, user.rank + 18) },
      { week: "W2", rank: Math.max(1, user.rank + 11) },
      { week: "W3", rank: Math.max(1, user.rank + 5) },
      { week: "W4", rank: user.rank || 1 },
    ];

    const stats = [
      { label: "Problems Solved", value: String(user.codingSolved), key: "codingSolved" },
      { label: "Aptitude Score", value: `${Math.min(100, user.aptitudeCompleted * 2)}%`, key: "aptitude" },
      { label: "Courses Done", value: String(user.coursesWatched), key: "courses" },
      { label: "Current Rank", value: user.rank ? `#${user.rank}` : "—", key: "rank" },
      { label: "Total Points", value: user.points.toLocaleString(), key: "points" },
      { label: "Streak Days", value: String(user.streak), key: "streak" },
    ];

    res.json({
      success: true,
      profile: user.toPublicProfile(),
      stats,
      weeklyActivity,
      rankHistory,
      recentCourses,
      recentSubmissions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.completeAptitude = async (req, res) => {
  try {
    const { categoryId, conceptId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const key = `${categoryId}/${conceptId}`;
    if (!user.completedAptitude) user.completedAptitude = [];
    const alreadyCompleted = user.completedAptitude.includes(key);

    if (!alreadyCompleted) {
      user.completedAptitude.push(key);
      user.aptitudeCompleted += 1;
      user.points += 50;

      updateUserStreak(user);
      checkAndAwardBadges(user);
      await updateUserRank(user);
      
      await user.save();
    }

    res.json({
      success: true,
      user: user.toPublicProfile(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.completeDailyQuiz = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.points += 50;

    updateUserStreak(user);
    checkAndAwardBadges(user);
    await updateUserRank(user);

    await user.save();

    res.json({
      success: true,
      user: user.toPublicProfile(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.completeTypingTest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.typingTests += 1;
    user.points += 20;

    updateUserStreak(user);
    checkAndAwardBadges(user);
    await updateUserRank(user);

    await user.save();

    res.json({
      success: true,
      user: user.toPublicProfile(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Expose internal helpers for code runner calls
exports.updateUserStreakHelper = updateUserStreak;
exports.checkAndAwardBadgesHelper = checkAndAwardBadges;
exports.updateUserRankHelper = updateUserRank;

exports.getProfile = async (req, res) => {
  res.json({ success: true, user: req.user.toPublicProfile() });
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = [
      "fullName", "name", "phone", "college", "degree", "yearOfStudy",
      "skills", "interests", "hobbies", "location", "about",
      "github", "linkedin", "portfolio", "avatar", "profileImageUrl",
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({ success: true, user: user.toPublicProfile() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: "user", isActive: true })
      .sort({ points: -1, codingSolved: -1 })
      .limit(50)
      .select("fullName name points codingSolved streak rank avatar");

    const leaderboard = users.map((u, index) => ({
      rank: index + 1,
      userId: u._id,
      name: u.name || u.fullName,
      points: u.points,
      problemsSolved: u.codingSolved,
      streak: u.streak,
      avatar: u.avatar,
    }));

    res.json({ success: true, leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const Session = require("../models/Session");
    const sessions = await Session.find({
      $or: [
        { student: req.user._id },
        { student: { $exists: false } },
        { student: null }
      ]
    }).populate("mentor", "fullName email").sort({ scheduledAt: 1 });

    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.attendSession = async (req, res) => {
  try {
    const Session = require("../models/Session");
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const user = await User.findById(req.user._id);
    user.meetingsAttended = (user.meetingsAttended || 0) + 1;
    user.points += 50;

    updateUserStreak(user);
    checkAndAwardBadges(user);
    await updateUserRank(user);

    await user.save();

    session.status = "completed";
    await session.save();

    res.json({
      success: true,
      message: "Attendance marked successfully!",
      user: user.toPublicProfile()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" }).select(
      "fullName email phone skills badgesEarned about avatar college degree yearOfStudy"
    );

    const mappedMentors = mentors.map((m) => {
      const skills = m.skills && m.skills.length ? m.skills : ["React", "Node.js", "DSA", "System Design"];
      return {
        _id: m._id,
        fullName: m.fullName,
        email: m.email,
        phone: m.phone,
        skills: skills,
        badgesEarned: m.badgesEarned,
        about: m.about || "Senior Developer & DSA Instructor at CodeNex.",
        avatar: m.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${m.fullName}`,
        college: m.college || "IIT Bombay",
        degree: m.degree || "M.Tech CSE",
        yearOfStudy: m.yearOfStudy || "Alumnus"
      };
    });

    res.json({ success: true, mentors: mappedMentors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bookSession = async (req, res) => {
  try {
    const Session = require("../models/Session");
    const { mentorId, title, description, scheduledAt, durationMinutes } = req.body;

    if (!mentorId || !title || !scheduledAt) {
      return res.status(400).json({ success: false, message: "Mentor, title, and scheduling date are required" });
    }

    const mentorObj = await User.findById(mentorId);
    if (!mentorObj || mentorObj.role !== "mentor") {
      return res.status(404).json({ success: false, message: "Mentor not found" });
    }

    const session = await Session.create({
      mentor: mentorId,
      student: req.user._id,
      title: title,
      description: description || "1:1 Mentorship Session",
      scheduledAt: new Date(scheduledAt),
      durationMinutes: durationMinutes || 45,
      status: "scheduled",
      meetingLink: `https://meet.jit.si/codenex-session-${Math.random().toString(36).substring(2, 9)}`,
    });

    res.status(201).json({
      success: true,
      message: "Session booked successfully!",
      session,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

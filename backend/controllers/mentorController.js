const User = require("../models/User");
const Course = require("../models/Course");
const Session = require("../models/Session");

exports.getDashboard = async (req, res) => {
  try {
    const [myCourses, sessions, students] = await Promise.all([
      Course.find({ instructorId: req.user._id }),
      Session.find({ mentor: req.user._id }).sort({ scheduledAt: 1 }).limit(10),
      User.find({ role: "user" }).select("fullName email codingSolved points streak").limit(20),
    ]);

    res.json({
      success: true,
      stats: {
        courses: myCourses.length,
        upcomingSessions: sessions.filter((s) => s.status === "scheduled").length,
        totalStudents: students.length,
      },
      courses: myCourses,
      upcomingSessions: sessions,
      students: students.map((s) => ({
        id: s._id,
        name: s.fullName,
        email: s.email,
        problemsSolved: s.codingSolved,
        points: s.points,
        streak: s.streak,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ mentor: req.user._id })
      .populate("student", "fullName email")
      .sort({ scheduledAt: 1 });

    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSession = async (req, res) => {
  try {
    const { title, description, scheduledAt, durationMinutes, studentId, meetingLink } =
      req.body;

    if (!title || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Title and scheduledAt are required",
      });
    }

    const session = await Session.create({
      mentor: req.user._id,
      student: studentId || undefined,
      title,
      description,
      scheduledAt,
      durationMinutes: durationMinutes || 60,
      meetingLink,
    });

    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, mentor: req.user._id },
      req.body,
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      mentor: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    res.json({ success: true, message: "Session cancelled" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentProgress = async (req, res) => {
  try {
    const students = await User.find({ role: "user" })
      .select("fullName email codingSolved aptitudeCompleted coursesWatched points streak enrollments")
      .populate("enrollments.course", "title");

    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

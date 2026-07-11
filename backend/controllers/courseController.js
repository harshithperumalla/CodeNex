const Course = require("../models/Course");
const User = require("../models/User");

const mapCourseForUser = (course, user) => {
  const enrollment = user?.enrollments?.find(
    (e) => e.course.toString() === course._id.toString()
  );

  return {
    id: course._id,
    title: course.title,
    instructor: course.instructor,
    price: course.priceDisplay || `₹${course.price}`,
    rating: course.rating,
    students: course.students,
    tag: enrollment ? "Enrolled" : course.tag,
    progress: enrollment ? enrollment.progress : null,
    description: course.description,
    category: course.category,
    lessons: course.lessons,
    duration: course.duration,
  };
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).sort({ createdAt: -1 });
    const user = req.user
      ? await User.findById(req.user._id)
      : null;

    res.json({
      success: true,
      courses: courses.map((c) => mapCourseForUser(c, user)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const user = req.user ? await User.findById(req.user._id) : null;

    res.json({ success: true, course: mapCourseForUser(course, user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const user = await User.findById(req.user._id);
    const alreadyEnrolled = user.enrollments.some(
      (e) => e.course.toString() === course._id.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: "Already enrolled in this course" });
    }

    user.enrollments.push({ course: course._id, progress: 0 });
    user.coursesWatched += 1;
    await user.save();

    course.students += 1;
    await course.save();

    res.status(201).json({
      success: true,
      message: `Enrolled in ${course.title}`,
      course: mapCourseForUser(course, user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({ success: false, message: "Progress must be between 0 and 100" });
    }

    const user = await User.findById(req.user._id);
    const enrollment = user.enrollments.find(
      (e) => e.course.toString() === req.params.id
    );

    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Not enrolled in this course" });
    }

    const wasCompleted = enrollment.progress === 100;
    enrollment.progress = progress;

    if (progress === 100 && !wasCompleted) {
      user.certificatesEarned = (user.certificatesEarned || 0) + 1;
      user.points += 200; // award 200 points for course completion

      const { checkAndAwardBadgesHelper, updateUserRankHelper } = require("./userController");
      if (checkAndAwardBadgesHelper) checkAndAwardBadgesHelper(user);
      if (updateUserRankHelper) await updateUserRankHelper(user);
    }

    await user.save();

    res.json({ success: true, progress, user: user.toPublicProfile() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create({
      ...req.body,
      instructorId: req.user._id,
      instructor: req.body.instructor || req.user.fullName,
    });

    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

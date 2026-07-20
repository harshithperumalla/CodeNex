const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");

// Helper to count total lessons in course
const countTotalLessons = (course) => {
  if (!course.modules || course.modules.length === 0) {
    return course.lessons || 0;
  }
  return course.modules.reduce((sum, mod) => sum + (mod.lessons ? mod.lessons.length : 0), 0);
};

// POST /api/course-management/:id/enroll (1-Click Instant Free Student Enrollment)
exports.enrollCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Check if user is already enrolled
    let existingEnrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: "You are already enrolled in this course" });
    }

    // Create Enrollment document in MongoDB
    const enrollment = await Enrollment.create({
      user: req.user._id,
      course: courseId,
      progress: 0,
      completedLessons: [],
    });

    // Update User document
    const user = await User.findById(req.user._id);
    if (user) {
      if (!user.enrollments.some((e) => e.course.toString() === courseId)) {
        user.enrollments.push({ course: courseId, progress: 0 });
        user.coursesWatched += 1;
        await user.save();
      }
    }

    // Set real-time Course enrolled students count
    const actualEnrollmentCount = await Enrollment.countDocuments({ course: courseId });
    course.students = actualEnrollmentCount;
    await course.save();

    res.status(201).json({
      success: true,
      message: `🎉 Successfully enrolled in ${course.title}!`,
      enrollment,
    });
  } catch (err) {
    console.error("Enrollment error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to enroll in course" });
  }
};

// GET /api/course-management/:id/students (Admin View Enrolled Students for a Course)
exports.getCourseEnrolledStudents = async (req, res) => {
  try {
    const courseId = req.params.id;
    const enrollments = await Enrollment.find({ course: courseId })
      .populate("user", "fullName email avatar profileImageUrl points streak createdAt")
      .sort({ createdAt: -1 });

    const students = enrollments.map((e) => ({
      enrollmentId: e._id,
      studentId: e.user ? e.user._id : null,
      name: e.user ? e.user.fullName : "Unknown Student",
      email: e.user ? e.user.email : "",
      avatar: e.user ? e.user.avatar || e.user.profileImageUrl : "",
      progress: e.progress,
      isCompleted: e.isCompleted,
      enrolledAt: e.createdAt,
      completedLessonsCount: e.completedLessons ? e.completedLessons.length : 0,
    }));

    res.json({ success: true, count: students.length, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/course-management/enrollments (Admin View All Enrollments)
exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("user", "fullName email")
      .populate("course", "title category courseType thumbnail price")
      .sort({ createdAt: -1 });

    const formatted = enrollments.map((e) => ({
      id: e._id,
      studentName: e.user ? e.user.fullName : "Unknown",
      studentEmail: e.user ? e.user.email : "",
      courseTitle: e.course ? e.course.title : "Course",
      courseType: e.course ? e.course.courseType || "FREE" : "FREE",
      progress: e.progress,
      isCompleted: e.isCompleted,
      enrolledAt: e.createdAt ? e.createdAt.toISOString() : new Date().toISOString(),
    }));

    res.json({ success: true, enrollments: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/course-management/admin (Admin view of all courses)
exports.getAdminCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).sort({ createdAt: -1 });

    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const totalEnrollments = await Enrollment.countDocuments({ course: course._id });

        return {
          id: course._id,
          _id: course._id,
          title: course.title,
          instructor: course.instructor,
          courseType: course.courseType || "FREE",
          price: course.price || 0,
          priceDisplay: course.courseType === "FREE" ? "FREE" : `₹${course.price}`,
          rating: course.rating,
          students: totalEnrollments,
          tag: course.tag,
          category: course.category,
          thumbnail: course.thumbnail,
          duration: course.duration,
          lessonsCount: countTotalLessons(course),
          modulesCount: course.modules ? course.modules.length : 0,
          modules: course.modules || [],
          isPublished: course.isPublished,
          createdAt: course.createdAt,
        };
      })
    );

    res.json({ success: true, courses: coursesWithStats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/course-management/public (Student view of published courses)
exports.getPublicCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).sort({ createdAt: -1 });
    const userEnrollments = req.user
      ? await Enrollment.find({ user: req.user._id })
      : [];

    const formatted = await Promise.all(
      courses.map(async (course) => {
        const enrollment = userEnrollments.find(
          (e) => e.course.toString() === course._id.toString()
        );
        const totalEnrollments = await Enrollment.countDocuments({ course: course._id });

        return {
          id: course._id,
          _id: course._id,
          title: course.title,
          instructor: course.instructor,
          description: course.description,
          courseType: course.courseType || "FREE",
          price: course.price || 0,
          priceDisplay: course.courseType === "FREE" ? "FREE" : `₹${course.price}`,
          rating: course.rating,
          students: totalEnrollments,
          tag: enrollment ? "Enrolled" : course.tag,
          category: course.category,
          thumbnail: course.thumbnail,
          duration: course.duration,
          lessonsCount: countTotalLessons(course),
          modulesCount: course.modules ? course.modules.length : 0,
          isEnrolled: !!enrollment,
          progress: enrollment ? enrollment.progress : null,
          completedLessons: enrollment ? enrollment.completedLessons : [],
        };
      })
    );

    res.json({ success: true, courses: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/course-management/details/:id (Full course details & workspace)
exports.getCourseDetails = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const enrollment = req.user
      ? await Enrollment.findOne({ user: req.user._id, course: course._id })
      : null;

    const isEnrolled = !!enrollment;

    // Format modules & lessons for client - access allowed ONLY if student is enrolled or admin
    const modules = (course.modules || []).map((mod) => ({
      id: mod._id,
      _id: mod._id,
      title: mod.title,
      description: mod.description,
      order: mod.order,
      lessons: (mod.lessons || []).map((les) => {
        const canAccess = isEnrolled || les.isFreePreview || req.user?.role === "admin";
        return {
          id: les._id,
          _id: les._id,
          title: les.title,
          description: les.description,
          duration: les.duration,
          videoType: les.videoType,
          videoUrl: canAccess ? les.videoUrl : "",
          publicId: les.publicId,
          pdfs: canAccess ? les.pdfs : [],
          notes: canAccess ? les.notes : "",
          isFreePreview: les.isFreePreview,
          order: les.order,
          isCompleted: enrollment ? enrollment.completedLessons.includes(les._id.toString()) : false,
        };
      }),
    }));

    res.json({
      success: true,
      course: {
        id: course._id,
        _id: course._id,
        title: course.title,
        instructor: course.instructor,
        description: course.description,
        courseType: course.courseType || "FREE",
        price: course.price || 0,
        rating: course.rating,
        students: course.students,
        tag: course.tag,
        category: course.category,
        thumbnail: course.thumbnail,
        duration: course.duration,
        isPublished: course.isPublished,
        modules,
        isEnrolled,
        progress: enrollment ? enrollment.progress : null,
        completedLessons: enrollment ? enrollment.completedLessons : [],
        isCompleted: enrollment ? enrollment.isCompleted : false,
        certificateId: enrollment ? enrollment.certificateId : "",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/course-management (Admin Create Course)
exports.createCourse = async (req, res) => {
  try {
    const { title, courseType, price, category, thumbnail, description, tag, isPublished, modules } = req.body;

    const course = await Course.create({
      title: title || "New Course",
      instructor: req.body.instructor || req.user.fullName || "Admin",
      instructorId: req.user._id,
      courseType: courseType || "FREE",
      price: price !== undefined ? Number(price) : 0,
      category: category || "Programming",
      thumbnail: thumbnail || "💻",
      description: description || "",
      tag: tag || "New",
      isPublished: isPublished !== undefined ? isPublished : true,
      modules: modules || [],
    });

    course.lessons = countTotalLessons(course);
    await course.save();

    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/course-management/:id (Admin Update Course & Modules/Lessons)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const { title, courseType, price, category, thumbnail, description, tag, isPublished, modules, duration } = req.body;

    if (title !== undefined) course.title = title;
    if (courseType !== undefined) course.courseType = courseType;
    if (price !== undefined) course.price = Number(price);
    if (category !== undefined) course.category = category;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (description !== undefined) course.description = description;
    if (tag !== undefined) course.tag = tag;
    if (isPublished !== undefined) course.isPublished = isPublished;
    if (duration !== undefined) course.duration = duration;
    if (modules !== undefined) course.modules = modules;

    course.lessons = countTotalLessons(course);
    await course.save();

    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/course-management/:id/publish (Toggle Publish/Unpublish)
exports.togglePublishStatus = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.json({
      success: true,
      message: `Course is now ${course.isPublished ? "Published" : "Unpublished"}`,
      isPublished: course.isPublished,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/course-management/:id (Admin Delete Course)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    // Clean up enrollments
    await Enrollment.deleteMany({ course: req.params.id });

    res.json({ success: true, message: "Course and related enrollments deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/course-management/:id/lesson-progress (Student toggle lesson completion)
exports.toggleLessonProgress = async (req, res) => {
  try {
    const { lessonId, isCompleted } = req.body;
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    let enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (!enrollment) {
      return res.status(404).json({ success: false, message: "You are not enrolled in this course" });
    }

    let completedList = [...(enrollment.completedLessons || [])];

    if (isCompleted) {
      if (!completedList.includes(lessonId)) completedList.push(lessonId);
    } else {
      completedList = completedList.filter((id) => id !== lessonId);
    }

    const totalLessons = countTotalLessons(course);
    const progress = totalLessons > 0 ? Math.round((completedList.length / totalLessons) * 100) : 100;

    enrollment.completedLessons = completedList;
    enrollment.progress = progress;

    let certUnlocked = false;
    if (progress === 100 && !enrollment.isCompleted) {
      enrollment.isCompleted = true;
      enrollment.completedAt = new Date();
      enrollment.certificateId = `CNX-${courseId.substring(0, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      certUnlocked = true;

      // Update User profile certificates & points
      const user = await User.findById(req.user._id);
      if (user) {
        user.certificatesEarned = (user.certificatesEarned || 0) + 1;
        user.points += 200; // Award completion points
        await user.save();
      }
    }

    await enrollment.save();

    // Sync progress with User.enrollments array
    const user = await User.findById(req.user._id);
    if (user) {
      const userEnr = user.enrollments.find((e) => e.course.toString() === courseId);
      if (userEnr) {
        userEnr.progress = progress;
        await user.save();
      }
    }

    res.json({
      success: true,
      progress,
      completedLessons: completedList,
      isCompleted: enrollment.isCompleted,
      certificateId: enrollment.certificateId,
      certUnlocked,
      user: user ? user.toPublicProfile() : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/course-management/analytics (Admin Course & Enrollment Analytics)
exports.getCourseAnalytics = async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const totalEnrollments = await Enrollment.countDocuments();
    const completedEnrollments = await Enrollment.countDocuments({ isCompleted: true });

    // Category distribution
    const courses = await Course.find();
    const categoryCounts = {};
    courses.forEach((c) => {
      const cat = c.category || "Other";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categoryData = Object.keys(categoryCounts).map((cat) => ({
      name: cat,
      count: categoryCounts[cat],
    }));

    res.json({
      success: true,
      stats: {
        totalCourses,
        publishedCourses,
        totalEnrollments,
        completedEnrollments,
        completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      },
      categoryData,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

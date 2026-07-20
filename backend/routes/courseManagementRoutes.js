const express = require("express");
const router = express.Router();
const {
  getAdminCourses,
  getPublicCourses,
  getCourseDetails,
  createCourse,
  updateCourse,
  togglePublishStatus,
  deleteCourse,
  enrollCourse,
  getCourseEnrolledStudents,
  getAllEnrollments,
  toggleLessonProgress,
  getCourseAnalytics,
} = require("../controllers/courseManagementController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Public / Student routes
router.get("/public", protect, getPublicCourses);
router.get("/details/:id", protect, getCourseDetails);
router.post("/:id/enroll", protect, enrollCourse);
router.put("/:id/lesson-progress", protect, toggleLessonProgress);

// Admin routes
router.get("/admin", protect, authorize("admin", "mentor"), getAdminCourses);
router.get("/analytics", protect, authorize("admin"), getCourseAnalytics);
router.get("/enrollments", protect, authorize("admin"), getAllEnrollments);
router.get("/:id/students", protect, authorize("admin", "mentor"), getCourseEnrolledStudents);
router.post("/", protect, authorize("admin", "mentor"), createCourse);
router.put("/:id", protect, authorize("admin", "mentor"), updateCourse);
router.patch("/:id/publish", protect, authorize("admin", "mentor"), togglePublishStatus);
router.delete("/:id", protect, authorize("admin"), deleteCourse);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourseById,
  enrollCourse,
  updateProgress,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/", protect, getCourses);
router.get("/:id", protect, getCourseById);
router.post("/:id/enroll", protect, enrollCourse);
router.put("/:id/progress", protect, updateProgress);

router.post("/", protect, authorize("admin", "mentor"), createCourse);
router.put("/:id", protect, authorize("admin", "mentor"), updateCourse);
router.delete("/:id", protect, authorize("admin"), deleteCourse);

module.exports = router;

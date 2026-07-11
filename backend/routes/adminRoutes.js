const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getUsers,
  updateUser,
  deleteUser,
  getAnalytics,
  createUser,
} = require("../controllers/adminController");
const {
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");
const { createProblem } = require("../controllers/codingController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect, authorize("admin"));

router.get("/dashboard", getDashboard);
router.get("/analytics", getAnalytics);
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);
router.post("/problems", createProblem);

module.exports = router;

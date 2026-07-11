const express = require("express");
const Student = require("../models/Student");

const router = express.Router();

// Create Student
router.post("/", async (req, res) => {
  const student = await Student.create(req.body);
  res.status(201).json(student);
});

// Get All Students
router.get("/", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

router.get("/:id", async (req, res) => {
  const student = await Student.findById(req.params.id);
  res.json(student);
});

router.put("/:id", async (req, res) => {
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(student);
});

router.delete("/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);

  res.json({
    message: "Student deleted successfully"
  });
});

module.exports = router;
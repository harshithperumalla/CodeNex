require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Course = require("../models/Course");
const Problem = require("../models/Problem");

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Problem.deleteMany({}),
  ]);

  const password = await bcrypt.hash("password123", 10);

  const admin = await User.create({
    fullName: "Admin User",
    email: "admin@codenex.io",
    phone: "+91 90000 00001",
    password,
    role: "admin",
    points: 0,
    rank: 1,
    badgesEarned: ["Admin"],
  });

  const mentor = await User.create({
    fullName: "Priya Sharma",
    email: "mentor@codenex.io",
    phone: "+91 90000 00002",
    password,
    role: "mentor",
    points: 5000,
    streak: 30,
    skills: ["React", "Node.js", "System Design"],
    badgesEarned: ["Mentor Pro"],
  });

  const student = await User.create({
    fullName: "Alex Johnson",
    email: "alex@codenex.io",
    phone: "+91 98765 43210",
    password,
    role: "user",
    streak: 14,
    points: 2850,
    rank: 12,
    codingSolved: 3,
    aptitudeCompleted: 34,
    coursesWatched: 2,
    typingTests: 23,
    college: "MIT University",
    degree: "B.Tech Computer Science",
    yearOfStudy: "3rd Year",
    skills: ["Java", "Python", "React", "Node.js", "SQL", "TypeScript"],
    interests: ["AI", "Web Development", "Data Science"],
    badgesEarned: ["First Code", "7-Day Streak", "Welcome"],
    about: "Passionate computer science student.",
    github: "https://github.com/alexjohnson",
    linkedin: "https://linkedin.com/in/alexjohnson",
  });

  const courses = await Course.insertMany([
    {
      title: "React Masterclass",
      instructor: "Aarav M.",
      instructorId: mentor._id,
      price: 999,
      priceDisplay: "₹999",
      rating: 4.8,
      students: 1240,
      tag: "Popular",
      lessons: 42,
      duration: "12h",
    },
    {
      title: "Node.js Backend Dev",
      instructor: "Priya S.",
      instructorId: mentor._id,
      price: 799,
      priceDisplay: "₹799",
      rating: 4.7,
      students: 890,
      tag: "New",
      lessons: 36,
      duration: "10h",
    },
    {
      title: "DSA with Java",
      instructor: "Rohan K.",
      price: 1499,
      priceDisplay: "₹1,499",
      rating: 4.9,
      students: 2100,
      tag: "Best Seller",
      lessons: 58,
      duration: "20h",
    },
    {
      title: "System Design",
      instructor: "Vikram T.",
      price: 1299,
      priceDisplay: "₹1,299",
      rating: 4.6,
      students: 650,
      tag: "Trending",
      lessons: 30,
      duration: "8h",
    },
    {
      title: "Python for ML",
      instructor: "Sneha P.",
      price: 1199,
      priceDisplay: "₹1,199",
      rating: 4.8,
      students: 1500,
      tag: "Trending",
      lessons: 45,
      duration: "15h",
    },
    {
      title: "Full-Stack MERN",
      instructor: "Amit R.",
      price: 1999,
      priceDisplay: "₹1,999",
      rating: 4.9,
      students: 3200,
      tag: "Best Seller",
      lessons: 72,
      duration: "25h",
    },
  ]);

  student.enrollments = [
    { course: courses[2]._id, progress: 78 },
    { course: courses[3]._id, progress: 45 },
  ];
  await student.save();

  const { problems } = require("./problemsData");
  const problemsToInsert = problems.map((p) => ({
    problemId: p.id,
    title: p.title,
    difficulty: p.difficulty,
    category: p.tags[0] || "Algorithms",
    topicCategory: p.category,
    description: p.description,
    leetcodeLink: p.leetcodeLink || "",
    gfgLink: p.gfgLink || "",
    diagram: p.diagram || "",
    explanation: p.explanation || "",
    examples: p.examples || [],
    constraints: p.constraints || [],
    tags: p.tags || [],
    companies: p.companies || [],
    acceptance: p.acceptance || 0,
    points: p.difficulty === "Easy" ? 10 : p.difficulty === "Medium" ? 20 : 30,
    starterCode: p.starterCode || {},
    testCases: (p.testCases || []).map(tc => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isHidden: false
    })),
  }));

  const seededProblems = await Problem.insertMany(problemsToInsert);

  console.log("\nSeed complete!\n");
  console.log("Demo accounts (password: password123):");
  console.log("  Admin:   admin@codenex.io");
  console.log("  Mentor:  mentor@codenex.io");
  console.log("  Student: alex@codenex.io");
  console.log(`\nSeeded ${courses.length} courses and ${seededProblems.length} coding problems.\n`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
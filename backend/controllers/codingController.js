const Problem = require("../models/Problem");
const Submission = require("../models/Submission");
const User = require("../models/User");
const mongoose = require("mongoose");
const { executeCode } = require("../utils/codeRunner");
const {
  updateUserStreakHelper,
  checkAndAwardBadgesHelper,
  updateUserRankHelper,
} = require("./userController");

const LANGUAGE_STATS = [
  { name: "Java", icon: "☕", problems: 45, color: "text-neon-orange" },
  { name: "Python", icon: "🐍", problems: 38, color: "text-neon-green" },
  { name: "C/C++", icon: "⚡", problems: 22, color: "text-neon-cyan" },
  { name: "JavaScript", icon: "🟨", problems: 52, color: "text-neon-yellow" },
  { name: "Frontend", icon: "🎨", problems: 18, color: "text-neon-pink" },
  { name: "Backend", icon: "🔧", problems: 28, color: "text-neon-purple" },
  { name: "SQL", icon: "🗃️", problems: 15, color: "text-neon-cyan" },
  { name: "DSA", icon: "🌳", problems: 65, color: "text-neon-green" },
];

const mapProblemList = (problem, solvedIds = []) => ({
  id: problem.problemId,
  _id: problem._id,
  title: problem.title,
  difficulty: problem.difficulty,
  category: problem.category,
  points: problem.points,
  acceptance: problem.acceptance,
  tags: problem.tags,
  solved: solvedIds.some((id) => id.toString() === problem._id.toString()),
});

exports.getLanguages = async (_req, res) => {
  res.json({ success: true, languages: LANGUAGE_STATS });
};

exports.getProblems = async (req, res) => {
  try {
    console.log("[getProblems] Called. Query:", req.query);
    const { difficulty, category, language, search } = req.query;
    const filter = { isActive: true };

    if (difficulty && difficulty !== "All") filter.difficulty = difficulty;
    if (category) filter.category = new RegExp(category, "i");
    if (language) filter.language = new RegExp(language, "i");
    if (search) filter.title = new RegExp(search, "i");

    console.log("[getProblems] Finding Problems with filter:", filter);
    const problems = await Problem.find(filter).sort({ problemId: 1 });
    console.log("[getProblems] Found", problems.length, "problems.");

    let solvedIds = [];
    if (req.user) {
      console.log("[getProblems] Fetching user solvedProblems for user:", req.user._id);
      const user = await User.findById(req.user._id).select("solvedProblems");
      solvedIds = user?.solvedProblems || [];
      console.log("[getProblems] Solved problem IDs count:", solvedIds.length);
    }

    res.json({
      success: true,
      problems: problems.map((p) => mapProblemList(p, solvedIds)),
      total: problems.length,
    });
  } catch (err) {
    console.error("[getProblems] Error occurred:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProblemById = async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId
      ? { _id: req.params.id }
      : { problemId: Number(req.params.id) || 0 };

    const problem = await Problem.findOne(query);

    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    let solved = false;
    if (req.user) {
      const user = await User.findById(req.user._id).select("solvedProblems");
      solved = user.solvedProblems.some((id) => id.toString() === problem._id.toString());
    }

    const visibleTests = problem.testCases.filter((t) => !t.isHidden);

    res.json({
      success: true,
      problem: {
        id: problem.problemId,
        _id: problem._id,
        title: problem.title,
        difficulty: problem.difficulty,
        category: problem.topicCategory,
        description: problem.description,
        examples: problem.examples,
        constraints: problem.constraints,
        tags: problem.tags,
        companies: problem.companies,
        acceptance: problem.acceptance,
        points: problem.points,
        starterCode: problem.starterCode,
        hints: problem.hints,
        complexity: problem.complexity,
        solutions: problem.solutions,
        concepts: problem.concepts,
        diagram: problem.diagram,
        explanation: problem.explanation,
        testCases: visibleTests,
        solved,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.submitSolution = async (req, res) => {
  try {
    const { code, language = "javascript" } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Code is required" });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId
      ? { _id: req.params.id }
      : { problemId: Number(req.params.id) || 0 };

    const problem = await Problem.findOne(query);

    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    const publicTests = problem.testCases.filter((t) => !t.isHidden);
    const testsToRun = publicTests.length ? publicTests : problem.testCases;

    const result = await executeCode(code, language, testsToRun, problem.problemId);

    const accepted = result.passed === result.total && result.total > 0;
    const alreadySolved = req.user.solvedProblems.some(
      (id) => id.toString() === problem._id.toString()
    );

    const submission = await Submission.create({
      user: req.user._id,
      problem: problem._id,
      language,
      code,
      status: accepted ? "accepted" : "wrong_answer",
      passedTests: result.passed,
      totalTests: result.total,
      pointsAwarded: accepted && !alreadySolved ? problem.points : 0,
    });

    if (accepted) {
      const user = await User.findById(req.user._id);
      const todayStr = new Date().toISOString().split("T")[0];
      user.completedDates.push(todayStr);

      if (!alreadySolved) {
        user.solvedProblems.push(problem._id);
        user.codingSolved += 1;
        user.points += problem.points;
      }
      
      updateUserStreakHelper(user);
      checkAndAwardBadgesHelper(user);
      await updateUserRankHelper(user);
      
      await user.save();
    }

    res.json({
      success: true,
      accepted,
      submission: {
        id: submission._id,
        status: submission.status,
        passedTests: result.passed,
        totalTests: result.total,
        results: result.results,
        pointsAwarded: submission.pointsAwarded,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("problem", "title difficulty problemId");

    res.json({ success: true, submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProblem = async (req, res) => {
  try {
    const last = await Problem.findOne().sort({ problemId: -1 });
    const problemId = last ? last.problemId + 1 : 1;

    const problem = await Problem.create({ ...req.body, problemId });
    res.status(201).json({ success: true, problem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.runCode = async (req, res) => {
  try {
    const { code, language = "javascript" } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Code is required" });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId
      ? { _id: req.params.id }
      : { problemId: Number(req.params.id) || 0 };

    const problem = await Problem.findOne(query);

    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    const publicTests = problem.testCases.filter((t) => !t.isHidden);
    const testsToRun = publicTests.length ? publicTests : problem.testCases;

    const result = await executeCode(code, language, testsToRun, problem.problemId);

    res.json({
      success: true,
      passed: result.passed,
      total: result.total,
      results: result.results,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyExternalSolution = async (req, res) => {
  try {
    const { platform, username, submissionLink } = req.body;

    if (!platform || !username || !submissionLink) {
      return res.status(400).json({ success: false, message: "Platform, username and submission link are required" });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId
      ? { _id: req.params.id }
      : { problemId: Number(req.params.id) || 0 };

    const problem = await Problem.findOne(query);

    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    // Validate link format
    const linkLower = submissionLink.toLowerCase();
    let validFormat = false;
    if (platform === "leetcode") {
      validFormat = linkLower.includes("leetcode.com");
    } else if (platform === "gfg") {
      validFormat = linkLower.includes("geeksforgeeks.org");
    }

    if (!validFormat) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid submission link format for ${platform === "leetcode" ? "LeetCode" : "GeeksforGeeks"}. Please check your link.`
      });
    }

    const alreadySolved = req.user.solvedProblems.some(
      (id) => id.toString() === problem._id.toString()
    );

    // Save submission record as "accepted" since it was verified externally
    const submission = await Submission.create({
      user: req.user._id,
      problem: problem._id,
      language: platform,
      code: `// Externally verified on ${platform.toUpperCase()}\n// Profile: ${username}\n// Link: ${submissionLink}`,
      status: "accepted",
      passedTests: problem.testCases ? problem.testCases.length : 1,
      totalTests: problem.testCases ? problem.testCases.length : 1,
      pointsAwarded: alreadySolved ? 0 : problem.points,
    });

    let userObj = await User.findById(req.user._id);
    const todayStr = new Date().toISOString().split("T")[0];
    userObj.completedDates.push(todayStr);

    if (!alreadySolved) {
      userObj.solvedProblems.push(problem._id);
      userObj.codingSolved += 1;
      userObj.points += problem.points;
    }

    updateUserStreakHelper(userObj);
    checkAndAwardBadgesHelper(userObj);
    await updateUserRankHelper(userObj);

    await userObj.save();

    res.json({
      success: true,
      message: "External solution verified successfully!",
      user: userObj.toPublicProfile(),
      submission: {
        id: submission._id,
        status: submission.status,
        pointsAwarded: submission.pointsAwarded,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

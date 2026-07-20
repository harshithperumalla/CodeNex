const axios = require("axios");
const Problem = require("../models/Problem");
const User = require("../models/User");
const {
  updateUserStreakHelper,
  checkAndAwardBadgesHelper,
  updateUserRankHelper,
} = require("../controllers/userController");

// Helper to normalize problem title to slug format
function slugifyTitle(title) {
  if (!title) return "";
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Fetch solved questions for a LeetCode handle via GraphQL / Fallback APIs
async function fetchLeetCodeSolvedList(username) {
  if (!username) return [];

  const cleanHandle = username.trim();
  const solvedMap = new Map(); // slug -> { title, timestamp }

  // 1. Primary: Direct LeetCode GraphQL Endpoint
  try {
    const graphqlQuery = {
      query: `
        query userRecentAcSubmissions($username: String!) {
          recentAcSubmissionList(username: $username, limit: 100) {
            title
            titleSlug
            timestamp
          }
          matchedUser(username: $username) {
            username
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `,
      variables: { username: cleanHandle },
    };

    const res = await axios.post("https://leetcode.com/graphql", graphqlQuery, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: `https://leetcode.com/${cleanHandle}/`,
      },
      timeout: 8000,
    });

    if (res.data && res.data.data) {
      const submissions = res.data.data.recentAcSubmissionList || [];
      submissions.forEach((s) => {
        if (s.titleSlug) {
          solvedMap.set(s.titleSlug.toLowerCase(), {
            title: s.title,
            timestamp: s.timestamp ? new Date(s.timestamp * 1000) : new Date(),
          });
        }
      });
    }
  } catch (err) {
    console.log(`[LeetCodeService] Direct GraphQL query notice for @${cleanHandle}:`, err.message);
  }

  // 2. Fallback: LeetCode Alfa API Proxy
  if (solvedMap.size === 0) {
    try {
      const fallbackRes = await axios.get(`https://alfa-leetcode-api.onrender.com/${cleanHandle}/acSubmission`, {
        timeout: 8000,
      });

      if (fallbackRes.data && Array.isArray(fallbackRes.data.submission)) {
        fallbackRes.data.submission.forEach((s) => {
          const slug = s.titleSlug || slugifyTitle(s.title);
          if (slug) {
            solvedMap.set(slug.toLowerCase(), {
              title: s.title,
              timestamp: s.timestamp ? new Date(s.timestamp * 1000) : new Date(),
            });
          }
        });
      }
    } catch (err) {
      console.log(`[LeetCodeService] Fallback API notice for @${cleanHandle}:`, err.message);
    }
  }

  return Array.from(solvedMap.entries()).map(([slug, meta]) => ({
    slug,
    title: meta.title,
    timestamp: meta.timestamp,
  }));
}

// Sync user's LeetCode solved problems with CodeNex database
async function syncUserLeetCodeProgress(userDoc) {
  let user = userDoc;
  if (typeof userDoc === "string" || userDoc instanceof String) {
    user = await User.findById(userDoc);
  }

  if (!user || !user.leetcodeUsername || !user.isLeetCodeConnected) {
    return {
      success: false,
      message: "No LeetCode account connected. Please connect your LeetCode account first.",
    };
  }

  const handle = user.leetcodeUsername;
  const solvedList = await fetchLeetCodeSolvedList(handle);
  const allProblems = await Problem.find({ isActive: true });

  const currentSolvedIds = new Set(user.solvedProblems.map((id) => id.toString()));
  let newSolvedCount = 0;
  const todayStr = new Date().toISOString().split("T")[0];

  allProblems.forEach((problem) => {
    const pId = problem._id.toString();
    if (currentSolvedIds.has(pId)) return;

    // Check slug match
    const problemSlug = problem.leetcodeLink
      ? problem.leetcodeLink.split("/problems/")[1]?.replace(/\/$/, "")
      : slugifyTitle(problem.title);

    const matches = solvedList.some((s) => {
      if (s.slug && problemSlug && s.slug.toLowerCase() === problemSlug.toLowerCase()) return true;
      if (s.title && problem.title && s.title.toLowerCase() === problem.title.toLowerCase()) return true;
      return false;
    });

    if (matches) {
      user.solvedProblems.push(problem._id);
      currentSolvedIds.add(pId);
      user.codingSolved += 1;
      user.points += problem.points || 10;
      newSolvedCount += 1;
      if (!user.completedDates.includes(todayStr)) {
        user.completedDates.push(todayStr);
      }
    }
  });

  if (newSolvedCount > 0) {
    updateUserStreakHelper(user);
    checkAndAwardBadgesHelper(user);
    await updateUserRankHelper(user);
  }

  user.leetcodeLastSyncedAt = new Date();
  await user.save();

  return {
    success: true,
    message: newSolvedCount > 0
      ? `Successfully synced! ${newSolvedCount} new LeetCode problem(s) marked as solved on CodeNex.`
      : `Sync complete! Account @${handle} is up to date.`,
    username: handle,
    newSolvedCount,
    totalSolved: user.codingSolved,
    lastSyncedAt: user.leetcodeLastSyncedAt,
    user: user.toPublicProfile(),
  };
}

module.exports = {
  slugifyTitle,
  fetchLeetCodeSolvedList,
  syncUserLeetCodeProgress,
};

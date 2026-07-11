const problems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    category: "Beginner",
    acceptance: 49.2,
    tags: ["Arrays", "Hash Table"],
    companies: ["Google", "Amazon", "Meta"],
    leetcodeLink: "https://leetcode.com/problems/two-sum/",
    gfgLink: "https://www.geeksforgeeks.org/problems/two-sum-pair-with-given-sum/1",
    diagram: `Input array: [2, 7, 11, 15], Target = 9
Hash Map: { value -> index }

Step 1: i = 0, val = 2. Complement = 9 - 2 = 7. Not in map. Insert 2 -> Map: {2: 0}
Step 2: i = 1, val = 7. Complement = 9 - 7 = 2. Found 2 in map at index 0!
Result: Return indices [0, 1].`,
    explanation: `Two Sum asks us to find the indices of two numbers that add up to a target value.
Instead of checking every pair (which takes O(n²) time), we can solve it in a single pass using a Hash Map.

1. We initialize an empty hash map.
2. For each number in the array, we calculate its complement (target - number).
3. We check if this complement exists in our map.
4. If it does, we return the index stored in the map and our current index.
5. If it doesn't, we insert the current number and its index into the map.

This algorithm runs in O(n) Time Complexity and uses O(n) Space Complexity.`,
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      { input: "nums = [3,3], target = 6", output: "[0,1]" },
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9", "Only one valid answer exists."],
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  // Write your code here\n};`,
      python: `def twoSum(nums, target):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: "[2,7,11,15]\n9", expectedOutput: "[0,1]" },
      { input: "[3,2,4]\n6", expectedOutput: "[1,2]" },
      { input: "[3,3]\n6", expectedOutput: "[0,1]" },
    ],
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Beginner",
    acceptance: 40.5,
    tags: ["Stack", "Strings"],
    companies: ["Amazon", "Bloomberg", "Meta"],
    leetcodeLink: "https://leetcode.com/problems/valid-parentheses/",
    gfgLink: "https://www.geeksforgeeks.org/problems/parenthesis-checker2744/1",
    diagram: `Input string s: "()[]{}"
Stack operations:

s[0] = '(': Push '(' -> Stack: ['(']
s[1] = ')': Match with top popped '(' -> Stack: []
s[2] = '[': Push '[' -> Stack: ['[']
s[3] = ']': Match with top popped '[' -> Stack: []
s[4] = '{': Push '{' -> Stack: ['{']
s[5] = '}': Match with top popped '{' -> Stack: []
End of string: Stack is empty. Valid!`,
    explanation: `We can determine if brackets are matched in the correct order using a Stack data structure (LIFO - Last In, First Out).

1. We loop through the characters of the string.
2. If we encounter an opening bracket ('(', '{', '['), we push it onto the stack.
3. If we find a closing bracket, we check the top of the stack.
4. If the stack is empty or the popped top bracket doesn't match the current closing bracket, the string is invalid (return false).
5. If they match, we continue.
6. Once the loop ends, if the stack is completely empty, all brackets have been closed properly (return true).

Time Complexity: O(n) to iterate through the string.
Space Complexity: O(n) to store the brackets in the stack in the worst case.`,
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
    starterCode: {
      javascript: `function isValid(s) {\n  // Write your code here\n};`,
      python: `def isValid(s):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: "()", expectedOutput: "true" },
      { input: "()[]{}", expectedOutput: "true" },
      { input: "(]", expectedOutput: "false" },
    ],
  },
  {
    id: 3,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    category: "Beginner",
    acceptance: 61.8,
    tags: ["Linked List", "Recursion"],
    companies: ["Amazon", "Microsoft", "Apple"],
    leetcodeLink: "https://leetcode.com/problems/merge-two-sorted-lists/",
    gfgLink: "https://www.geeksforgeeks.org/problems/merge-two-sorted-linked-lists/1",
    diagram: `List 1: 1 -> 2 -> 4 -> null
List 2: 1 -> 3 -> 4 -> null

Create Dummy Node: D
Compare L1 vs L2:
D -> [1] (from L1)
     Compare L1 (2) vs L2 (1) -> D -> 1 -> [1] (from L2)
     Compare L1 (2) vs L2 (3) -> D -> 1 -> 1 -> [2] (from L1)
     Compare L1 (4) vs L2 (3) -> D -> 1 -> 1 -> 2 -> [3] (from L2)
     Compare L1 (4) vs L2 (4) -> D -> 1 -> 1 -> 2 -> 3 -> [4] (from L1)
     Link remaining list2 -> D -> 1 -> 1 -> 2 -> 3 -> 4 -> [4] (from L2)
Result Head: Dummy.next`,
    explanation: `This problem requires merging two sorted linked lists into a single sorted list.
We can do this iteratively using a dummy node and a pointer tracking the end of our merged list.

1. Create a dummy head node. This acts as the anchor for the new list.
2. Initialize a pointer 'curr' pointing to the dummy node.
3. Compare the values at list1 and list2.
4. Point 'curr.next' to the node with the smaller value, then advance that list's pointer.
5. Move 'curr' forward to 'curr.next'.
6. Repeat until one list is exhausted.
7. Append the remaining nodes of the non-empty list directly to 'curr.next'.
8. Return 'dummy.next' (which is the actual head).

Time Complexity: O(n + m) where n, m are the list sizes.
Space Complexity: O(1) as we reuse existing list nodes.`,
    description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.`,
    examples: [
      { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
      { input: "list1 = [], list2 = []", output: "[]" },
      { input: "list1 = [], list2 = [0]", output: "[0]" },
    ],
    constraints: ["The number of nodes in both lists is in the range [0, 50].", "-100 <= Node.val <= 100", "Both list1 and list2 are sorted in non-decreasing order."],
    starterCode: {
      javascript: `function mergeTwoLists(list1, list2) {\n  // Write your code here\n};`,
      python: `def mergeTwoLists(list1, list2):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: "[1,2,4]\n[1,3,4]", expectedOutput: "[1,1,2,3,4,4]" },
      { input: "[]\n[]", expectedOutput: "[]" },
    ],
  },
  {
    id: 4,
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    category: "Beginner",
    acceptance: 54.1,
    tags: ["Arrays", "Dynamic Programming"],
    companies: ["Amazon", "Meta", "Goldman Sachs"],
    leetcodeLink: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    gfgLink: "https://www.geeksforgeeks.org/problems/best-time-to-buy-and-sell-stock/1",
    diagram: `Prices: [7, 1, 5, 3, 6, 4]
Track minimum price (minPrice) and maximum profit (maxProfit).

Day 1: Price=7. minPrice=7. profit = 7-7=0. maxProfit=0
Day 2: Price=1. minPrice=min(7, 1)=1. profit = 1-1=0. maxProfit=0
Day 3: Price=5. profit = 5-1 = 4. maxProfit=max(0, 4)=4
Day 4: Price=3. profit = 3-1 = 2. maxProfit=4
Day 5: Price=6. profit = 6-1 = 5. maxProfit=max(4, 5)=5
Day 6: Price=4. profit = 4-1 = 3. maxProfit=5
Result: Return 5`,
    explanation: `We need to find the max profit we can achieve by buying on one day and selling in the future.
A brute force approach computes profit for all pairs, which is O(n²).
Instead, we can track the lowest purchase price we've seen so far as we scan the array in a single pass.

1. Initialize 'minPrice' to Infinity, and 'maxProfit' to 0.
2. Loop through each price.
3. If the current price is lower than 'minPrice', update 'minPrice'.
4. Else, calculate the profit if we sell today (current price - minPrice).
5. If this profit is greater than 'maxProfit', update 'maxProfit'.

This algorithm executes in O(n) Time Complexity and requires O(1) Space Complexity.`,
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i-th\` day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.`,
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5." },
      { input: "prices = [7,6,4,3,1]", output: "0", explanation: "No transactions are done and the max profit = 0." },
    ],
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    starterCode: {
      javascript: `function maxProfit(prices) {\n  // Write your code here\n};`,
      python: `def maxProfit(prices):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public int maxProfit(int[] prices) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: "[7,1,5,3,6,4]", expectedOutput: "5" },
      { input: "[7,6,4,3,1]", expectedOutput: "0" },
    ],
  },
  {
    id: 5,
    title: "Valid Palindrome",
    difficulty: "Easy",
    category: "Beginner",
    acceptance: 43.8,
    tags: ["Strings", "Two Pointers"],
    companies: ["Meta", "Microsoft"],
    leetcodeLink: "https://leetcode.com/problems/valid-palindrome/",
    gfgLink: "https://www.geeksforgeeks.org/problems/palindrome-string0817/1",
    diagram: `Cleaned string: "amanaplanacanalpanama"
Pointers: L = 0, R = 20

a m a n a p l a n a c a n a l p a n a m a
^                                       ^
L                                       R
Compare s[L] == s[R] ('a' == 'a') -> Move L++, R--
Compare s[L] == s[R] ('m' == 'm') -> Move L++, R--
...
L and R meet. All matches correct. Palindrome verified!`,
    explanation: `A string is a palindrome if it reads the same backwards and forwards, ignoring non-alphanumeric characters.
We can check this in-place using two pointers.

1. Clean the string (or skip characters on-the-fly) to focus only on alphanumeric characters and make it lowercase.
2. Initialize pointer 'L' at 0, and pointer 'R' at s.length - 1.
3. Compare characters at L and R.
4. If they mismatch, return false immediately.
5. If they match, increment L and decrement R.
6. Repeat until the pointers meet (L >= R).

This runs in O(n) Time Complexity and uses O(1) additional Space Complexity.`,
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: "true", explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: "false" },
    ],
    constraints: ["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters."],
    starterCode: {
      javascript: `function isPalindrome(s) {\n  // Write your code here\n};`,
      python: `def isPalindrome(s):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public boolean isPalindrome(String s) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool isPalindrome(string s) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: '"A man, a plan, a canal: Panama"', expectedOutput: "true" },
      { input: '"race a car"', expectedOutput: "false" },
    ],
  },
  {
    id: 6,
    title: "Maximum Subarray",
    difficulty: "Medium",
    category: "Intermediate",
    acceptance: 50.2,
    tags: ["Arrays", "Dynamic Programming", "Divide and Conquer"],
    companies: ["Amazon", "Microsoft", "LinkedIn"],
    leetcodeLink: "https://leetcode.com/problems/maximum-subarray/",
    gfgLink: "https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1",
    diagram: `Nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Kadane's algorithm variables: currentSum, maxSum

i=0 (-2): currentSum=-2, maxSum=-2
i=1 (1):  currentSum=max(1, -2+1)=1, maxSum=max(-2, 1)=1
i=2 (-3): currentSum=max(-3, 1-3)=-2, maxSum=1
i=3 (4):  currentSum=max(4, -2+4)=4, maxSum=max(1, 4)=4
i=4 (-1): currentSum=max(-1, 4-1)=3, maxSum=4
i=5 (2):  currentSum=max(2, 3+2)=5, maxSum=max(4, 5)=5
i=6 (1):  currentSum=max(1, 5+1)=6, maxSum=max(5, 6)=6
Result: 6`,
    explanation: `We can find the maximum subarray sum in O(n) time using Kadane's Algorithm.

1. Maintain 'currentSum' representing the maximum sum ending at the current position.
2. Maintain 'maxSum' tracking the global maximum sum found so far.
3. For each element in the array: update 'currentSum = max(currentElement, currentSum + currentElement)'.
4. Update 'maxSum = max(maxSum, currentSum)'.
5. Return 'maxSum'.

Time Complexity: O(n), Space Complexity: O(1).`,
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.`,
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
      { input: "nums = [1]", output: "1" },
      { input: "nums = [5,4,-1,7,8]", output: "23" },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    starterCode: {
      javascript: `function maxSubArray(nums) {\n  // Write your code here\n};`,
      python: `def maxSubArray(nums):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" },
      { input: "[1]", expectedOutput: "1" },
      { input: "[5,4,-1,7,8]", expectedOutput: "23" },
    ],
  },
  {
    id: 7,
    title: "3Sum",
    difficulty: "Medium",
    category: "Intermediate",
    acceptance: 32.5,
    tags: ["Arrays", "Two Pointers", "Sorting"],
    companies: ["Amazon", "Meta", "Google"],
    leetcodeLink: "https://leetcode.com/problems/3sum/",
    gfgLink: "https://www.geeksforgeeks.org/problems/find-triplets-with-zero-sum/1",
    diagram: `Sorted nums: [-4, -1, -1, 0, 1, 2]
Fix i, use Left/Right pointers.

i=0 (nums[i] = -4): L=1 (val=-1), R=5 (val=2). Sum = -4 + -1 + 2 = -3 < 0 -> L++
i=1 (nums[i] = -1): L=2 (val=-1), R=5 (val=2). Sum = -1 + -1 + 2 = 0! Found [-1, -1, 2].
                     L=3 (val=0), R=5 (val=2). Sum = -1 + 0 + 2 = 1 > 0 -> R--
                     L=3 (val=0), R=4 (val=1). Sum = -1 + 0 + 1 = 0! Found [-1, 0, 1].`,
    explanation: `To solve 3Sum efficiently in O(n²) time:

1. Sort the input array nums.
2. Iterate through each element nums[i]. If nums[i] is positive, we can stop early.
3. Skip duplicates of nums[i].
4. For each nums[i], initialize Two Pointers: 'L = i + 1' and 'R = nums.length - 1'.
5. While L < R, calculate 'sum = nums[i] + nums[L] + nums[R]'.
6. If sum is 0, add triplet to results, then advance pointers skipping duplicates.
7. If sum < 0, increment L to increase sum. If sum > 0, decrement R to decrease sum.

Time Complexity: O(n²), Space Complexity: O(n) or O(1) depending on sorting details.`,
    description: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.`,
    examples: [
      { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" },
      { input: "nums = [0,1,1]", output: "[]" },
      { input: "nums = [0,0,0]", output: "[[0,0,0]]" },
    ],
    constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
    starterCode: {
      javascript: `function threeSum(nums) {\n  // Write your code here\n};`,
      python: `def threeSum(nums):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: "[-1,0,1,2,-1,-4]", expectedOutput: "[[-1,-1,2],[-1,0,1]]" },
      { input: "[0,1,1]", expectedOutput: "[]" },
    ],
  },
  {
    id: 8,
    title: "Container With Most Water",
    difficulty: "Medium",
    category: "Intermediate",
    acceptance: 54.3,
    tags: ["Arrays", "Two Pointers", "Greedy"],
    companies: ["Amazon", "Goldman Sachs", "Bloomberg"],
    leetcodeLink: "https://leetcode.com/problems/container-with-most-water/",
    gfgLink: "https://www.geeksforgeeks.org/problems/container-with-most-water5659/1",
    diagram: `Heights: [1, 8, 6, 2, 5, 4, 8, 3, 7]
Pointers: L=0, R=8

Step 1: area = min(1, 7) * (8 - 0) = 8. s[L]=1 < s[R]=7 -> L++
Step 2: L=1, area = min(8, 7) * (8 - 1) = 49. s[R]=7 < s[L]=8 -> R--
Step 3: R=7 (val=3), area = min(8, 3) * (7 - 1) = 18. L=1 (val=8) > R=7 -> R--
...继续直到指针相遇. 最大面积为 49.`,
    explanation: `We can find the maximum area in O(n) time using the Two Pointer technique.

1. Set pointer 'L' at the start (0) and 'R' at the end of the array.
2. The width of container is 'R - L', and height is limited by the shorter line: 'min(height[L], height[R])'.
3. Calculate the area and update the maximum area found so far.
4. Move the pointer pointing to the shorter line inward (since moving the taller pointer inward can never increase the area).

Time Complexity: O(n), Space Complexity: O(1).`,
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i-th\` line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.`,
    examples: [
      { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49" },
      { input: "height = [1,1]", output: "1" },
    ],
    constraints: ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
    starterCode: {
      javascript: `function maxArea(height) {\n  // Write your code here\n};`,
      python: `def maxArea(height):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public int maxArea(int[] height) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: "[1,8,6,2,5,4,8,3,7]", expectedOutput: "49" },
      { input: "[1,1]", expectedOutput: "1" },
    ],
  },
  {
    id: 9,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Intermediate",
    acceptance: 33.8,
    tags: ["Strings", "Sliding Window", "Hash Table"],
    companies: ["Amazon", "Meta", "Bloomberg"],
    leetcodeLink: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    gfgLink: "https://www.geeksforgeeks.org/problems/length-of-the-longest-substring3036/1",
    diagram: `String: "abcabcbb"
Sliding Window pointers: [L, R]

R=0 ('a'): set={'a'}. length=1
R=1 ('b'): set={'a','b'}. length=2
R=2 ('c'): set={'a','b','c'}. length=3
R=3 ('a'): duplicate 'a'! Move L to index 1. set={'b','c','a'}. length=3
Result: Max length is 3.`,
    explanation: `We solve this in O(n) time using a Sliding Window with a Hash Set tracking characters in the current window.

1. Initialize left pointer 'L' to 0 and right pointer 'R' to 0.
2. Use a Set to store unique characters in our window.
3. Expand the window by moving 'R' rightward. If s[R] is not in the set, add it and update 'maxLength'.
4. If s[R] is a duplicate, shrink the window by moving 'L' rightward and removing characters from the set, until s[R] is no longer a duplicate.
5. Continue until R reaches the end of s.

Time Complexity: O(n), Space Complexity: O(min(m, n)) where m is size of alphabet.`,
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: "1" },
      { input: 's = "pwwkew"', output: "3" },
    ],
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {\n  // Write your code here\n};`,
      python: `def lengthOfLongestSubstring(s):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: '"abcabcbb"', expectedOutput: "3" },
      { input: '"bbbbb"', expectedOutput: "1" },
      { input: '"pwwkew"', expectedOutput: "3" },
    ],
  },
  {
    id: 10,
    title: "Reverse Linked List",
    difficulty: "Easy",
    category: "Beginner",
    acceptance: 72.3,
    tags: ["Linked List", "Recursion"],
    companies: ["Amazon", "Microsoft", "Apple"],
    leetcodeLink: "https://leetcode.com/problems/reverse-linked-list/",
    gfgLink: "https://www.geeksforgeeks.org/problems/reverse-a-linked-list/1",
    diagram: `List: 1 -> 2 -> 3 -> null
Pointers: prev = null, curr = 1

Step 1: next = 2. curr.next = prev (null). prev = 1. curr = 2
Step 2: next = 3. curr.next = prev (1). prev = 2. curr = 3
Step 3: next = null. curr.next = prev (2). prev = 3. curr = null
Result: 3 -> 2 -> 1 -> null. Return prev (3)`,
    explanation: `We reverse a singly linked list in a single pass iteratively using three pointers.

1. Maintain 'prev' (null), 'curr' (head), and a temporary 'nextTemp'.
2. Iterate through the list until 'curr' is null.
3. Inside loop, store the next node: 'nextTemp = curr.next'.
4. Reverse the pointer direction: 'curr.next = prev'.
5. Advance 'prev' to 'curr'.
6. Advance 'curr' to 'nextTemp'.
7. After loop ends, 'prev' will be pointing to the new head of the reversed list.

Time Complexity: O(n), Space Complexity: O(1).`,
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" },
      { input: "head = []", output: "[]" },
    ],
    constraints: ["The number of nodes in the list is the range [0, 5000].", "-5000 <= Node.val <= 5000"],
    starterCode: {
      javascript: `function reverseList(head) {\n  // Write your code here\n};`,
      python: `def reverseList(head):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: "[1,2,3,4,5]", expectedOutput: "[5,4,3,2,1]" },
      { input: "[1,2]", expectedOutput: "[2,1]" },
    ],
  },
  {
    id: 11,
    title: "Binary Tree Inorder Traversal",
    difficulty: "Easy",
    category: "Beginner",
    acceptance: 72.8,
    tags: ["Trees", "Stack", "DFS"],
    companies: ["Microsoft", "Amazon"],
    description: `Given the root of a binary tree, return the inorder traversal of its nodes' values.`,
    examples: [
      { input: "root = [1,null,2,3]", output: "[1,3,2]" },
      { input: "root = []", output: "[]" },
    ],
    constraints: ["The number of nodes is in the range [0, 100].", "-100 <= Node.val <= 100"],
    starterCode: {
      javascript: `function inorderTraversal(root) {\n  // Write your code here\n};`,
      python: `def inorderTraversal(root):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public List<Integer> inorderTraversal(TreeNode root) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> inorderTraversal(TreeNode* root) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: "[1,null,2,3]", expectedOutput: "[1,3,2]" },
      { input: "[]", expectedOutput: "[]" },
    ],
  },
  {
    id: 12,
    title: "Climbing Stairs",
    difficulty: "Easy",
    category: "Beginner",
    acceptance: 51.4,
    tags: ["Dynamic Programming", "Math"],
    companies: ["Amazon", "Apple", "Adobe"],
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: "n = 2", output: "2", explanation: "1. 1 step + 1 step\n2. 2 steps" },
      { input: "n = 3", output: "3", explanation: "1. 1+1+1\n2. 1+2\n3. 2+1" },
    ],
    constraints: ["1 <= n <= 45"],
    starterCode: {
      javascript: `function climbStairs(n) {\n  // Write your code here\n};`,
      python: `def climbStairs(n):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public int climbStairs(int n) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int climbStairs(int n) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: "2", expectedOutput: "2" },
      { input: "3", expectedOutput: "3" },
    ],
  },
  {
    id: 13,
    title: "Product of Array Except Self",
    difficulty: "Medium",
    category: "Intermediate",
    acceptance: 64.6,
    tags: ["Arrays", "Prefix Sum"],
    companies: ["Amazon", "Meta", "Apple"],
    description: `Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.

You must write an algorithm that runs in O(n) time and without using the division operation.`,
    examples: [
      { input: "nums = [1,2,3,4]", output: "[24,12,8,6]" },
      { input: "nums = [-1,1,0,-3,3]", output: "[0,0,9,0,0]" },
    ],
    constraints: ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30", "The product of any prefix/suffix is guaranteed to fit in a 32-bit integer."],
    starterCode: {
      javascript: `function productExceptSelf(nums) {\n  // Write your code here\n};`,
      python: `def productExceptSelf(nums):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: "[1,2,3,4]", expectedOutput: "[24,12,8,6]" },
      { input: "[-1,1,0,-3,3]", expectedOutput: "[0,0,9,0,0]" },
    ],
  },
  {
    id: 14,
    title: "Merge Intervals",
    difficulty: "Medium",
    category: "Intermediate",
    acceptance: 46.1,
    tags: ["Arrays", "Sorting"],
    companies: ["Google", "Meta", "Bloomberg"],
    description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]" },
      { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]" },
    ],
    constraints: ["1 <= intervals.length <= 10^4", "intervals[i].length == 2", "0 <= start_i <= end_i <= 10^4"],
    starterCode: {
      javascript: `function merge(intervals) {\n  // Write your code here\n};`,
      python: `def merge(intervals):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public int[][] merge(int[][] intervals) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: "[[1,3],[2,6],[8,10],[15,18]]", expectedOutput: "[[1,6],[8,10],[15,18]]" },
      { input: "[[1,4],[4,5]]", expectedOutput: "[[1,5]]" },
    ],
  },
  {
    id: 15,
    title: "Group Anagrams",
    difficulty: "Medium",
    category: "Intermediate",
    acceptance: 66.7,
    tags: ["Strings", "Hash Table", "Sorting"],
    companies: ["Amazon", "Meta", "Google"],
    description: `Given an array of strings \`strs\`, group the anagrams together. You can return the answer in any order.`,
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
      { input: 'strs = [""]', output: '[[""]]' },
      { input: 'strs = ["a"]', output: '[["a"]]' },
    ],
    constraints: ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100", "strs[i] consists of lowercase English letters."],
    starterCode: {
      javascript: `function groupAnagrams(strs) {\n  // Write your code here\n};`,
      python: `def groupAnagrams(strs):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
    ],
  },
  {
    id: 16,
    title: "LRU Cache",
    difficulty: "Medium",
    category: "Intermediate",
    acceptance: 40.5,
    tags: ["Design", "Hash Table", "Linked List"],
    companies: ["Amazon", "Microsoft", "Google"],
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\` Initialize the LRU cache with positive size capacity.
- \`int get(int key)\` Return the value of the key if the key exists, otherwise return -1.
- \`void put(int key, int value)\` Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity, evict the least recently used key.`,
    examples: [
      { input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]', output: "[null,null,null,1,null,-1,null,-1,3,4]" },
    ],
    constraints: ["1 <= capacity <= 3000", "0 <= key <= 10^4", "0 <= value <= 10^5", "At most 2 * 10^5 calls will be made to get and put."],
    starterCode: {
      javascript: `class LRUCache {\n  constructor(capacity) {\n    // Write your code here\n  }\n  get(key) {\n    // Write your code here\n  }\n  put(key, value) {\n    // Write your code here\n  }\n};`,
      python: `class LRUCache:\n    def __init__(self, capacity):\n        # Write your code here\n        pass\n    def get(self, key):\n        pass\n    def put(self, key, value):\n        pass`,
      java: `class LRUCache {\n    public LRUCache(int capacity) {\n        // Write your code here\n    }\n    public int get(int key) {\n        // Write your code here\n    }\n    public void put(int key, int value) {\n        // Write your code here\n    }\n}`,
      cpp: `class LRUCache {\npublic:\n    LRUCache(int capacity) {\n        // Write your code here\n    }\n    int get(int key) {\n        // Write your code here\n    }\n    void put(int key, int value) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: "LRUCache(2)\nput(1,1)\nput(2,2)\nget(1)\nput(3,3)\nget(2)", expectedOutput: "1\n-1" },
    ],
  },
  {
    id: 17,
    title: "Binary Search",
    difficulty: "Easy",
    category: "Beginner",
    acceptance: 55.2,
    tags: ["Arrays", "Binary Search"],
    companies: ["Microsoft", "Apple"],
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with O(log n) runtime complexity.`,
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4" },
      { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1" },
    ],
    constraints: ["1 <= nums.length <= 10^4", "-10^4 < nums[i], target < 10^4", "All integers in nums are unique.", "nums is sorted in ascending order."],
    starterCode: {
      javascript: `function search(nums, target) {\n  // Write your code here\n};`,
      python: `def search(nums, target):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: "[-1,0,3,5,9,12]\n9", expectedOutput: "4" },
      { input: "[-1,0,3,5,9,12]\n2", expectedOutput: "-1" },
    ],
  },
  {
    id: 18,
    title: "Number of Islands",
    difficulty: "Medium",
    category: "Intermediate",
    acceptance: 56.2,
    tags: ["Graphs", "BFS", "DFS", "Matrix"],
    companies: ["Amazon", "Google", "Meta"],
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.`,
    examples: [
      { input: 'grid = [\n  ["1","1","1","1","0"],\n  ["1","1","0","1","0"],\n  ["1","1","0","0","0"],\n  ["0","0","0","0","0"]\n]', output: "1" },
      { input: 'grid = [\n  ["1","1","0","0","0"],\n  ["1","1","0","0","0"],\n  ["0","0","1","0","0"],\n  ["0","0","0","1","1"]\n]', output: "3" },
    ],
    constraints: ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300", "grid[i][j] is '0' or '1'."],
    starterCode: {
      javascript: `function numIslands(grid) {\n  // Write your code here\n};`,
      python: `def numIslands(grid):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expectedOutput: "1" },
    ],
  },
  {
    id: 19,
    title: "Coin Change",
    difficulty: "Medium",
    category: "Intermediate",
    acceptance: 41.8,
    tags: ["Dynamic Programming", "BFS"],
    companies: ["Amazon", "Google", "Apple"],
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination, return \`-1\`.`,
    examples: [
      { input: "coins = [1,5,11], amount = 11", output: "3", explanation: "11 = 5 + 5 + 1" },
      { input: "coins = [2], amount = 3", output: "-1" },
      { input: "coins = [1], amount = 0", output: "0" },
    ],
    constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
    starterCode: {
      javascript: `function coinChange(coins, amount) {\n  // Write your code here\n};`,
      python: `def coinChange(coins, amount):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public int coinChange(int[] coins, int amount) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: "[1,5,11]\n11", expectedOutput: "3" },
      { input: "[2]\n3", expectedOutput: "-1" },
    ],
  },
  {
    id: 20,
    title: "Word Search",
    difficulty: "Medium",
    category: "Intermediate",
    acceptance: 40.6,
    tags: ["Backtracking", "Matrix", "DFS"],
    companies: ["Amazon", "Microsoft", "Bloomberg"],
    description: `Given an \`m x n\` grid of characters \`board\` and a string \`word\`, return \`true\` if \`word\` exists in the grid.

The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.`,
    examples: [
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: "true" },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"', output: "true" },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"', output: "false" },
    ],
    constraints: ["m == board.length", "n = board[i].length", "1 <= m, n <= 6", "1 <= word.length <= 15"],
    starterCode: {
      javascript: `function exist(board, word) {\n  // Write your code here\n};`,
      python: `def exist(board, word):\n    # Write your code here\n    pass`,
      java: `class Solution {\n    public boolean exist(char[][] board, String word) {\n        // Write your code here\n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool exist(vector<vector<char>>& board, string word) {\n        // Write your code here\n    }\n};`,
    },
    testCases: [
      { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"ABCCED"', expectedOutput: "true" },
      { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\n"ABCB"', expectedOutput: "false" },
    ],
  },
  {
    id: 21, title: "Trapping Rain Water", difficulty: "Hard", category: "Advanced", acceptance: 58.7, tags: ["Arrays", "Two Pointers", "Stack", "Dynamic Programming"], companies: ["Amazon", "Google", "Goldman Sachs"],
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    examples: [{ input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" }, { input: "height = [4,2,0,3,2,5]", output: "9" }],
    constraints: ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
    starterCode: { javascript: `function trap(height) {\n  // Write your code here\n};`, python: `def trap(height):\n    # Write your code here\n    pass`, java: `class Solution {\n    public int trap(int[] height) {\n        // Write your code here\n    }\n}`, cpp: `class Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Write your code here\n    }\n};` },
    testCases: [{ input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6" }, { input: "[4,2,0,3,2,5]", expectedOutput: "9" }],
  },
  {
    id: 22, title: "Median of Two Sorted Arrays", difficulty: "Hard", category: "Advanced", acceptance: 36.1, tags: ["Arrays", "Binary Search", "Divide and Conquer"], companies: ["Google", "Amazon", "Apple"],
    description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).`,
    examples: [{ input: "nums1 = [1,3], nums2 = [2]", output: "2.00000" }, { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.50000" }],
    constraints: ["nums1.length == m", "nums2.length == n", "0 <= m <= 1000", "0 <= n <= 1000", "1 <= m + n <= 2000"],
    starterCode: { javascript: `function findMedianSortedArrays(nums1, nums2) {\n  // Write your code here\n};`, python: `def findMedianSortedArrays(nums1, nums2):\n    # Write your code here\n    pass`, java: `class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write your code here\n    }\n}`, cpp: `class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        // Write your code here\n    }\n};` },
    testCases: [{ input: "[1,3]\n[2]", expectedOutput: "2.00000" }, { input: "[1,2]\n[3,4]", expectedOutput: "2.50000" }],
  },
  {
    id: 23, title: "Word Search II", difficulty: "Hard", category: "Advanced", acceptance: 36.4, tags: ["Trie", "Backtracking", "Matrix"], companies: ["Amazon", "Microsoft"],
    description: `Given an \`m x n\` board of characters and a list of strings \`words\`, return all words on the board. Each word must be constructed from letters of sequentially adjacent cells.`,
    examples: [{ input: 'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]', output: '["eat","oath"]' }],
    constraints: ["m == board.length", "n == board[i].length", "1 <= m, n <= 12", "1 <= words.length <= 3 * 10^4"],
    starterCode: { javascript: `function findWords(board, words) {\n  // Write your code here\n};`, python: `def findWords(board, words):\n    # Write your code here\n    pass`, java: `class Solution {\n    public List<String> findWords(char[][] board, String[] words) {\n        // Write your code here\n    }\n}`, cpp: `class Solution {\npublic:\n    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {\n        // Write your code here\n    }\n};` },
    testCases: [{ input: '[["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]]\n["oath","pea","eat","rain"]', expectedOutput: '["eat","oath"]' }],
  },
  {
    id: 24, title: "Serialize and Deserialize Binary Tree", difficulty: "Hard", category: "Advanced", acceptance: 55.0, tags: ["Trees", "Design", "BFS", "DFS"], companies: ["Meta", "Amazon", "Google"],
    description: `Design an algorithm to serialize and deserialize a binary tree. Serialization is the process of converting a tree to a string, and deserialization is reconstructing the tree from the string.`,
    examples: [{ input: "root = [1,2,3,null,null,4,5]", output: "[1,2,3,null,null,4,5]" }],
    constraints: ["The number of nodes is in the range [0, 10^4].", "-1000 <= Node.val <= 1000"],
    starterCode: { javascript: `function serialize(root) {\n  // Write your code here\n};\nfunction deserialize(data) {\n  // Write your code here\n};`, python: `def serialize(root):\n    # Write your code here\n    pass\ndef deserialize(data):\n    # Write your code here\n    pass`, java: `public class Codec {\n    public String serialize(TreeNode root) {\n        // Write your code here\n    }\n    public TreeNode deserialize(String data) {\n        // Write your code here\n    }\n}`, cpp: `class Codec {\npublic:\n    string serialize(TreeNode* root) {\n        // Write your code here\n    }\n    TreeNode* deserialize(string data) {\n        // Write your code here\n    }\n};` },
    testCases: [{ input: "[1,2,3,null,null,4,5]", expectedOutput: "[1,2,3,null,null,4,5]" }],
  },
  {
    id: 25, title: "Minimum Window Substring", difficulty: "Hard", category: "Advanced", acceptance: 40.7, tags: ["Strings", "Sliding Window", "Hash Table"], companies: ["Meta", "Amazon", "Google"],
    description: `Given two strings \`s\` and \`t\` of lengths \`m\` and \`n\` respectively, return the minimum window substring of \`s\` such that every character in \`t\` (including duplicates) is included in the window.`,
    examples: [{ input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' }, { input: 's = "a", t = "a"', output: '"a"' }],
    constraints: ["m == s.length", "n == t.length", "1 <= m, n <= 10^5"],
    starterCode: { javascript: `function minWindow(s, t) {\n  // Write your code here\n};`, python: `def minWindow(s, t):\n    # Write your code here\n    pass`, java: `class Solution {\n    public String minWindow(String s, String t) {\n        // Write your code here\n    }\n}`, cpp: `class Solution {\npublic:\n    string minWindow(string s, string t) {\n        // Write your code here\n    }\n};` },
    testCases: [{ input: '"ADOBECODEBANC"\n"ABC"', expectedOutput: '"BANC"' }],
  },
  // Additional problems to reach 50+
  {
    id: 26, title: "Contains Duplicate", difficulty: "Easy", category: "Beginner", acceptance: 61.0, tags: ["Arrays", "Hash Table", "Sorting"], companies: ["Amazon", "Apple"],
    description: `Given an integer array \`nums\`, return \`true\` if any value appears at least twice in the array, and return \`false\` if every element is distinct.`,
    examples: [{ input: "nums = [1,2,3,1]", output: "true" }, { input: "nums = [1,2,3,4]", output: "false" }],
    constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    starterCode: { javascript: `function containsDuplicate(nums) {\n  // Write your code here\n};`, python: `def containsDuplicate(nums):\n    pass`, java: `class Solution {\n    public boolean containsDuplicate(int[] nums) {\n    }\n}`, cpp: `class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n    }\n};` },
    testCases: [{ input: "[1,2,3,1]", expectedOutput: "true" }, { input: "[1,2,3,4]", expectedOutput: "false" }],
  },
  {
    id: 27, title: "Anagram Check", difficulty: "Easy", category: "Beginner", acceptance: 62.3, tags: ["Strings", "Hash Table", "Sorting"], companies: ["Amazon", "Microsoft"],
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.`,
    examples: [{ input: 's = "anagram", t = "nagaram"', output: "true" }, { input: 's = "rat", t = "car"', output: "false" }],
    constraints: ["1 <= s.length, t.length <= 5 * 10^4"],
    starterCode: { javascript: `function isAnagram(s, t) {\n  // Write your code here\n};`, python: `def isAnagram(s, t):\n    pass`, java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n    }\n}`, cpp: `class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n    }\n};` },
    testCases: [{ input: '"anagram"\n"nagaram"', expectedOutput: "true" }, { input: '"rat"\n"car"', expectedOutput: "false" }],
  },
  {
    id: 28, title: "Linked List Cycle", difficulty: "Easy", category: "Beginner", acceptance: 46.8, tags: ["Linked List", "Two Pointers"], companies: ["Amazon", "Microsoft"],
    description: `Given \`head\`, the head of a linked list, determine if the linked list has a cycle in it.`,
    examples: [{ input: "head = [3,2,0,-4], pos = 1", output: "true" }, { input: "head = [1,2], pos = 0", output: "true" }],
    constraints: ["The number of the nodes is in the range [0, 10^4]."],
    starterCode: { javascript: `function hasCycle(head) {\n  // Write your code here\n};`, python: `def hasCycle(head):\n    pass`, java: `public class Solution {\n    public boolean hasCycle(ListNode head) {\n    }\n}`, cpp: `class Solution {\npublic:\n    bool hasCycle(ListNode *head) {\n    }\n};` },
    testCases: [{ input: "[3,2,0,-4]\n1", expectedOutput: "true" }],
  },
  {
    id: 29, title: "Implement Queue using Stacks", difficulty: "Easy", category: "Beginner", acceptance: 60.5, tags: ["Stack", "Queue", "Design"], companies: ["Microsoft", "Amazon"],
    description: `Implement a first in first out (FIFO) queue using only two stacks.`,
    examples: [{ input: '["MyQueue","push","push","peek","pop","empty"]\n[[],[1],[2],[],[],[]]', output: "[null,null,null,1,1,false]" }],
    constraints: ["1 <= x <= 9", "At most 100 calls will be made."],
    starterCode: { javascript: `class MyQueue {\n  constructor() {\n  }\n  push(x) {\n  }\n  pop() {\n  }\n  peek() {\n  }\n  empty() {\n  }\n};`, python: `class MyQueue:\n    def __init__(self):\n        pass\n    def push(self, x):\n        pass\n    def pop(self):\n        pass\n    def peek(self):\n        pass\n    def empty(self):\n        pass`, java: `class MyQueue {\n    public MyQueue() {\n    }\n    public void push(int x) {\n    }\n    public int pop() {\n    }\n    public int peek() {\n    }\n    public boolean empty() {\n    }\n}`, cpp: `class MyQueue {\npublic:\n    MyQueue() {\n    }\n    void push(int x) {\n    }\n    int pop() {\n    }\n    int peek() {\n    }\n    bool empty() {\n    }\n};` },
    testCases: [{ input: "push(1)\npush(2)\npeek()\npop()\nempty()", expectedOutput: "1\n1\nfalse" }],
  },
  {
    id: 30, title: "Maximum Depth of Binary Tree", difficulty: "Easy", category: "Beginner", acceptance: 73.1, tags: ["Trees", "DFS", "BFS"], companies: ["Amazon", "Google"],
    description: `Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.`,
    examples: [{ input: "root = [3,9,20,null,null,15,7]", output: "3" }, { input: "root = [1,null,2]", output: "2" }],
    constraints: ["The number of nodes is in the range [0, 10^4]."],
    starterCode: { javascript: `function maxDepth(root) {\n  // Write your code here\n};`, python: `def maxDepth(root):\n    pass`, java: `class Solution {\n    public int maxDepth(TreeNode root) {\n    }\n}`, cpp: `class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n    }\n};` },
    testCases: [{ input: "[3,9,20,null,null,15,7]", expectedOutput: "3" }],
  },
  {
    id: 31, title: "Rotate Array", difficulty: "Medium", category: "Intermediate", acceptance: 39.2, tags: ["Arrays", "Math", "Two Pointers"], companies: ["Microsoft", "Amazon"],
    description: `Given an integer array \`nums\`, rotate the array to the right by \`k\` steps, where \`k\` is non-negative.`,
    examples: [{ input: "nums = [1,2,3,4,5,6,7], k = 3", output: "[5,6,7,1,2,3,4]" }],
    constraints: ["1 <= nums.length <= 10^5", "-2^31 <= nums[i] <= 2^31 - 1", "0 <= k <= 10^5"],
    starterCode: { javascript: `function rotate(nums, k) {\n  // Write your code here\n};`, python: `def rotate(nums, k):\n    pass`, java: `class Solution {\n    public void rotate(int[] nums, int k) {\n    }\n}`, cpp: `class Solution {\npublic:\n    void rotate(vector<int>& nums, int k) {\n    }\n};` },
    testCases: [{ input: "[1,2,3,4,5,6,7]\n3", expectedOutput: "[5,6,7,1,2,3,4]" }],
  },
  {
    id: 32, title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", category: "Intermediate", acceptance: 48.5, tags: ["Arrays", "Binary Search"], companies: ["Amazon", "Microsoft", "Google"],
    description: `Given the sorted rotated array \`nums\` of unique elements, return the minimum element of this array. You must write an algorithm that runs in O(log n) time.`,
    examples: [{ input: "nums = [3,4,5,1,2]", output: "1" }, { input: "nums = [4,5,6,7,0,1,2]", output: "0" }],
    constraints: ["n == nums.length", "1 <= n <= 5000", "All integers are unique."],
    starterCode: { javascript: `function findMin(nums) {\n  // Write your code here\n};`, python: `def findMin(nums):\n    pass`, java: `class Solution {\n    public int findMin(int[] nums) {\n    }\n}`, cpp: `class Solution {\npublic:\n    int findMin(vector<int>& nums) {\n    }\n};` },
    testCases: [{ input: "[3,4,5,1,2]", expectedOutput: "1" }, { input: "[4,5,6,7,0,1,2]", expectedOutput: "0" }],
  },
  {
    id: 33, title: "Course Schedule", difficulty: "Medium", category: "Intermediate", acceptance: 45.8, tags: ["Graphs", "Topological Sort", "BFS", "DFS"], companies: ["Amazon", "Microsoft", "Google"],
    description: `There are a total of \`numCourses\` courses you have to take, labeled from \`0\` to \`numCourses - 1\`. Given an array \`prerequisites\`, return \`true\` if you can finish all courses.`,
    examples: [{ input: "numCourses = 2, prerequisites = [[1,0]]", output: "true" }, { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false" }],
    constraints: ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= 5000"],
    starterCode: { javascript: `function canFinish(numCourses, prerequisites) {\n  // Write your code here\n};`, python: `def canFinish(numCourses, prerequisites):\n    pass`, java: `class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n    }\n}`, cpp: `class Solution {\npublic:\n    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n    }\n};` },
    testCases: [{ input: "2\n[[1,0]]", expectedOutput: "true" }, { input: "2\n[[1,0],[0,1]]", expectedOutput: "false" }],
  },
  {
    id: 34, title: "Implement Trie (Prefix Tree)", difficulty: "Medium", category: "Intermediate", acceptance: 62.8, tags: ["Trie", "Design", "Hash Table"], companies: ["Google", "Amazon", "Microsoft"],
    description: `Implement a trie with \`insert\`, \`search\`, and \`startsWith\` methods.`,
    examples: [{ input: '["Trie","insert","search","search","startsWith","insert","search"]\n[[],["apple"],["apple"],["app"],["app"],["app"],["app"]]', output: "[null,null,true,false,true,null,true]" }],
    constraints: ["1 <= word.length, prefix.length <= 2000", "word and prefix consist only of lowercase English letters."],
    starterCode: { javascript: `class Trie {\n  constructor() {\n  }\n  insert(word) {\n  }\n  search(word) {\n  }\n  startsWith(prefix) {\n  }\n};`, python: `class Trie:\n    def __init__(self):\n        pass\n    def insert(self, word):\n        pass\n    def search(self, word):\n        pass\n    def startsWith(self, prefix):\n        pass`, java: `class Trie {\n    public Trie() {\n    }\n    public void insert(String word) {\n    }\n    public boolean search(String word) {\n    }\n    public boolean startsWith(String prefix) {\n    }\n}`, cpp: `class Trie {\npublic:\n    Trie() {\n    }\n    void insert(string word) {\n    }\n    bool search(string word) {\n    }\n    bool startsWith(string prefix) {\n    }\n};` },
    testCases: [{ input: 'insert("apple")\nsearch("apple")\nsearch("app")\nstartsWith("app")', expectedOutput: "true\nfalse\ntrue" }],
  },
  {
    id: 35, title: "Kth Largest Element in an Array", difficulty: "Medium", category: "Intermediate", acceptance: 65.8, tags: ["Arrays", "Heap", "Sorting", "Divide and Conquer"], companies: ["Meta", "Amazon", "Google"],
    description: `Given an integer array \`nums\` and an integer \`k\`, return the \`k-th\` largest element in the array. Note that it is the \`k-th\` largest element in sorted order, not the \`k-th\` distinct element.`,
    examples: [{ input: "nums = [3,2,1,5,6,4], k = 2", output: "5" }, { input: "nums = [3,2,3,1,2,4,5,5,6], k = 4", output: "4" }],
    constraints: ["1 <= k <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    starterCode: { javascript: `function findKthLargest(nums, k) {\n  // Write your code here\n};`, python: `def findKthLargest(nums, k):\n    pass`, java: `class Solution {\n    public int findKthLargest(int[] nums, int k) {\n    }\n}`, cpp: `class Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n    }\n};` },
    testCases: [{ input: "[3,2,1,5,6,4]\n2", expectedOutput: "5" }],
  },
  {
    id: 36, title: "Lowest Common Ancestor of BST", difficulty: "Medium", category: "Intermediate", acceptance: 60.2, tags: ["Trees", "BST", "DFS"], companies: ["Meta", "Amazon"],
    description: `Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.`,
    examples: [{ input: "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8", output: "6" }],
    constraints: ["The number of nodes is in the range [2, 10^5]."],
    starterCode: { javascript: `function lowestCommonAncestor(root, p, q) {\n  // Write your code here\n};`, python: `def lowestCommonAncestor(root, p, q):\n    pass`, java: `class Solution {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n    }\n}`, cpp: `class Solution {\npublic:\n    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n    }\n};` },
    testCases: [{ input: "[6,2,8,0,4,7,9,null,null,3,5]\n2\n8", expectedOutput: "6" }],
  },
  {
    id: 37, title: "House Robber", difficulty: "Medium", category: "Intermediate", acceptance: 49.3, tags: ["Dynamic Programming", "Arrays"], companies: ["Amazon", "Google", "Cisco"],
    description: `You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses have security systems connected — if two adjacent houses were broken into on the same night, the police will be contacted. Given an array \`nums\` representing the amount of money at each house, return the maximum amount you can rob tonight without alerting the police.`,
    examples: [{ input: "nums = [1,2,3,1]", output: "4" }, { input: "nums = [2,7,9,3,1]", output: "12" }],
    constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"],
    starterCode: { javascript: `function rob(nums) {\n  // Write your code here\n};`, python: `def rob(nums):\n    pass`, java: `class Solution {\n    public int rob(int[] nums) {\n    }\n}`, cpp: `class Solution {\npublic:\n    int rob(vector<int>& nums) {\n    }\n};` },
    testCases: [{ input: "[1,2,3,1]", expectedOutput: "4" }, { input: "[2,7,9,3,1]", expectedOutput: "12" }],
  },
  {
    id: 38, title: "Daily Temperatures", difficulty: "Medium", category: "Intermediate", acceptance: 66.5, tags: ["Stack", "Arrays", "Monotonic Stack"], companies: ["Amazon", "Meta"],
    description: `Given an array of integers \`temperatures\` represents the daily temperatures, return an array \`answer\` such that \`answer[i]\` is the number of days you have to wait after the \`i-th\` day to get a warmer temperature.`,
    examples: [{ input: "temperatures = [73,74,75,71,69,72,76,73]", output: "[1,1,4,2,1,1,0,0]" }],
    constraints: ["1 <= temperatures.length <= 10^5", "30 <= temperatures[i] <= 100"],
    starterCode: { javascript: `function dailyTemperatures(temperatures) {\n  // Write your code here\n};`, python: `def dailyTemperatures(temperatures):\n    pass`, java: `class Solution {\n    public int[] dailyTemperatures(int[] temperatures) {\n    }\n}`, cpp: `class Solution {\npublic:\n    vector<int> dailyTemperatures(vector<int>& temperatures) {\n    }\n};` },
    testCases: [{ input: "[73,74,75,71,69,72,76,73]", expectedOutput: "[1,1,4,2,1,1,0,0]" }],
  },
  {
    id: 39, title: "Longest Palindromic Substring", difficulty: "Medium", category: "Intermediate", acceptance: 32.4, tags: ["Strings", "Dynamic Programming"], companies: ["Amazon", "Microsoft", "Google"],
    description: `Given a string \`s\`, return the longest palindromic substring in \`s\`.`,
    examples: [{ input: 's = "babad"', output: '"bab"' }, { input: 's = "cbbd"', output: '"bb"' }],
    constraints: ["1 <= s.length <= 1000", "s consist of only digits and English letters."],
    starterCode: { javascript: `function longestPalindrome(s) {\n  // Write your code here\n};`, python: `def longestPalindrome(s):\n    pass`, java: `class Solution {\n    public String longestPalindrome(String s) {\n    }\n}`, cpp: `class Solution {\npublic:\n    string longestPalindrome(string s) {\n    }\n};` },
    testCases: [{ input: '"babad"', expectedOutput: '"bab"' }, { input: '"cbbd"', expectedOutput: '"bb"' }],
  },
  {
    id: 40, title: "Search in Rotated Sorted Array", difficulty: "Medium", category: "Intermediate", acceptance: 39.0, tags: ["Arrays", "Binary Search"], companies: ["Meta", "Amazon", "Microsoft"],
    description: `Given a rotated sorted array \`nums\` and an integer \`target\`, return the index of \`target\` or \`-1\` if not found. You must write an algorithm with O(log n) runtime complexity.`,
    examples: [{ input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" }, { input: "nums = [4,5,6,7,0,1,2], target = 3", output: "-1" }],
    constraints: ["1 <= nums.length <= 5000", "All values are unique."],
    starterCode: { javascript: `function search(nums, target) {\n  // Write your code here\n};`, python: `def search(nums, target):\n    pass`, java: `class Solution {\n    public int search(int[] nums, int target) {\n    }\n}`, cpp: `class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n    }\n};` },
    testCases: [{ input: "[4,5,6,7,0,1,2]\n0", expectedOutput: "4" }, { input: "[4,5,6,7,0,1,2]\n3", expectedOutput: "-1" }],
  },
  {
    id: 41, title: "Merge K Sorted Lists", difficulty: "Hard", category: "Advanced", acceptance: 49.9, tags: ["Linked List", "Heap", "Divide and Conquer"], companies: ["Amazon", "Google", "Meta"],
    description: `You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.`,
    examples: [{ input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" }],
    constraints: ["k == lists.length", "0 <= k <= 10^4", "0 <= lists[i].length <= 500"],
    starterCode: { javascript: `function mergeKLists(lists) {\n  // Write your code here\n};`, python: `def mergeKLists(lists):\n    pass`, java: `class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n    }\n}`, cpp: `class Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n    }\n};` },
    testCases: [{ input: "[[1,4,5],[1,3,4],[2,6]]", expectedOutput: "[1,1,2,3,4,4,5,6]" }],
  },
  {
    id: 42, title: "Longest Increasing Subsequence", difficulty: "Medium", category: "Intermediate", acceptance: 52.3, tags: ["Dynamic Programming", "Binary Search", "Arrays"], companies: ["Amazon", "Google", "Microsoft"],
    description: `Given an integer array \`nums\`, return the length of the longest strictly increasing subsequence.`,
    examples: [{ input: "nums = [10,9,2,5,3,7,101,18]", output: "4", explanation: "The longest increasing subsequence is [2,3,7,101]." }],
    constraints: ["1 <= nums.length <= 2500", "-10^4 <= nums[i] <= 10^4"],
    starterCode: { javascript: `function lengthOfLIS(nums) {\n  // Write your code here\n};`, python: `def lengthOfLIS(nums):\n    pass`, java: `class Solution {\n    public int lengthOfLIS(int[] nums) {\n    }\n}`, cpp: `class Solution {\npublic:\n    int lengthOfLIS(vector<int>& nums) {\n    }\n};` },
    testCases: [{ input: "[10,9,2,5,3,7,101,18]", expectedOutput: "4" }],
  },
  {
    id: 43, title: "Valid Sudoku", difficulty: "Medium", category: "Intermediate", acceptance: 57.1, tags: ["Arrays", "Hash Table", "Matrix"], companies: ["Amazon", "Apple"],
    description: `Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated.`,
    examples: [{ input: "board = [[...]]", output: "true" }],
    constraints: ["board.length == 9", "board[i].length == 9", "board[i][j] is a digit 1-9 or '.'."],
    starterCode: { javascript: `function isValidSudoku(board) {\n  // Write your code here\n};`, python: `def isValidSudoku(board):\n    pass`, java: `class Solution {\n    public boolean isValidSudoku(char[][] board) {\n    }\n}`, cpp: `class Solution {\npublic:\n    bool isValidSudoku(vector<vector<char>>& board) {\n    }\n};` },
    testCases: [{ input: "valid board", expectedOutput: "true" }],
  },
  {
    id: 44, title: "Subsets", difficulty: "Medium", category: "Intermediate", acceptance: 74.4, tags: ["Arrays", "Backtracking", "Bit Manipulation"], companies: ["Amazon", "Meta"],
    description: `Given an integer array \`nums\` of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.`,
    examples: [{ input: "nums = [1,2,3]", output: "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]" }],
    constraints: ["1 <= nums.length <= 10", "-10 <= nums[i] <= 10", "All the numbers of nums are unique."],
    starterCode: { javascript: `function subsets(nums) {\n  // Write your code here\n};`, python: `def subsets(nums):\n    pass`, java: `class Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n    }\n}`, cpp: `class Solution {\npublic:\n    vector<vector<int>> subsets(vector<int>& nums) {\n    }\n};` },
    testCases: [{ input: "[1,2,3]", expectedOutput: "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]" }],
  },
  {
    id: 45, title: "Permutations", difficulty: "Medium", category: "Intermediate", acceptance: 74.7, tags: ["Arrays", "Backtracking"], companies: ["Amazon", "Meta", "Microsoft"],
    description: `Given an array \`nums\` of distinct integers, return all the possible permutations. You can return the answer in any order.`,
    examples: [{ input: "nums = [1,2,3]", output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]" }],
    constraints: ["1 <= nums.length <= 6", "-10 <= nums[i] <= 10", "All the integers of nums are unique."],
    starterCode: { javascript: `function permute(nums) {\n  // Write your code here\n};`, python: `def permute(nums):\n    pass`, java: `class Solution {\n    public List<List<Integer>> permute(int[] nums) {\n    }\n}`, cpp: `class Solution {\npublic:\n    vector<vector<int>> permute(vector<int>& nums) {\n    }\n};` },
    testCases: [{ input: "[1,2,3]", expectedOutput: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]" }],
  },
  {
    id: 46, title: "Letter Combinations of a Phone Number", difficulty: "Medium", category: "Intermediate", acceptance: 56.5, tags: ["Strings", "Backtracking", "Hash Table"], companies: ["Amazon", "Google"],
    description: `Given a string containing digits from \`2-9\` inclusive, return all possible letter combinations that the number could represent.`,
    examples: [{ input: 'digits = "23"', output: '["ad","ae","af","bd","be","bf","cd","ce","cf"]' }],
    constraints: ["0 <= digits.length <= 4", "digits[i] is a digit in the range ['2', '9']."],
    starterCode: { javascript: `function letterCombinations(digits) {\n  // Write your code here\n};`, python: `def letterCombinations(digits):\n    pass`, java: `class Solution {\n    public List<String> letterCombinations(String digits) {\n    }\n}`, cpp: `class Solution {\npublic:\n    vector<string> letterCombinations(string digits) {\n    }\n};` },
    testCases: [{ input: '"23"', expectedOutput: '["ad","ae","af","bd","be","bf","cd","ce","cf"]' }],
  },
  {
    id: 47, title: "Spiral Matrix", difficulty: "Medium", category: "Intermediate", acceptance: 44.8, tags: ["Arrays", "Matrix", "Simulation"], companies: ["Amazon", "Microsoft", "Apple"],
    description: `Given an \`m x n\` matrix, return all elements of the matrix in spiral order.`,
    examples: [{ input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "[1,2,3,6,9,8,7,4,5]" }],
    constraints: ["m == matrix.length", "n == matrix[i].length", "1 <= m, n <= 10"],
    starterCode: { javascript: `function spiralOrder(matrix) {\n  // Write your code here\n};`, python: `def spiralOrder(matrix):\n    pass`, java: `class Solution {\n    public List<Integer> spiralOrder(int[][] matrix) {\n    }\n}`, cpp: `class Solution {\npublic:\n    vector<int> spiralOrder(vector<vector<int>>& matrix) {\n    }\n};` },
    testCases: [{ input: "[[1,2,3],[4,5,6],[7,8,9]]", expectedOutput: "[1,2,3,6,9,8,7,4,5]" }],
  },
  {
    id: 48, title: "Jump Game", difficulty: "Medium", category: "Intermediate", acceptance: 38.4, tags: ["Arrays", "Greedy", "Dynamic Programming"], companies: ["Amazon", "Google"],
    description: `You are given an integer array \`nums\`. You are initially positioned at the array's first index, and each element represents your maximum jump length at that position. Return \`true\` if you can reach the last index.`,
    examples: [{ input: "nums = [2,3,1,1,4]", output: "true" }, { input: "nums = [3,2,1,0,4]", output: "false" }],
    constraints: ["1 <= nums.length <= 10^4", "0 <= nums[i] <= 10^5"],
    starterCode: { javascript: `function canJump(nums) {\n  // Write your code here\n};`, python: `def canJump(nums):\n    pass`, java: `class Solution {\n    public boolean canJump(int[] nums) {\n    }\n}`, cpp: `class Solution {\npublic:\n    bool canJump(vector<int>& nums) {\n    }\n};` },
    testCases: [{ input: "[2,3,1,1,4]", expectedOutput: "true" }, { input: "[3,2,1,0,4]", expectedOutput: "false" }],
  },
  {
    id: 49, title: "Decode Ways", difficulty: "Medium", category: "Intermediate", acceptance: 32.7, tags: ["Strings", "Dynamic Programming"], companies: ["Meta", "Amazon", "Google"],
    description: `A message containing letters from A-Z can be encoded into numbers using: 'A' -> "1", 'B' -> "2", ..., 'Z' -> "26". Given a string \`s\` containing only digits, return the number of ways to decode it.`,
    examples: [{ input: 's = "12"', output: "2", explanation: '"12" could be decoded as "AB" (1 2) or "L" (12).' }, { input: 's = "226"', output: "3" }],
    constraints: ["1 <= s.length <= 100", "s contains only digits and may contain leading zeros."],
    starterCode: { javascript: `function numDecodings(s) {\n  // Write your code here\n};`, python: `def numDecodings(s):\n    pass`, java: `class Solution {\n    public int numDecodings(String s) {\n    }\n}`, cpp: `class Solution {\npublic:\n    int numDecodings(string s) {\n    }\n};` },
    testCases: [{ input: '"12"', expectedOutput: "2" }, { input: '"226"', expectedOutput: "3" }],
  },
  {
    id: 50, title: "Regular Expression Matching", difficulty: "Hard", category: "Advanced", acceptance: 28.2, tags: ["Strings", "Dynamic Programming", "Recursion"], companies: ["Google", "Meta", "Amazon"],
    description: `Given an input string \`s\` and a pattern \`p\`, implement regular expression matching with support for \`'.'\` and \`'*'\` where \`'.'\` matches any single character and \`'*'\` matches zero or more of the preceding element.`,
    examples: [{ input: 's = "aa", p = "a"', output: "false" }, { input: 's = "aa", p = "a*"', output: "true" }, { input: 's = "ab", p = ".*"', output: "true" }],
    constraints: ["1 <= s.length <= 20", "1 <= p.length <= 20"],
    starterCode: { javascript: `function isMatch(s, p) {\n  // Write your code here\n};`, python: `def isMatch(s, p):\n    pass`, java: `class Solution {\n    public boolean isMatch(String s, String p) {\n    }\n}`, cpp: `class Solution {\npublic:\n    bool isMatch(string s, string p) {\n    }\n};` },
    testCases: [{ input: '"aa"\n"a"', expectedOutput: "false" }, { input: '"aa"\n"a*"', expectedOutput: "true" }],
  },
];

const allTags = [...new Set(problems.flatMap(p => p.tags))].sort();
const allCompanies = [...new Set(problems.flatMap(p => p.companies || []))].sort();


module.exports = { problems, allTags, allCompanies };

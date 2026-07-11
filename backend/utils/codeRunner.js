const vm = require("vm");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const axios = require("axios");

const judge0Languages = {
  javascript: 93,
  python: 92,
  java: 91,
  cpp: 54,
  "c++": 54,
  c: 50,
};

const normalizeOutput = (value) =>
  String(value)
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();

// JavaScript VM Runner
const runJavaScript = (code, testCases, problemId) => {
  const results = [];
  let passed = 0;

  // Helpers for list conversions
  class ListNode {
    constructor(val = 0, next = null) {
      this.val = val;
      this.next = next;
    }
  }

  const arrayToList = (arr) => {
    if (!arr || !arr.length) return null;
    const head = new ListNode(arr[0]);
    let curr = head;
    for (let i = 1; i < arr.length; i++) {
      curr.next = new ListNode(arr[i]);
      curr = curr.next;
    }
    return head;
  };

  const listToArray = (head) => {
    const arr = [];
    let curr = head;
    while (curr) {
      arr.push(curr.val);
      curr = curr.next;
    }
    return arr;
  };

  for (const testCase of testCases) {
    try {
      // Define ListNode inside the VM sandbox so user can instantiate it
      const sandbox = {
        module: { exports: null },
        exports: {},
        ListNode: class ListNode {
          constructor(val = 0, next = null) {
            this.val = val;
            this.next = next;
          }
        }
      };

      const funcName = extractJSFuncName(code);
      const script = `
        ${code}
        module.exports =
          ${funcName ? `typeof ${funcName} !== "undefined" ? ${funcName} :` : ""}
          typeof twoSum !== "undefined" ? twoSum :
          typeof isValid !== "undefined" ? isValid :
          typeof mergeTwoLists !== "undefined" ? mergeTwoLists :
          typeof maxProfit !== "undefined" ? maxProfit :
          typeof isPalindrome !== "undefined" ? isPalindrome :
          typeof maxSubArray !== "undefined" ? maxSubArray :
          typeof threeSum !== "undefined" ? threeSum :
          typeof maxArea !== "undefined" ? maxArea :
          typeof lengthOfLongestSubstring !== "undefined" ? lengthOfLongestSubstring :
          typeof reverseList !== "undefined" ? reverseList :
          null;
      `;

      vm.runInNewContext(script, sandbox, { timeout: 3000 });
      const fn = sandbox.module.exports;

      if (typeof fn !== "function") {
        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: "No solution function found in code",
          passed: false,
        });
        continue;
      }

      const lines = testCase.input
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      // Dynamic JSON parsing
      let args = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          // If not valid JSON, treat as a string (remove surrounding quotes if any)
          if (line.startsWith('"') && line.endsWith('"')) {
            return line.slice(1, -1);
          }
          return line;
        }
      });

      // Special conversion for linked lists problems (3 = Merge Two Sorted Lists, 10 = Reverse Linked List)
      const isLinkedListProblem = (problemId === 3 || problemId === 10);
      if (isLinkedListProblem) {
        args = args.map(arg => {
          if (Array.isArray(arg)) {
            return arrayToList(arg);
          }
          return arg;
        });
      }

      let actual = fn(...args);

      if (isLinkedListProblem && (actual === null || actual instanceof sandbox.ListNode)) {
        actual = listToArray(actual);
      }

      const actualStr = JSON.stringify(actual);
      const ok = normalizeOutput(actualStr) === normalizeOutput(testCase.expectedOutput);

      if (ok) passed += 1;
      results.push({
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: actualStr,
        passed: ok,
      });
    } catch (err) {
      results.push({
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: err.message,
        passed: false,
      });
    }
  }

  return { passed, total: testCases.length, results };
};

// Python Wrapper Generator
const getPythonWrapperOld = (code, problemId) => {
  let wrapper = `${code}\n\n`;
  
  if (problemId === 3 || problemId === 10) {
    wrapper += `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def build_list(arr):
    if not arr: return None
    head = ListNode(arr[0])
    curr = head
    for x in arr[1:]:
        curr.next = ListNode(x)
        curr = curr.next
    return head

def list_to_arr(head):
    arr = []
    curr = head
    while curr:
        arr.append(curr.val)
        curr = curr.next
    return arr
`;
  }

  wrapper += `
import sys, json
if __name__ == "__main__":
    lines = [line.strip() for line in sys.stdin.read().splitlines() if line.strip()]
    if not lines:
        sys.exit(0)
`;

  if (problemId === 1) { // Two Sum
    wrapper += `
    nums = json.loads(lines[0])
    target = int(lines[1])
    res = twoSum(nums, target)
    print(json.dumps(res))
`;
  } else if (problemId === 2) { // Valid Parentheses
    wrapper += `
    s = json.loads(lines[0])
    res = isValid(s)
    print(json.dumps(res))
`;
  } else if (problemId === 3) { // Merge Two Sorted Lists
    wrapper += `
    l1 = build_list(json.loads(lines[0]))
    l2 = build_list(json.loads(lines[1]))
    res = mergeTwoLists(l1, l2)
    print(json.dumps(list_to_arr(res)))
`;
  } else if (problemId === 4) { // Best Time to Buy and Sell Stock
    wrapper += `
    prices = json.loads(lines[0])
    res = maxProfit(prices)
    print(json.dumps(res))
`;
  } else if (problemId === 5) { // Valid Palindrome
    wrapper += `
    s = json.loads(lines[0])
    res = isPalindrome(s)
    print(json.dumps(res))
`;
  } else if (problemId === 6) { // Maximum Subarray
    wrapper += `
    nums = json.loads(lines[0])
    res = maxSubArray(nums)
    print(json.dumps(res))
`;
  } else if (problemId === 7) { // 3Sum
    wrapper += `
    nums = json.loads(lines[0])
    res = threeSum(nums)
    print(json.dumps(res))
`;
  } else if (problemId === 8) { // Container With Most Water
    wrapper += `
    height = json.loads(lines[0])
    res = maxArea(height)
    print(json.dumps(res))
`;
  } else if (problemId === 9) { // Longest Substring Without Repeating Characters
    wrapper += `
    s = json.loads(lines[0])
    res = lengthOfLongestSubstring(s)
    print(json.dumps(res))
`;
  } else if (problemId === 10) { // Reverse Linked List
    wrapper += `
    head = build_list(json.loads(lines[0]))
    res = reverseList(head)
    print(json.dumps(list_to_arr(res)))
`;
  } else {
    wrapper += `
    print("Success")
`;
  }
  return wrapper;
};

// Java Wrapper Generator
const getJavaWrapperOld = (code, problemId) => {
  let wrapper = `
import java.util.*;
import java.io.*;

${code}
`;

  if (problemId === 3 || problemId === 10) {
    wrapper += `
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
`;
  }

  wrapper += `
public class Main {
    private static int[] parseIntArray(String s) {
        s = s.trim();
        s = s.substring(1, s.length() - 1).trim();
        if (s.isEmpty()) return new int[0];
        String[] parts = s.split(",");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            arr[i] = Integer.parseInt(parts[i].trim());
        }
        return arr;
    }

    private static String listToString(List<List<Integer>> list) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < list.size(); i++) {
            sb.append(list.get(i).toString().replace(" ", ""));
            if (i < list.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }
`;

  if (problemId === 3 || problemId === 10) {
    wrapper += `
    private static ListNode arrayToList(int[] arr) {
        if (arr.length == 0) return null;
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        for (int x : arr) {
            curr.next = new ListNode(x);
            curr = curr.next;
        }
        return dummy.next;
    }

    private static String listToArrayString(ListNode head) {
        List<Integer> list = new ArrayList<>();
        ListNode curr = head;
        while (curr != null) {
            list.add(curr.val);
            curr = curr.next;
        }
        return list.toString().replace(" ", "");
    }
`;
  }

  wrapper += `
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        List<String> lines = new ArrayList<>();
        String line;
        while ((line = br.readLine()) != null) {
            lines.add(line.trim());
        }
        if (lines.isEmpty()) return;

        Solution solver = new Solution();
`;

  if (problemId === 1) { // Two Sum
    wrapper += `
        int[] nums = parseIntArray(lines.get(0));
        int target = Integer.parseInt(lines.get(1));
        int[] res = solver.twoSum(nums, target);
        System.out.println(Arrays.toString(res).replace(" ", ""));
`;
  } else if (problemId === 2) { // Valid Parentheses
    wrapper += `
        String s = lines.get(0);
        if (s.startsWith("\\\"") && s.endsWith("\\\"")) {
            s = s.substring(1, s.length() - 1);
        }
        boolean res = solver.isValid(s);
        System.out.println(res);
`;
  } else if (problemId === 3) { // Merge Two Sorted Lists
    wrapper += `
        ListNode l1 = arrayToList(parseIntArray(lines.get(0)));
        ListNode l2 = arrayToList(parseIntArray(lines.get(1)));
        ListNode res = solver.mergeTwoLists(l1, l2);
        System.out.println(listToArrayString(res));
`;
  } else if (problemId === 4) { // Best Time to Buy and Sell Stock
    wrapper += `
        int[] prices = parseIntArray(lines.get(0));
        int res = solver.maxProfit(prices);
        System.out.println(res);
`;
  } else if (problemId === 5) { // Valid Palindrome
    wrapper += `
        String s = lines.get(0);
        if (s.startsWith("\\\"") && s.endsWith("\\\"")) {
            s = s.substring(1, s.length() - 1);
        }
        boolean res = solver.isPalindrome(s);
        System.out.println(res);
`;
  } else if (problemId === 6) { // Maximum Subarray
    wrapper += `
        int[] nums = parseIntArray(lines.get(0));
        int res = solver.maxSubArray(nums);
        System.out.println(res);
`;
  } else if (problemId === 7) { // 3Sum
    wrapper += `
        int[] nums = parseIntArray(lines.get(0));
        List<List<Integer>> res = solver.threeSum(nums);
        System.out.println(listToString(res));
`;
  } else if (problemId === 8) { // Container With Most Water
    wrapper += `
        int[] height = parseIntArray(lines.get(0));
        int res = solver.maxArea(height);
        System.out.println(res);
`;
  } else if (problemId === 9) { // Longest Substring Without Repeating Characters
    wrapper += `
        String s = lines.get(0);
        if (s.startsWith("\\\"") && s.endsWith("\\\"")) {
            s = s.substring(1, s.length() - 1);
        }
        int res = solver.lengthOfLongestSubstring(s);
        System.out.println(res);
`;
  } else if (problemId === 10) { // Reverse Linked List
    wrapper += `
        ListNode head = arrayToList(parseIntArray(lines.get(0)));
        ListNode res = solver.reverseList(head);
        System.out.println(listToArrayString(res));
`;
  } else {
    wrapper += `
        System.out.println("Success");
`;
  }

  wrapper += `
    }
}
`;
  return wrapper;
};

// C++ Wrapper Generator
const getCppWrapperOld = (code, problemId) => {
  let wrapper = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
using namespace std;
`;

  if (problemId === 3 || problemId === 10) {
    wrapper += `
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};
`;
  }

  wrapper += `
${code}

vector<int> parseVector(string s) {
    s = s.substr(1, s.length() - 2);
    stringstream ss(s);
    string item;
    vector<int> res;
    while (getline(ss, item, ',')) {
        if (!item.empty()) res.push_back(stoi(item));
    }
    return res;
}
`;

  if (problemId === 3 || problemId === 10) {
    wrapper += `
ListNode* buildList(vector<int> arr) {
    if (arr.empty()) return nullptr;
    ListNode* dummy = new ListNode(0);
    ListNode* curr = dummy;
    for (int x : arr) {
        curr->next = new ListNode(x);
        curr = curr->next;
    }
    return dummy->next;
}

void printList(ListNode* head) {
    cout << "[";
    while (head != nullptr) {
        cout << head->val;
        if (head->next != nullptr) cout << ",";
        head = head->next;
    }
    cout << "]" << endl;
}
`;
  }

  wrapper += `
int main() {
    string line1, line2;
    if (!getline(cin, line1)) return 0;
    
    Solution solver;
`;

  if (problemId === 1) { // Two Sum
    wrapper += `
    getline(cin, line2);
    vector<int> nums = parseVector(line1);
    int target = stoi(line2);
    vector<int> res = solver.twoSum(nums, target);
    cout << "[" << res[0] << "," << res[1] << "]" << endl;
`;
  } else if (problemId === 2) { // Valid Parentheses
    wrapper += `
    if (line1.front() == '"' && line1.back() == '"') {
        line1 = line1.substr(1, line1.length() - 2);
    }
    bool res = solver.isValid(line1);
    cout << (res ? "true" : "false") << endl;
`;
  } else if (problemId === 3) { // Merge Two Sorted Lists
    wrapper += `
    getline(cin, line2);
    ListNode* l1 = buildList(parseVector(line1));
    ListNode* l2 = buildList(parseVector(line2));
    ListNode* res = solver.mergeTwoLists(l1, l2);
    printList(res);
`;
  } else if (problemId === 4) { // Best Time to Buy and Sell Stock
    wrapper += `
    vector<int> prices = parseVector(line1);
    int res = solver.maxProfit(prices);
    cout << res << endl;
`;
  } else if (problemId === 5) { // Valid Palindrome
    wrapper += `
    if (line1.front() == '"' && line1.back() == '"') {
        line1 = line1.substr(1, line1.length() - 2);
    }
    bool res = solver.isPalindrome(line1);
    cout << (res ? "true" : "false") << endl;
`;
  } else if (problemId === 6) { // Maximum Subarray
    wrapper += `
    vector<int> nums = parseVector(line1);
    int res = solver.maxSubArray(nums);
    cout << res << endl;
`;
  } else if (problemId === 7) { // 3Sum
    wrapper += `
    vector<int> nums = parseVector(line1);
    vector<vector<int>> res = solver.threeSum(nums);
    cout << "[";
    for (size_t i = 0; i < res.size(); i++) {
        cout << "[" << res[i][0] << "," << res[i][1] << "," << res[i][2] << "]";
        if (i < res.size() - 1) cout << ",";
    }
    cout << "]" << endl;
`;
  } else if (problemId === 8) { // Container With Most Water
    wrapper += `
    vector<int> height = parseVector(line1);
    int res = solver.maxArea(height);
    cout << res << endl;
`;
  } else if (problemId === 9) { // Longest Substring Without Repeating Characters
    wrapper += `
    if (line1.front() == '"' && line1.back() == '"') {
        line1 = line1.substr(1, line1.length() - 2);
    }
    int res = solver.lengthOfLongestSubstring(line1);
    cout << res << endl;
`;
  } else if (problemId === 10) { // Reverse Linked List
    wrapper += `
    ListNode* head = buildList(parseVector(line1));
    ListNode* res = solver.reverseList(head);
    printList(res);
`;
  } else {
    wrapper += `
    cout << "Success" << endl;
`;
  }

  wrapper += `
  return 0;
}
`;
  return wrapper;
};

// JavaScript Wrapper Generator
const getJavaScriptWrapperOld = (code, problemId) => {
  let wrapper = `${code}\n\n`;

  if (problemId === 3 || problemId === 10) {
    wrapper += `
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}
function buildList(arr) {
  if (!arr || arr.length === 0) return null;
  let dummy = new ListNode(0);
  let curr = dummy;
  for (let val of arr) {
    curr.next = new ListNode(val);
    curr = curr.next;
  }
  return dummy.next;
}
function listToArr(head) {
  let arr = [];
  let curr = head;
  while (curr) {
    arr.push(curr.val);
    curr = curr.next;
  }
  return arr;
}
`;
  }

  wrapper += `
const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n').map(l => l.trim()).filter(Boolean);
if (lines.length > 0) {
`;

  if (problemId === 1) { // Two Sum
    wrapper += `
  const nums = JSON.parse(lines[0]);
  const target = parseInt(lines[1]);
  console.log(JSON.stringify(twoSum(nums, target)));
`;
  } else if (problemId === 2) { // Valid Parentheses
    wrapper += `
  let s = lines[0];
  if (s.startsWith('"') && s.endsWith('"')) {
    s = JSON.parse(s);
  }
  console.log(JSON.stringify(isValid(s)));
`;
  } else if (problemId === 3) { // Merge Two Sorted Lists
    wrapper += `
  const l1 = buildList(JSON.parse(lines[0]));
  const l2 = buildList(JSON.parse(lines[1]));
  const res = mergeTwoLists(l1, l2);
  console.log(JSON.stringify(listToArr(res)));
`;
  } else if (problemId === 4) { // Best Time to Buy and Sell Stock
    wrapper += `
  const prices = JSON.parse(lines[0]);
  console.log(JSON.stringify(maxProfit(prices)));
`;
  } else if (problemId === 5) { // Valid Palindrome
    wrapper += `
  let s = lines[0];
  if (s.startsWith('"') && s.endsWith('"')) {
    s = JSON.parse(s);
  }
  console.log(JSON.stringify(isPalindrome(s)));
`;
  } else if (problemId === 6) { // Maximum Subarray
    wrapper += `
  const nums = JSON.parse(lines[0]);
  console.log(JSON.stringify(maxSubArray(nums)));
`;
  } else if (problemId === 7) { // 3Sum
    wrapper += `
  const nums = JSON.parse(lines[0]);
  console.log(JSON.stringify(threeSum(nums)));
`;
  } else if (problemId === 8) { // Container With Most Water
    wrapper += `
  const height = JSON.parse(lines[0]);
  console.log(JSON.stringify(maxArea(height)));
`;
  } else if (problemId === 9) { // Longest Substring Without Repeating Characters
    wrapper += `
  let s = lines[0];
  if (s.startsWith('"') && s.endsWith('"')) {
    s = JSON.parse(s);
  }
  console.log(JSON.stringify(lengthOfLongestSubstring(s)));
`;
  } else if (problemId === 10) { // Reverse Linked List
    wrapper += `
  const head = buildList(JSON.parse(lines[0]));
  const res = reverseList(head);
  console.log(JSON.stringify(listToArr(res)));
`;
  } else {
    wrapper += `
  console.log("Success");
`;
  }

  wrapper += `
}
`;
  return wrapper;
};

const extractJSFuncName = (code) => {
  const match = code.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
  if (match) return match[1];
  const arrowMatch = code.match(/(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>/);
  if (arrowMatch) return arrowMatch[1];
  const classMatch = code.match(/class\s+([a-zA-Z0-9_]+)/);
  if (classMatch) return classMatch[1];
  return null;
};

const extractPyFuncName = (code) => {
  const match = code.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
  return match ? match[1] : null;
};

const getJavaScriptWrapper = (code, problemId, tags = []) => {
  if (problemId >= 1 && problemId <= 10) {
    return getJavaScriptWrapperOld(code, problemId);
  }
  const funcName = extractJSFuncName(code) || "solve";
  const isLinkedList = tags && tags.some(t => t.toLowerCase().includes("linked list"));

  let wrapper = `${code}\n\n`;

  if (isLinkedList) {
    wrapper += `
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}
function buildList(arr) {
  if (!arr || arr.length === 0) return null;
  let dummy = new ListNode(0);
  let curr = dummy;
  for (let val of arr) {
    curr.next = new ListNode(val);
    curr = curr.next;
  }
  return dummy.next;
}
function listToArr(head) {
  let arr = [];
  let curr = head;
  while (curr) {
    arr.push(curr.val);
    curr = curr.next;
  }
  return arr;
}
`;
  }

  wrapper += `
const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n').map(l => l.trim()).filter(Boolean);
if (lines.length > 0) {
  let args = lines.map(line => {
    try {
      return JSON.parse(line);
    } catch (e) {
      if (line.startsWith('"') && line.endsWith('"')) {
        return line.slice(1, -1);
      }
      return line;
    }
  });
`;

  if (isLinkedList) {
    wrapper += `
  args = args.map(arg => Array.isArray(arg) ? buildList(arg) : arg);
  let res = ${funcName}(...args);
  if (res && (res instanceof ListNode || res.val !== undefined)) {
    res = listToArr(res);
  }
  console.log(JSON.stringify(res));
`;
  } else {
    wrapper += `
  const res = ${funcName}(...args);
  console.log(JSON.stringify(res));
`;
  }

  wrapper += `
}
`;
  return wrapper;
};

const getPythonWrapper = (code, problemId, tags = []) => {
  if (problemId >= 1 && problemId <= 10) {
    return getPythonWrapperOld(code, problemId);
  }
  const funcName = extractPyFuncName(code) || "solve";
  const isLinkedList = tags && tags.some(t => t.toLowerCase().includes("linked list"));

  let wrapper = `${code}\n\n`;

  if (isLinkedList) {
    wrapper += `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def build_list(arr):
    if not arr: return None
    head = ListNode(arr[0])
    curr = head
    for x in arr[1:]:
        curr.next = ListNode(x)
        curr = curr.next
    return head

def list_to_arr(head):
    arr = []
    curr = head
    while curr:
        arr.append(curr.val)
        curr = curr.next
    return arr
`;
  }

  wrapper += `
import sys, json
if __name__ == "__main__":
    lines = [line.strip() for line in sys.stdin.read().splitlines() if line.strip()]
    if lines:
        args = []
        for line in lines:
            try:
                args.append(json.loads(line))
            except:
                if line.startswith('"') and line.endsWith('"'):
                    args.append(line[1:-1])
                else:
                    args.append(line)
`;

  if (isLinkedList) {
    wrapper += `
        args = [build_list(arg) if isinstance(arg, list) else arg for arg in args]
        res = ${funcName}(*args)
        if hasattr(res, 'val') or res is None:
            res = list_to_arr(res)
        print(json.dumps(res))
`;
  } else {
    wrapper += `
        res = ${funcName}(*args)
        print(json.dumps(res))
`;
  }
  return wrapper;
};

const getJavaWrapper = (code, problemId, tags = []) => {
  if (problemId >= 1 && problemId <= 10) {
    return getJavaWrapperOld(code, problemId);
  }
  const isLinkedList = tags && tags.some(t => t.toLowerCase().includes("linked list"));

  let wrapper = `
import java.util.*;
import java.io.*;
import java.lang.reflect.*;

${code}
`;

  if (isLinkedList) {
    wrapper += `
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
`;
  }

  wrapper += `
public class Main {
    private static int[] parseIntArray(String s) {
        s = s.trim();
        if (s.startsWith("[") && s.endsWith("]")) {
            s = s.substring(1, s.length() - 1).trim();
        }
        if (s.isEmpty()) return new int[0];
        String[] parts = s.split(",");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            arr[i] = Integer.parseInt(parts[i].trim());
        }
        return arr;
    }

    private static String listToString(List<?> list) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < list.size(); i++) {
            Object obj = list.get(i);
            if (obj instanceof List) {
                sb.append(listToString((List<?>)obj));
            } else {
                sb.append(obj.toString());
            }
            if (i < list.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString().replace(" ", "");
    }
`;

  if (isLinkedList) {
    wrapper += `
    private static ListNode arrayToList(int[] arr) {
        if (arr.length == 0) return null;
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        for (int x : arr) {
            curr.next = new ListNode(x);
            curr = curr.next;
        }
        return dummy.next;
    }

    private static String listToArrayString(ListNode head) {
        List<Integer> list = new ArrayList<>();
        ListNode curr = head;
        while (curr != null) {
            list.add(curr.val);
            curr = curr.next;
        }
        return list.toString().replace(" ", "");
    }
`;
  }

  wrapper += `
    private static Object parseArg(String s, Class<?> type) {
        s = s.trim();
        if (type == int.class || type == Integer.class) {
            return Integer.parseInt(s);
        } else if (type == double.class || type == Double.class) {
            return Double.parseDouble(s);
        } else if (type == boolean.class || type == Boolean.class) {
            return Boolean.parseBoolean(s);
        } else if (type == String.class) {
            if (s.startsWith("\\\"") && s.endsWith("\\\"")) {
                s = s.substring(1, s.length() - 1);
            } else if (s.startsWith("'") && s.endsWith("'")) {
                s = s.substring(1, s.length() - 1);
            }
            return s;
        } else if (type == int[].class) {
            return parseIntArray(s);
        } else if (type == List.class) {
            if (s.startsWith("[") && s.endsWith("]")) {
                s = s.substring(1, s.length() - 1);
            }
            String[] parts = s.split(",");
            List<String> list = new ArrayList<>();
            for (String p : parts) {
                list.add(p.trim());
            }
            return list;
        }
`;

  if (isLinkedList) {
    wrapper += `
        else if (type.getName().equals("ListNode")) {
            return arrayToList(parseIntArray(s));
        }
`;
  }

  wrapper += `
        return s;
    }

    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        List<String> lines = new ArrayList<>();
        String line;
        while ((line = br.readLine()) != null) {
            lines.add(line.trim());
        }
        if (lines.isEmpty()) return;

        Solution solver = new Solution();
        Method targetMethod = null;
        for (Method m : Solution.class.getDeclaredMethods()) {
            if (Modifier.isPublic(m.getModifiers())) {
                targetMethod = m;
                break;
            }
        }
        if (targetMethod == null) {
            System.out.println("No public method found in Solution class");
            return;
        }

        Class<?>[] paramTypes = targetMethod.getParameterTypes();
        Object[] parsedArgs = new Object[paramTypes.length];
        for (int i = 0; i < paramTypes.length; i++) {
            if (i < lines.size()) {
                parsedArgs[i] = parseArg(lines.get(i), paramTypes[i]);
            } else {
                parsedArgs[i] = null;
            }
        }

        Object result = targetMethod.invoke(solver, parsedArgs);
        if (result == null) {
            System.out.println("null");
        } else if (result instanceof List) {
            System.out.println(listToString((List<?>)result));
        } else if (result instanceof int[]) {
            System.out.println(Arrays.toString((int[])result).replace(" ", ""));
        }
`;

  if (isLinkedList) {
    wrapper += `
        else if (result.getClass().getName().equals("ListNode")) {
            System.out.println(listToArrayString((ListNode)result));
        }
`;
  }

  wrapper += `
        else {
            System.out.println(result.toString().trim());
        }
    }
}
`;
  return wrapper;
};

const getCppWrapper = (code, problemId, tags = []) => {
  if (problemId >= 1 && problemId <= 10) {
    return getCppWrapperOld(code, problemId);
  }
  const isLinkedList = tags && tags.some(t => t.toLowerCase().includes("linked list"));

  let wrapper = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
using namespace std;
`;

  if (isLinkedList) {
    wrapper += `
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};
`;
  }

  wrapper += `
${code}

vector<int> parseVector(string s) {
    if (s.front() == '[') s = s.substr(1);
    if (s.back() == ']') s = s.substr(0, s.length() - 1);
    stringstream ss(s);
    string item;
    vector<int> res;
    while (getline(ss, item, ',')) {
        if (!item.empty()) res.push_back(stoi(item));
    }
    return res;
}
`;

  if (isLinkedList) {
    wrapper += `
ListNode* buildList(vector<int> arr) {
    if (arr.empty()) return nullptr;
    ListNode* dummy = new ListNode(0);
    ListNode* curr = dummy;
    for (int x : arr) {
        curr->next = new ListNode(x);
        curr = curr->next;
    }
    return dummy->next;
}

void printList(ListNode* head) {
    cout << "[";
    while (head != nullptr) {
        cout << head->val;
        if (head->next != nullptr) cout << ",";
        head = head->next;
    }
    cout << "]" << endl;
}
`;
  }

  wrapper += `
int main() {
    string line1, line2;
    if (!getline(cin, line1)) return 0;
    Solution solver;
`;

  if (isLinkedList) {
    wrapper += `
    ListNode* l1 = buildList(parseVector(line1));
    if (getline(cin, line2)) {
        ListNode* l2 = buildList(parseVector(line2));
        printList(solver.solve(l1, l2));
    } else {
        printList(solver.solve(l1));
    }
`;
  } else {
    wrapper += `
    try {
        if (line1.front() == '[') {
            vector<int> nums = parseVector(line1);
            if (getline(cin, line2)) {
                int target = stoi(line2);
                auto res = solver.solve(nums, target);
                cout << res << endl;
            } else {
                auto res = solver.solve(nums);
                cout << res << endl;
            }
        } else {
            try {
                int val = stoi(line1);
                cout << solver.solve(val) << endl;
            } catch (...) {
                if (line1.front() == '"' && line1.back() == '"') {
                    line1 = line1.substr(1, line1.length() - 2);
                }
                cout << solver.solve(line1) << endl;
            }
        }
    } catch (...) {
        cout << "Success" << endl;
    }
`;
  }

  wrapper += `
    return 0;
}
`;
  return wrapper;
};

const getCWrapper = (code, problemId) => {
  let wrapper = `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <stdbool.h>\n\n${code}\n\n`;
  if (problemId === 1) { // Two Sum
    wrapper += `
int main() {
    char s[10000];
    if (!fgets(s, sizeof(s), stdin)) return 0;
    int target;
    if (scanf("%d", &target) != 1) return 0;
    
    int nums[1000];
    int size = 0;
    char* token = strtok(s + 1, ",]");
    while (token != NULL) {
        nums[size++] = atoi(token);
        token = strtok(NULL, ",]");
    }
    
    int returnSize;
    int* res = twoSum(nums, size, target, &returnSize);
    printf("[%d,%d]\\n", res[0], res[1]);
    free(res);
    return 0;
}
`;
  } else if (problemId === 2) { // Valid Parentheses
    wrapper += `
int main() {
    char s[10000];
    if (!fgets(s, sizeof(s), stdin)) return 0;
    s[strcspn(s, "\\n")] = 0;
    bool res = isValid(s);
    printf("%s\\n", res ? "true" : "false");
    return 0;
}
`;
  } else {
    wrapper += `
int main() {
    printf("Success\\n");
    return 0;
}
`;
  }
  return wrapper;
};

const runWithJudge0 = async (code, language, testCases, problemId, tags = []) => {
  const lang = language.toLowerCase();
  const langId = judge0Languages[lang];
  if (!langId) {
    throw new Error(`Unsupported language on Judge0: ${language}`);
  }

  const results = [];
  let passed = 0;

  for (const testCase of testCases) {
    let wrappedCode = code;
    if (lang === "javascript") {
      wrappedCode = getJavaScriptWrapper(code, problemId, tags);
    } else if (lang === "python") {
      wrappedCode = getPythonWrapper(code, problemId, tags);
    } else if (lang === "java") {
      wrappedCode = getJavaWrapper(code, problemId, tags);
    } else if (lang === "cpp" || lang === "c++") {
      wrappedCode = getCppWrapper(code, problemId, tags);
    } else if (lang === "c") {
      wrappedCode = getCWrapper(code, problemId);
    }

    const response = await axios.post(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        source_code: wrappedCode,
        language_id: langId,
        stdin: testCase.input,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    const run = response.data;
    if (run.status.id === 6) {
      // Compilation error
      const errMsg = run.compile_output || "Compile failed";
      return {
        passed: 0,
        total: testCases.length,
        results: testCases.map(() => ({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: `Compilation Error:\n${errMsg}`,
          passed: false,
        })),
      };
    }

    if (run.status.id !== 3 && run.status.id !== 4) {
      results.push({
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: `Runtime Error:\n${run.stderr || run.compile_output || run.status.description}`,
        passed: false,
      });
      continue;
    }

    const actualVal = (run.stdout || "").trim();
    const ok = normalizeOutput(actualVal) === normalizeOutput(testCase.expectedOutput);
    if (ok) passed += 1;

    results.push({
      input: testCase.input,
      expected: testCase.expectedOutput,
      actual: actualVal,
      passed: ok,
    });
  }

  return { passed, total: testCases.length, results };
};

// Global executeCode function that orchestrates everything
const executeCode = async (code, language, testCases, problemId) => {
  let tags = [];
  try {
    const Problem = require("../models/Problem");
    const problem = await Problem.findOne({ problemId });
    if (problem) tags = problem.tags || [];
  } catch (e) {
    console.warn("Failed to load problem tags dynamically inside executeCode:", e.message);
  }

  try {
    return await runWithJudge0(code, language, testCases, problemId, tags);
  } catch (err) {
    console.warn(`⚠️ Judge0 CE API failed, running locally: ${err.message}`);
  }

  const lang = language.toLowerCase();
  
  if (lang === "javascript") {
    return runJavaScript(code, testCases, problemId);
  }

  // Create workspace temp folder if not exists
  const tempDir = path.join(__dirname, "../temp_run");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const results = [];
  let passed = 0;

  if (lang === "python") {
    const pyCode = getPythonWrapper(code, problemId, tags);
    const filename = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}.py`;
    const filepath = path.join(tempDir, filename);
    fs.writeFileSync(filepath, pyCode);

    // Try python or python3
    let pyCommand = "python";
    const testPy = spawnSync("python", ["--version"]);
    if (testPy.error || testPy.status !== 0) {
      const testPy3 = spawnSync("python3", ["--version"]);
      if (!testPy3.error && testPy3.status === 0) {
        pyCommand = "python3";
      }
    }

    for (const testCase of testCases) {
      try {
        const runProcess = spawnSync(pyCommand, [filepath], {
          input: testCase.input,
          encoding: "utf-8",
          timeout: 4000,
        });

        if (runProcess.error) {
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: `Execution error: ${runProcess.error.message}`,
            passed: false,
          });
          continue;
        }

        if (runProcess.status !== 0) {
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: `Runtime error:\n${runProcess.stderr || "Exit code " + runProcess.status}`,
            passed: false,
          });
          continue;
        }

        const actualVal = runProcess.stdout.trim();
        const ok = normalizeOutput(actualVal) === normalizeOutput(testCase.expectedOutput);
        if (ok) passed += 1;

        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: actualVal,
          passed: ok,
        });
      } catch (err) {
        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: `Error: ${err.message}`,
          passed: false,
        });
      }
    }

    // Clean up
    try { fs.unlinkSync(filepath); } catch (e) {}
  } 
  else if (lang === "java") {
    const javaCode = getJavaWrapper(code, problemId, tags);
    // Java needs file named Main.java
    const runId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const mainDir = path.join(tempDir, `java_${runId}`);
    fs.mkdirSync(mainDir, { recursive: true });

    const filepath = path.join(mainDir, "Main.java");
    fs.writeFileSync(filepath, javaCode);

    // Compile
    const compile = spawnSync("javac", ["Main.java"], {
      cwd: mainDir,
      encoding: "utf-8",
      timeout: 6000,
    });

    if (compile.error) {
      results.push({
        input: testCases[0]?.input || "",
        expected: testCases[0]?.expectedOutput || "",
        actual: `Compilation failed: javac compiler not found on system path.`,
        passed: false,
      });
      // Clean up directory
      try { fs.rmSync(mainDir, { recursive: true, force: true }); } catch (e) {}
      return { passed: 0, total: testCases.length, results: Array(testCases.length).fill({
        input: "Compilation failed",
        expected: "",
        actual: "Java compiler (javac) not installed.",
        passed: false,
      })};
    }

    if (compile.status !== 0) {
      const compileErr = compile.stderr || compile.stdout || "Compile error";
      // Clean up directory
      try { fs.rmSync(mainDir, { recursive: true, force: true }); } catch (e) {}
      return { passed: 0, total: testCases.length, results: Array(testCases.length).fill({
        input: "Compilation failed",
        expected: "",
        actual: `Compilation Error:\n${compileErr}`,
        passed: false,
      })};
    }

    // Run test cases
    for (const testCase of testCases) {
      try {
        const runProcess = spawnSync("java", ["Main"], {
          cwd: mainDir,
          input: testCase.input,
          encoding: "utf-8",
          timeout: 4000,
        });

        if (runProcess.error) {
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: `Execution error: ${runProcess.error.message}`,
            passed: false,
          });
          continue;
        }

        if (runProcess.status !== 0) {
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: `Runtime error:\n${runProcess.stderr || "Exit code " + runProcess.status}`,
            passed: false,
          });
          continue;
        }

        const actualVal = runProcess.stdout.trim();
        const ok = normalizeOutput(actualVal) === normalizeOutput(testCase.expectedOutput);
        if (ok) passed += 1;

        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: actualVal,
          passed: ok,
        });
      } catch (err) {
        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: `Error: ${err.message}`,
          passed: false,
        });
      }
    }

    // Clean up
    try { fs.rmSync(mainDir, { recursive: true, force: true }); } catch (e) {}
  } 
  else if (lang === "cpp" || lang === "c++") {
    const cppCode = getCppWrapper(code, problemId, tags);
    const runId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const filename = `temp_${runId}.cpp`;
    const exename = `temp_${runId}.exe`;
    const filepath = path.join(tempDir, filename);
    const exepath = path.join(tempDir, exename);
    
    fs.writeFileSync(filepath, cppCode);

    // Compile
    const compile = spawnSync("g++", ["-O3", filename, "-o", exename], {
      cwd: tempDir,
      encoding: "utf-8",
      timeout: 10000,
    });

    if (compile.error) {
      results.push({
        input: testCases[0]?.input || "",
        expected: testCases[0]?.expectedOutput || "",
        actual: `Compilation failed: g++ compiler not found on system path.`,
        passed: false,
      });
      try { fs.unlinkSync(filepath); } catch (e) {}
      return { passed: 0, total: testCases.length, results: Array(testCases.length).fill({
        input: "Compilation failed",
        expected: "",
        actual: "g++ compiler not installed on system path.",
        passed: false,
      })};
    }

    if (compile.status !== 0) {
      const compileErr = compile.stderr || "Compilation failed";
      try { fs.unlinkSync(filepath); } catch (e) {}
      return { passed: 0, total: testCases.length, results: Array(testCases.length).fill({
        input: "Compilation failed",
        expected: "",
        actual: `Compilation Error:\n${compileErr}`,
        passed: false,
      })};
    }

    // Run test cases
    for (const testCase of testCases) {
      try {
        const runProcess = spawnSync(exepath, [], {
          input: testCase.input,
          encoding: "utf-8",
          timeout: 4000,
        });

        if (runProcess.error) {
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: `Execution error: ${runProcess.error.message}`,
            passed: false,
          });
          continue;
        }

        if (runProcess.status !== 0) {
          results.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: `Runtime error:\n${runProcess.stderr || "Exit code " + runProcess.status}`,
            passed: false,
          });
          continue;
        }

        const actualVal = runProcess.stdout.trim();
        const ok = normalizeOutput(actualVal) === normalizeOutput(testCase.expectedOutput);
        if (ok) passed += 1;

        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: actualVal,
          passed: ok,
        });
      } catch (err) {
        results.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: `Error: ${err.message}`,
          passed: false,
        });
      }
    }

    // Clean up
    try { fs.unlinkSync(filepath); } catch (e) {}
    try { fs.unlinkSync(exepath); } catch (e) {}
  } 
  else {
    return {
      passed: 0,
      total: testCases.length,
      results: Array(testCases.length).fill({
        input: "",
        expected: "",
        actual: `Unsupported programming language: ${language}`,
        passed: false,
      }),
    };
  }

  return { passed, total: testCases.length, results };
};

module.exports = { runJavaScript, executeCode, normalizeOutput };

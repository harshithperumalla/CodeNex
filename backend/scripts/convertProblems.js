const fs = require("fs");
const path = require("path");

const tsPath = path.resolve(__dirname, "../../Frontend/src/data/problems.ts");
const jsPath = path.resolve(__dirname, "problemsData.js");

console.log("Reading from:", tsPath);
let content = fs.readFileSync(tsPath, "utf8");

// Remove export interface definitions
content = content.replace(/export\s+interface\s+Problem\s*\{[\s\S]*?\}\r?\n\r?\n/g, "");

// Replace type annotations in exports
content = content.replace(/export\s+const\s+problems:\s*Problem\[\]\s*=/g, "const problems =");

// Remove other export keywords
content = content.replace(/export\s+const\s+/g, "const ");

// Append CommonJS exports
content += "\n\nmodule.exports = { problems, allTags, allCompanies };\n";

fs.writeFileSync(jsPath, content, "utf8");
console.log("Converted problems.ts to problemsData.js successfully!");

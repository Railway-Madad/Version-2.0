const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const pattern = process.argv.slice(2).join(" ").trim();
if (!pattern) {
  console.error('Usage: npm run api -- "GET /user/profile"');
  process.exit(1);
}

const reportPath = path.join(os.tmpdir(), `jest-api-${Date.now()}.json`);
const args = [
  "jest",
  "--config", "../unit-test/jest.config.js",
  "../unit-test/tests/routes/api-contract.test.js",
  "-t", pattern,
  "--runInBand",
  "--json",
  "--outputFile", reportPath,
  "--verbose=false",
  "--silent",
];

const runner = process.platform === "win32" ? "npx.cmd" : "npx";
const run = spawnSync(runner, args, { cwd: process.cwd(), encoding: "utf-8" });

let report;
try {
  report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
} catch {
  if (run.stdout) process.stdout.write(run.stdout);
  if (run.stderr) process.stderr.write(run.stderr);
  console.error("Could not read Jest JSON report.");
  process.exit(run.status || 1);
} finally {
  if (fs.existsSync(reportPath)) fs.unlinkSync(reportPath);
}

const suites = (report.testResults || [])
  .map((suite) => ({
    name: suite.name,
    tests: (suite.assertionResults || []).filter((t) => t.status === "passed" || t.status === "failed"),
  }))
  .filter((suite) => suite.tests.length > 0);

const tests = suites.flatMap((suite) => suite.tests);
const passed = tests.filter((t) => t.status === "passed").length;
const failed = tests.length - passed;

if (tests.length === 0) {
  console.error("No API test matched the provided pattern.");
  process.exit(1);
}

for (const suite of suites) {
  const failedInSuite = suite.tests.some((t) => t.status === "failed");
  console.log(`${failedInSuite ? "FAIL" : "PASS"}  ${path.relative(process.cwd(), suite.name)}`);
  for (const t of suite.tests) {
    const time = typeof t.duration === "number" ? ` (${t.duration} ms)` : "";
    console.log(`  [${t.status === "passed" ? "PASS" : "FAIL"}] ${t.title}${time}`);
    if (t.status === "failed" && Array.isArray(t.failureMessages) && t.failureMessages[0]) {
      console.log(`\n${t.failureMessages[0]}\n`);
    }
  }
}

console.log("");
console.log(`Pattern:     ${pattern}`);
console.log(`Test Suites: ${failed ? "some failed" : "all passed"}, ${suites.length} executed`);
console.log(`Tests:       ${passed} passed, ${failed} failed, ${tests.length} executed`);

process.exit(failed ? 1 : 0);

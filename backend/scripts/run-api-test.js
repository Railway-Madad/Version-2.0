const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const rawArg = process.argv.slice(2).join(" ").trim();
const runAll = !rawArg || rawArg === "--all" || rawArg.toLowerCase() === "all";
const pattern = runAll ? null : rawArg;

if (!runAll && !pattern) {
  console.error('Usage: npm run api -- "GET /user/profile"');
  console.error('   or: npm run api:all');
  process.exit(1);
}

const reportPath = path.join(os.tmpdir(), `jest-api-${Date.now()}.json`);
const tracePath = path.join(os.tmpdir(), `jest-api-trace-${Date.now()}.jsonl`);
const args = [
  "jest",
  "--config", "../unit-test/jest.config.js",
  "../unit-test/tests/routes",
  "--runInBand",
  "--json",
  "--outputFile", reportPath,
  "--verbose=false",
  "--silent",
];

if (!runAll) {
  args.splice(4, 0, "-t", pattern);
}

const runner = process.platform === "win32" ? "npx.cmd" : "npx";
const run = spawnSync(runner, args, {
  cwd: process.cwd(),
  encoding: "utf-8",
  env: { ...process.env, API_TRACE_FILE: tracePath },
});

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

let traces = [];
try {
  if (fs.existsSync(tracePath)) {
    traces = fs
      .readFileSync(tracePath, "utf-8")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  }
} catch {
  traces = [];
} finally {
  if (fs.existsSync(tracePath)) fs.unlinkSync(tracePath);
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
  console.error(runAll ? "No API tests were executed." : "No API test matched the provided pattern.");
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
console.log(`Pattern:     ${runAll ? "ALL ROUTE TESTS" : pattern}`);
console.log(`Test Suites: ${failed ? "some failed" : "all passed"}, ${suites.length} executed`);
console.log(`Tests:       ${passed} passed, ${failed} failed, ${tests.length} executed`);

if (!runAll) {
  const trace = traces.find((t) => t.pattern === pattern) || traces[0];
  if (trace) {
    console.log("");
    console.log("Single Test Trace:");
    console.log(`Test Case:   ${trace.testCase}`);
    console.log(`Path Followed: ${trace.pathFollowed}`);
    console.log(`Input JSON:  ${JSON.stringify(trace.inputJson, null, 2)}`);
    console.log(`Output JSON: ${JSON.stringify(trace.outputJson, null, 2)}`);
    if (typeof trace.statusCode === "number") {
      console.log(`Status Code: ${trace.statusCode}`);
    }
  }
} else {
  const visibleTraces = traces.filter((trace) => trace.statusCode !== 404);

  console.log("");
  console.log("All Test Traces:");

  if (!visibleTraces.length) {
    console.log("No trace entries were captured.");
  }

  visibleTraces.forEach((trace, index) => {
    console.log("");
    console.log(`Trace #${index + 1}:`);
    console.log(`Test Case:   ${trace.testCase}`);
    console.log(`Path Followed: ${trace.pathFollowed}`);
    console.log(`Input JSON:  ${JSON.stringify(trace.inputJson, null, 2)}`);
    console.log(`Output JSON: ${JSON.stringify(trace.outputJson, null, 2)}`);
    if (typeof trace.statusCode === "number") {
      console.log(`Status Code: ${trace.statusCode}`);
    }
  });
}

if (runAll) {
  const tracedCount = traces.filter((trace) => trace.statusCode !== 404).length;
  const passedTests = tests
    .filter((t) => t.status === "passed")
    .filter((t) => t.title !== "returns 404 for unknown route");

  console.log("");
  console.log(`Trace Coverage: ${tracedCount} trace entries captured.`);
  if (tracedCount < tests.length) {
    console.log(`Note: ${tests.length - tracedCount} executed tests did not emit trace metadata.`);
  }

  console.log("");
  console.log("Full Run Summary:");
  console.log(`Total Test Cases: ${tests.length}`);
  console.log(`Passed:           ${passed}`);
  console.log(`Failed:           ${failed}`);
  console.log("");
  console.log("Passed Test Cases:");
  passedTests.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.title}`);
  });
}

process.exit(failed ? 1 : 0);

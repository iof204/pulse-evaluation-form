/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const path = require("node:path");

const compiledRoot = process.argv[2];
if (!compiledRoot) throw new Error("Compiled test directory is required.");

const logic = require(path.join(compiledRoot, "lib/evaluateResults.js"));
const { evaluationQuestions } = require(path.join(compiledRoot, "app/questionnaireData.js"));
const { detailedResultCopy } = require(path.join(compiledRoot, "lib/detailedResultsData.js"));
const { buildResultsEmailHtml, createSampleResultsEmailInput } = require(path.join(compiledRoot, "lib/resultsEmailTemplate.js"));

const expectedScores = {
  4: [4, 3, 2, 1],
  5: [4, 3, 2, 1],
  6: [4, 4, 3, 1],
  7: [4, 4, 3, 1],
  8: [4, 4, 2, 1],
  9: [4, 3, 2, 1],
  10: [4, 3, 2, 1],
  11: [4, 3, 2, 1],
  12: [4, 4, 3, 1],
  13: [4, 4, 3, 1],
  16: [4, 4, 3, 1],
  17: [4, 3, 2, 1],
  18: [4, 3, 2, 1],
  19: [4, 4, 3, 1],
};

for (const [questionId, scores] of Object.entries(expectedScores)) {
  const question = evaluationQuestions.find(({ id }) => id === Number(questionId));
  assert.deepEqual(question.answers.map(({ score }) => score), scores);
}

function expectedPerspective({ strong, building, "needs-love": needsLove }) {
  if (strong === 7) return "all-strong";
  if (needsLove >= 3) return "several-needs-love";
  if (strong >= 4 && needsLove === 0) return "strong-overall";
  if ((strong >= 4 && needsLove <= 2) || (strong === 3 && building === 3 && needsLove === 1)) {
    return "strong-with-gaps";
  }
  if (building >= 4 && needsLove <= 2) return "building";
  return "mixed";
}

let distributionCount = 0;
for (let strong = 0; strong <= 7; strong += 1) {
  for (let building = 0; building <= 7 - strong; building += 1) {
    const counts = { strong, building, "needs-love": 7 - strong - building };
    assert.equal(logic.getPerspectiveKey(counts), expectedPerspective(counts), JSON.stringify(counts));
    distributionCount += 1;
  }
}
assert.equal(distributionCount, 36);

const section = (key, level, score) => ({ key, level, score });
const candidates = [
  section("brand", "building", 5),
  section("audience", "needs-love", 4),
  section("goals", "needs-love", 2),
  section("journey", "strong", 7),
];
assert.deepEqual(
  logic.selectPriorityAreas(candidates, { 1: ["awareness"] }).map(({ key }) => key),
  ["goals", "audience"],
);

const goalTie = [section("audience", "needs-love", 3), section("brand", "needs-love", 3)];
assert.deepEqual(
  logic.selectPriorityAreas(goalTie, { 1: ["awareness"] }).map(({ key }) => key),
  ["brand", "audience"],
);
assert.deepEqual(
  logic.selectPriorityAreas([section("retention", "building", 5), section("goals", "building", 5)], { 1: ["awareness"] }).map(({ key }) => key),
  ["goals", "retention"],
);

const toolTipMappings = [];
for (const [key, levels] of Object.entries(detailedResultCopy)) {
  for (const [level, copy] of Object.entries(levels)) {
    if (copy.toolTip) toolTipMappings.push(`${key}:${level}`);
  }
}
assert.deepEqual(toolTipMappings.sort(), [
  "audience:building",
  "campaign:building",
  "campaign:needs-love",
  "mix:building",
  "mix:needs-love",
  "retention:building",
  "retention:needs-love",
]);

const sampleEmailHtml = buildResultsEmailHtml(createSampleResultsEmailInput());
assert.match(sampleEmailHtml, /You have a lot of good pieces in place\. Your results suggest that the foundation is there/);
assert.equal((sampleEmailHtml.match(/A Little Ecko Reminder/g) || []).length, 1);
assert.doesNotMatch(sampleEmailHtml, /One Last Ecko Reminder/);

console.log(`Marketing Pulse QA passed: ${distributionCount} distributions, 14 scoring arrays, priority waterfall, 7 Tool Tip mappings, and detailed-email Perspective output.`);

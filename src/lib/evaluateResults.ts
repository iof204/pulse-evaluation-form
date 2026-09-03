import { evaluationQuestions } from "../app/questionnaireData";
import {
  perspectiveCopy,
  resultSections,
  type PerspectiveKey,
  type ResultLevel,
  type ResultSectionDefinition,
  type ResultSectionKey,
} from "../app/resultsData";

export type Responses = Record<number, string[]>;

export type EvaluatedSection = ResultSectionDefinition & {
  score: number;
  level: ResultLevel;
};

function scoreForQuestion(questionId: number, responses: Responses) {
  const question = evaluationQuestions.find(({ id }) => id === questionId);
  const answerId = responses[questionId]?.[0];
  return question?.answers.find(({ id }) => id === answerId)?.score ?? 0;
}

export function evaluateSections(responses: Responses): EvaluatedSection[] {
  return resultSections.map((section) => {
    const score = section.questionIds.reduce(
      (total, questionId) => total + scoreForQuestion(questionId, responses),
      0,
    );
    const level: ResultLevel =
      score >= 7 ? "strong" : score >= 5 ? "building" : "needs-love";
    return { ...section, score, level };
  });
}

export function getPerspectiveKey(
  counts: Record<ResultLevel, number>,
): PerspectiveKey {
  if (counts.strong === 7) return "all-strong";
  if (counts["needs-love"] >= 3) return "several-needs-love";
  if (counts.strong >= 4 && counts["needs-love"] === 0) return "strong-overall";
  if (
    (counts.strong >= 4 && counts["needs-love"] <= 2) ||
    (counts.strong === 3 &&
      counts.building === 3 &&
      counts["needs-love"] === 1)
  ) {
    return "strong-with-gaps";
  }
  if (counts.building >= 4 && counts["needs-love"] <= 2) return "building";
  return "mixed";
}

export function getPerspective(counts: Record<ResultLevel, number>) {
  return perspectiveCopy[getPerspectiveKey(counts)];
}

const fallbackPriority: ResultSectionKey[] = [
  "goals",
  "audience",
  "brand",
  "journey",
  "campaign",
  "mix",
  "retention",
];

const goalPriorities: Record<string, ResultSectionKey[]> = {
  awareness: ["brand", "audience", "campaign", "mix"],
  leads: ["audience", "journey", "goals", "retention", "mix"],
  sales: ["journey", "retention", "goals", "mix"],
  launch: ["goals", "audience", "brand", "campaign", "mix"],
  retention: ["retention", "audience", "brand", "mix"],
  foundation: ["goals", "audience", "brand", "mix", "campaign"],
  consistency: ["brand", "campaign", "mix", "retention"],
};

function priorityRank(section: ResultSectionKey, order: ResultSectionKey[]) {
  const rank = order.indexOf(section);
  return rank === -1 ? Number.POSITIVE_INFINITY : rank;
}

export function rankPrioritySections(
  sections: EvaluatedSection[],
  responses: Responses,
) {
  const selectedGoals = responses[1] ?? [];
  const primaryGoal = selectedGoals.length === 1 ? selectedGoals[0] : undefined;
  const goalOrder = primaryGoal ? goalPriorities[primaryGoal] : undefined;

  return [...sections].sort((a, b) => {
    const levelRank = (level: ResultLevel) =>
      level === "needs-love" ? 0 : level === "building" ? 1 : 2;
    const byLevel = levelRank(a.level) - levelRank(b.level);
    if (byLevel) return byLevel;

    const byScore = a.score - b.score;
    if (byScore) return byScore;

    if (goalOrder) {
      const aGoalRank = priorityRank(a.key, goalOrder);
      const bGoalRank = priorityRank(b.key, goalOrder);
      if (
        Number.isFinite(aGoalRank) &&
        Number.isFinite(bGoalRank) &&
        aGoalRank !== bGoalRank
      ) {
        return aGoalRank - bGoalRank;
      }
    }

    return priorityRank(a.key, fallbackPriority) - priorityRank(b.key, fallbackPriority);
  });
}

export function selectPriorityAreas(
  evaluated: EvaluatedSection[],
  responses: Responses,
  limit = 2,
) {
  return rankPrioritySections(
    evaluated.filter((section) => section.level !== "strong"),
    responses,
  ).slice(0, limit);
}

export function countLevels(evaluated: EvaluatedSection[]) {
  return evaluated.reduce<Record<ResultLevel, number>>(
    (total, section) => ({
      ...total,
      [section.level]: total[section.level] + 1,
    }),
    { strong: 0, building: 0, "needs-love": 0 },
  );
}

export const sampleEmailResponses: Responses = {
  4: ["same"],
  5: ["recognizable"],
  6: ["clear"],
  7: ["customers"],
  8: ["growth"],
  9: ["general"],
  10: ["occasionally"],
  11: ["overall"],
  12: ["promotion"],
  13: ["specific"],
  14: ["social"],
  15: ["email"],
  16: ["separate"],
  17: ["felt"],
  18: ["manual"],
  19: ["intentional"],
};

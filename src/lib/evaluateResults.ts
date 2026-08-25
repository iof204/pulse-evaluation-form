import { evaluationQuestions } from "../app/questionnaireData";
import { perspectiveCopy, resultSections, type ResultLevel, type ResultSectionDefinition } from "../app/resultsData";

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

export function getPerspective(counts: Record<ResultLevel, number>) {
  if (counts.strong === 7) return perspectiveCopy["all-strong"];
  if (counts.strong >= 5 && counts["needs-love"] === 0) return perspectiveCopy["strong-overall"];
  if (counts.strong >= 4 && counts["needs-love"] <= 2) return perspectiveCopy["strong-with-gaps"];
  if (counts.building >= 4 && counts["needs-love"] <= 2) return perspectiveCopy.building;
  if (counts["needs-love"] >= 4) return perspectiveCopy["several-needs-love"];
  return perspectiveCopy.mixed;
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

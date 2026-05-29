import {
  buildCardoGuardComparison,
  calculateCardoGuardReview,
  getSyntheticFalseAlarmRate
} from "./cardoGuard.js";

describe("cardoGuard", () => {
  it("calculates the hinge and recommendation from synthetic inputs", () => {
    const review = calculateCardoGuardReview({
      scenarioId: "routine-inspection-nudge",
      confidence: 78,
      costToAct: 80000,
      costToMiss: 90000
    });

    expect(getSyntheticFalseAlarmRate(78)).toBe(0.44);
    expect(review.recommendation).toBe("DO NOT ACT");
    expect(review.shouldAct).toBe(false);
    expect(review.expectedActionWaste).toBeCloseTo(35200);
    expect(review.expectedMissLoss).toBeCloseTo(19800);
    expect(review.explanation).toContain("Action-waste");
  });

  it("describes what would change the verdict", () => {
    const review = calculateCardoGuardReview({
      scenarioId: "road-closure-reroute",
      confidence: 82,
      costToAct: 180000,
      costToMiss: 1200000
    });

    expect(buildCardoGuardComparison(review)).toEqual([
      "Lower the cost of acting.",
      "Show a lower calibrated false-alarm band.",
      "Prove the miss cost is smaller than assumed.",
      "Narrow the scenario so the action is less broad."
    ]);
  });

  it("falls back to the default scenario and lowest confidence band when inputs are invalid", () => {
    const review = calculateCardoGuardReview({
      scenarioId: "missing-scenario",
      confidence: "abc",
      costToAct: -100,
      costToMiss: -200
    });

    expect(review.scenario.id).toBe("road-closure-reroute");
    expect(review.confidenceBand).toBe("very low");
    expect(getSyntheticFalseAlarmRate(65)).toBe(0.57);
    expect(review.costToAct).toBe(0);
    expect(review.costToMiss).toBe(0);
    expect(review.recommendation).toBe("DO NOT ACT");
  });
});

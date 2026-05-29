import {
  buildCardoGuardComparison,
  calculateCardoGuardReview,
  getSyntheticFalseAlarmRate,
  getConfidenceBand,
  formatMoney,
  calculateBreakevenMissCost
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
    expect(review.calibratedEventLikelihood).toBeCloseTo(0.56);
    expect(review.recommendation).toBe("ACT");
    expect(review.shouldAct).toBe(true);
    expect(review.expectedActionWaste).toBeCloseTo(35200);
    expect(review.expectedMissLoss).toBeCloseTo(50400);
    expect(review.decisionMarginRatio).toBeCloseTo(50400 / 35200); // ~1.43x
    expect(review.breakevenMissCost).toBeCloseTo(80000 * 0.44 / 0.56); // ~62,857
    expect(review.decisionStrength).toBe("Weak"); // 1.43x margin
    expect(review.explanation).toContain("Acting clears the gate");
  });

  it("describes what would change the verdict", () => {
    const review = calculateCardoGuardReview({
      scenarioId: "road-closure-reroute",
      confidence: 82,
      costToAct: 180000,
      costToMiss: 1200000
    });

    expect(buildCardoGuardComparison(review)).toEqual([
      "Make acting more expensive.",
      "Show this score band is wrong more often than assumed.",
      "Prove the miss cost is smaller than assumed.",
      "Show that the disruption impact is smaller or less likely than assumed."
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

  it("returns the opposite comparison advice when recommendation is DO NOT ACT", () => {
    const review = calculateCardoGuardReview({
      scenarioId: "road-closure-reroute",
      confidence: 89,
      costToAct: 200000,
      costToMiss: 30000
    });

    expect(review.recommendation).toBe("DO NOT ACT");
    expect(review.shouldAct).toBe(false);
    expect(buildCardoGuardComparison(review)).toEqual([
      "Make acting cheaper.",
      "Show this score band is wrong less often than assumed.",
      "Prove the miss cost is larger than assumed.",
      "Narrow the action so the response costs less."
    ]);
  });

  it("handles extreme decision margins and zero-cost edge cases", () => {
    // Very Strong: very high confidence + high miss cost relative to act cost
    const strong = calculateCardoGuardReview({
      scenarioId: "road-closure-reroute",
      confidence: 95,
      costToAct: 10000,
      costToMiss: 2000000
    });
    expect(strong.decisionStrength).toBe("Very Strong");
    expect(strong.decisionMarginRatio).toBeGreaterThanOrEqual(5);

    // Very Close: costs very nearly balanced (ratio < 1.1) at 78% band
    const close = calculateCardoGuardReview({
      scenarioId: "routine-inspection-nudge",
      confidence: 78,
      costToAct: 50000,
      costToMiss: 38286
    });
    expect(close.decisionStrength).toBe("Very Close");
    expect(close.decisionMarginRatio).toBeLessThan(1.1);

    // Zero cost edge case (both sides zero) should not explode and gives neutral margin
    const zeros = calculateCardoGuardReview({
      scenarioId: "road-closure-reroute",
      confidence: 89,
      costToAct: 0,
      costToMiss: 0
    });
    expect(zeros.decisionMarginRatio).toBe(1);
    expect(zeros.decisionStrength).toBe("Very Close");

    // Infinity case: costToAct = 0 but costToMiss has real value
    const infinityCase = calculateCardoGuardReview({
      scenarioId: "road-closure-reroute",
      confidence: 89,
      costToAct: 0,
      costToMiss: 500000
    });
    expect(infinityCase.decisionMarginRatio).toBe(Infinity);
    expect(infinityCase.decisionStrength).toBe("Very Strong");
  });

  it("covers remaining strength bands (Strong and Moderate)", () => {
    // Moderate (1.5x – 2.5x margin) at 78% band
    const moderate = calculateCardoGuardReview({
      scenarioId: "routine-inspection-nudge",
      confidence: 78,
      costToAct: 50000,
      costToMiss: 65000
    });
    expect(moderate.decisionStrength).toBe("Moderate");
    expect(moderate.decisionMarginRatio).toBeGreaterThanOrEqual(1.5);

    // Strong (2.5x – 5x margin) at 78% band
    const strongBand = calculateCardoGuardReview({
      scenarioId: "routine-inspection-nudge",
      confidence: 78,
      costToAct: 50000,
      costToMiss: 110000
    });
    expect(strongBand.decisionStrength).toBe("Strong");
    expect(strongBand.decisionMarginRatio).toBeGreaterThanOrEqual(2.5);
  });

  describe("pure helper functions", () => {
    it("getSyntheticFalseAlarmRate covers every confidence band", () => {
      expect(getSyntheticFalseAlarmRate(95)).toBe(0.09);
      expect(getSyntheticFalseAlarmRate(90)).toBe(0.15);
      expect(getSyntheticFalseAlarmRate(85)).toBe(0.31);
      expect(getSyntheticFalseAlarmRate(75)).toBe(0.44);
      expect(getSyntheticFalseAlarmRate(60)).toBe(0.57);
    });

    it("getConfidenceBand covers every confidence band", () => {
      expect(getConfidenceBand(95)).toBe("very high");
      expect(getConfidenceBand(90)).toBe("high");
      expect(getConfidenceBand(85)).toBe("moderate");
      expect(getConfidenceBand(75)).toBe("low");
      expect(getConfidenceBand(60)).toBe("very low");
    });

    it("formatMoney handles common and edge cases", () => {
      expect(formatMoney(0)).toBe("$0");
      expect(formatMoney(1234)).toBe("$1,234");
      expect(formatMoney(1465000)).toBe("$1,465,000");
      expect(formatMoney(17)).toBe("$17");
    });

    it("calculateBreakevenMissCost handles normal cases and the 100% false alarm edge", () => {
      // Normal operation
      expect(calculateBreakevenMissCost(10000, 0.15)).toBeCloseTo(1764.70588);
      expect(calculateBreakevenMissCost(80000, 0.44)).toBeCloseTo(62857.14286);

      // The previously unreachable defensive branch (falseAlarmRate === 1)
      expect(calculateBreakevenMissCost(50000, 1)).toBe(0);
      expect(calculateBreakevenMissCost(0, 1)).toBe(0);
    });
  });
});

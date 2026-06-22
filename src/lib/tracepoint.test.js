import {
  buildTracepointRows,
  buildTracepointReviewPacket,
  calculateTracepointDecision,
  calculateTracepointReview,
  getTracepointDecisionInputsFromScore,
  getTracepointScenarioById,
  getTracepointStatus
} from "./tracepoint.js";

describe("tracepoint", () => {
  it("builds a deterministic 7-day hourly dataset for Pump Station P-204", () => {
    const rows = buildTracepointRows();

    expect(rows).toHaveLength(168);
    expect(rows[0].asset_id).toBe("P-204");
    expect(rows[0].synthetic_truth_label).toBe("normal");
    expect(rows[167].synthetic_truth_label).toBe("pressure_instability");
    expect(rows.every((row) => row.asset_id === "P-204")).toBe(true);
  });

  it("builds a deterministic alternate dataset for Compressor C-118", () => {
    const rows = buildTracepointRows("compressor-c-118");

    expect(rows).toHaveLength(168);
    expect(rows[0].asset_id).toBe("C-118");
    expect(rows[0].synthetic_truth_label).toBe("normal");
    expect(rows.some((row) => row.synthetic_truth_label === "seal_wear_plus_pressure_ripple")).toBe(true);
    expect(rows[167].operating_state).toBe("Running");
  });

  it("labels the combined score using the visible thresholds", () => {
    expect(getTracepointStatus(0)).toBe("Normal");
    expect(getTracepointStatus(33.9)).toBe("Normal");
    expect(getTracepointStatus(34)).toBe("Watch");
    expect(getTracepointStatus(66.9)).toBe("Watch");
    expect(getTracepointStatus(67)).toBe("Review Recommended");
  });

  it("scores the synthetic scenario as review recommended and identifies the main driver", () => {
    const review = calculateTracepointReview(buildTracepointRows());

    expect(review.combinedScore).toBeGreaterThanOrEqual(67);
    expect(review.status).toBe("Review Recommended");
    expect(review.mainDriver).toBe("vibration_rms");
    expect(review.summary.totalWindows).toBe(168);
    expect(review.summary.reviewFlagsRaised).toBeGreaterThan(0);
    expect(review.summary.falseAlarms).toBeGreaterThanOrEqual(0);
    expect(review.summary.leadTimeHours).not.toBeNull();
  });

  it("scores the alternate scenario independently", () => {
    const review = calculateTracepointReview(buildTracepointRows("compressor-c-118"));

    expect(review.combinedScore).toBeGreaterThan(34);
    expect(["Watch", "Review Recommended"]).toContain(review.status);
    expect(review.summary.totalWindows).toBe(168);
    expect(review.summary.knownSyntheticWearWindows).toBeGreaterThan(0);
  });

  it("calculates expected costs with the requested breakeven logic", () => {
    const decision = calculateTracepointDecision({
      inspectionCost: 9200,
      missCost: 180000,
      calibratedProbability: 0.62,
      detectionRate: 0.8,
      followThroughRate: 0.9,
      harmReduction: 0.44
    });

    expect(decision.expectedCostAct).toBeCloseTo(
      9200 + 0.62 * 180000 * (1 - 0.8 * 0.9 * 0.44),
      2
    );
    expect(decision.expectedCostNoAct).toBeCloseTo(0.62 * 180000, 2);
    expect(decision.economicallyJustified).toBe(true);
    expect(decision.expectedGap).toBeGreaterThan(0);
  });

  it("builds a packet with the expected export fields", () => {
    const scenario = getTracepointScenarioById("pump-station-p-204");
    const rows = buildTracepointRows();
    const review = calculateTracepointReview(rows);
    const inputs = getTracepointDecisionInputsFromScore(review.combinedScore);
    const decision = calculateTracepointDecision({
      inspectionCost: 9200,
      missCost: 180000,
      calibratedProbability: inputs.calibratedProbability,
      harmReduction: inputs.harmReduction
    });
    const packet = buildTracepointReviewPacket({
      scenario,
      review,
      decision,
      reviewerMark: "valid concern",
      reviewerNotes: "Check bearing housing and confirm pressure transmitter calibration.",
      exportTimestamp: "2026-06-22T00:00:00.000Z"
    });

    expect(packet.scenario_metadata.asset_id).toBe("P-204");
    expect(packet.current_scores.status).toBe(review.status);
    expect(packet.reviewer_mark).toBe("valid concern");
    expect(packet.cost_inputs.calibrated_probability_issue_is_real).toBe(inputs.calibratedProbability);
    expect(packet.limitation_statement).toMatch(/synthetic calibration demo only/i);
    expect(packet.export_timestamp).toBe("2026-06-22T00:00:00.000Z");
  });
});

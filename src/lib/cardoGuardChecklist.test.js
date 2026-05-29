import fs from "node:fs";
import path from "node:path";

const checklistPath = path.resolve(process.cwd(), "docs/cardo_guard_checklist.md");

function loadChecklist() {
  return fs.readFileSync(checklistPath, "utf8");
}

describe("CARDO GUARD checklist", () => {
  it("keeps the launch gate sections and guardrail language in place", () => {
    const checklist = loadChecklist().toLowerCase();

    [
      "scope checks",
      "input checks",
      "hinge checks",
      "safety checks",
      "output checks",
      "regression checks",
      "do not ship if",
      "ship rule"
    ].forEach((heading) => {
      expect(checklist).toContain(heading);
    });

    [
      "decision validator, not a prediction engine",
      "synthetic or clearly labeled if real",
      "cost to act is stated in real units",
      "cost of missing is stated in real units",
      "the hinge is explicit in the output",
      "the recommendation follows from the stated costs",
      "does not claim improved model accuracy",
      "does not claim to replace expert judgment",
      "reads like a decision review, not a dashboard",
      "run the full flow once and verify the output before merging"
    ].forEach((phrase) => {
      expect(checklist).toContain(phrase);
    });
  });
});

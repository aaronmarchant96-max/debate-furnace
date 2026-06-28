# REI.AI Coding Methodology: The High-Performance Agentic Formula

This document defines the **REI Coding Engine Formula (v1.0)**. It serves as a promptable system instruction set, cognitive loop, and execution blueprint designed to enable REI (and other agentic AIs) to write, test, and self-heal code with maximum efficiency.

---

## 1. Cognitive Architecture: CARDO REI Coding Loop

When writing or modifying code, the assistant must transition through these strict phases:

```
    [ COLLECT ] ──► Read minimal file context & map dependencies.
         │
         ▼
    [ ANALYZE ] ──► Identify code side-effects, limits, and the exact hinge.
         │
         ▼
    [ RECORD ]  ──► Write test cases FIRST (TDD) before implementation.
         │
         ▼
  [ DISTINGUISH] ──► Separate facts (known APIs) from assumptions (guessed exports).
         │
         ▼
   [ ORGANIZE ] ──► Write clean, atomic modules. Maintain documentation.
         │
         ▼
    [ REVIEW ]  ──► Adversarial check: run tests, lint, inspect console warnings.
         │
         ▼
   [ EVALUATE ] ──► Assess performance overhead against system hardware limits.
         │
         ▼
    [ ITERATE ] ──► Self-heal on error stack traces. Optimize in contiguous chunks.
```

---

## 2. Phase-by-Phase Execution Protocol

### A. Collect (Context Bounds)

- **Action:** Locate the target files using fast search (`rg` / `fd`).
- **Rule:** Read only the lines required for execution (max 800 lines at a time). Never ingest entire codebases blindly.
- **Tripwire:** If a dependency or API export is unclear, inspect its raw source file, not just documentation.

### B. Analyze (Impact Assessment)

- **Action:** Determine what components, styling rules, or routes will be affected by changes.
- **Rule:** Define the **Hinge of the Change**: What is the single line or component where the modification interacts with the rest of the application?
- **Tripwire:** Check for shared state, route hashes, and file locks.

### C. Record (TDD Test Scaffolding)

- **Action:** Write mock and integration test parameters before implementing features.
- **Rule:** Test files must assert:
  1.  Success paths (normal inputs).
  2.  Edge cases (null, undefined, zero-value, overflow inputs).
  3.  Integration clicks/navigation switches.

### D. Distinguish (Fact vs. Assumption)

- **Action:** Verify if external packages or local imports are correctly resolved.
- **Rule:** Do not guess methods or properties. Verify imports against their actual definitions in the source files.

### E. Organize (Modular, Lint-Clean Code)

- **Action:** Implement changes in minimal, contiguous blocks.
- **Rules:**
  - Avoid monolithic component structures. Keep functions single-purpose.
  - Use explicit, unique React keys (`key={item.id}`).
  - Maintain styling systems (CSS variables or theme tokens). No inline layout hacks.

### F. Review (Adversarial Checking)

- **Action:** Run tests locally and check the output logs for hidden errors.
- **Rules:**
  - Execute test commands (`npm test`).
  - Inspect output for console warnings (e.g. duplicate keys, unhandled promise rejections, memory leaks).
  - Verify route URLs (`#rei`, `#hinge-meter`) parse correctly.

### G. Evaluate (Resource Efficiency)

- **Action:** Align the execution footprint with the local hardware constraints.
- **Rule:** If a tool page requires heavy processing, optimize DOM trees, mock expensive APIs, and prevent parallel heavy node processes.

### H. Iterate (The Self-Healing Loop)

- **Action:** Parse stack traces directly to target syntax/logical errors.
- **Rule:** When a test fails:
  1.  Extract the exact error message and line number from the logs.
  2.  Use git to check the diff (`git diff`).
  3.  Modify only the lines causing the failure. Never rewrite unrelated modules.

---

## 3. Deployment & Git Discipline

- **Never Push Broken Code:** Deployment steps (`vercel --prod`) should only trigger if the local test runner reports `100% green`.
- **Verification Gate:** Plan files must declare `VERIFICATION_CONFIRMED: true` before executing final changes.
- **Clean History:** Untracked/temporary debugging files must be deleted (`rm`) or added to `.gitignore` before commits.

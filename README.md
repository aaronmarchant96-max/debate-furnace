# REI.ai Platform by PromptHound Labs

REI.ai is a reasoning-first web app for structured decision support. The repo combines a live UI, a routing layer, a cost-aware decision gate, and a test suite that treats behavior as something to verify rather than simply observe.

Live demo: https://debate-furnace.vercel.app/#rei

Repository: https://github.com/aaronmarchant96-max/rei-ai-platform

What the repo contains

The core experience lives in src/REI.jsx and api/cfai.js. The app shell in src/AppShell.jsx routes between tools and keeps REI as the flagship experience. The Night Shift router in src/lib/nightShiftRouter.js classifies prompts before the model call. CARDO GUARD in src/lib/cardoGuard.js evaluates whether acting is worth the cost. The tests under src and api give the work a clear evidence trail.

Architecture decisions

The Night Shift router is rule-based and explicit. It sends simple greetings down a cheap fast path and preserves a premium path for adversarial or high-risk requests. That makes cost behavior easy to inspect and test.

The backend prompt scaffolding in api/cfai.js uses a hard-stop rule for underspecified requests. Instead of guessing, it asks for the missing context.

CARDO GUARD is deterministic. It makes a recommendation from cost and confidence, which makes it suitable for regression testing.

The app shell keeps the experience structured and reviewable rather than leaving everything inside a single chat flow.

Testing and evidence

The repo includes Jest coverage for routing behavior, app-shell flow, and CARDO GUARD decision logic. The tests are written as evidence gates and cover both happy paths and boundary cases.

Docs and references

Case study: CASE_STUDY.md

Master documentation: docs/REI_VIBE_MASTER_INDEX_TEMPLATE.md

Prompt and workflow notes: TOKEN_SAVERS.md

Development setup: DEVELOPMENT_SETUP.md

Token-saving workflow: TOKEN_SAVERS.md

Working reference: docs/fortis-et-liber.md

How to run

npm install
npm test
npm run build

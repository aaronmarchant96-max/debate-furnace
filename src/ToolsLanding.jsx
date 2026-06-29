const REPO_URL = "https://github.com/aaronmarchant96-max/debate-furnace";

export const TOOL_CARDS = [
  {
    id: "furnace",
    label: "Debate Furnace",
    title: "Pressure-test the hinge.",
    description:
      "Turn a question into a clean pressure test. Find the hinge, separate the noise, and decide what matters.",
    liveHref: "/",
    liveLabel: "Open demo",
    repoHref: REPO_URL,
    repoLabel: "GitHub repo",
  },
  {
    id: "story-forge",
    label: "Story Forge",
    title: "Old sources turn into story blueprints.",
    description:
      "Transform source material into story scaffolds while keeping the trail visible and the source boundary intact.",
    liveHref: "/#story-forge",
    liveLabel: "Open demo",
    repoHref: REPO_URL,
    repoLabel: "GitHub repo",
  },
  {
    id: "storm-replay",
    label: "Storm Replay",
    title: "Storm imagery gets a careful read.",
    description:
      "Replay historical storm imagery with calibration-minded review, explicit limits, and no forecasting claims.",
    liveHref: "/#storm-replay",
    liveLabel: "Open demo",
    repoHref: REPO_URL,
    repoLabel: "GitHub repo",
  },
  {
    id: "cardo-guard",
    label: "CARDO GUARD",
    title: "Cost beats confidence.",
    description:
      "Compare expected action cost versus expected miss cost, then keep the real decision gate visible.",
    liveHref: "/#cardo-guard",
    liveLabel: "Open demo",
    repoHref: REPO_URL,
    repoLabel: "GitHub repo",
  },
  {
    id: "rei",
    label: "REI.ai",
    title: "Your reasoning style, made visible.",
    description:
      "A shared reasoning layer that shows your hinge-first, evidence-first style across the whole suite.",
    liveHref: "/#rei",
    liveLabel: "Open demo",
    repoHref: REPO_URL,
    repoLabel: "GitHub repo",
  },
  {
    id: "tracepoint",
    label: "Tracepoint",
    title: "Industrial signal review with a human gate.",
    description: "Find the signal, show the evidence, and keep the call in human hands.",
    liveHref: "/#tracepoint",
    liveLabel: "Open demo",
    repoHref: REPO_URL,
    repoLabel: "GitHub repo",
  },
  {
    id: "cfai",
    label: "Hinge AI",
    title: "Evidence-first genealogy, no guesswork.",
    description:
      "Score evidence, ingest documents, and discover lineage connections with structured, reviewable outputs grounded in CARDO REI.",
    liveHref: "/#cfai",
    liveLabel: "Open demo",
    repoHref: REPO_URL,
    repoLabel: "GitHub repo",
  },
];

const FEEDBACK_PROMPTS = [
  "Does the scoring logic make sense for your use case?",
  "What other scenarios would you want to see?",
  "Are the thresholds intuitive, or would you adjust them?",
];

export default function ToolsLanding({ onOpenTool }) {
  return (
    <section className="tools-page">
      <header className="panel tools-hero">
        <div>
          <div className="eyebrow">PromptHound Labs</div>
          <h1>Tools</h1>
          <p className="lead">
            Pick the slice you need. REI.ai is the platform layer; each tool is a focused slice with its own job.
          </p>
          <div className="tools-hero__sub">
            Each tool is a focused, reviewable prototype with the same discipline: show the hinge,
            surface the limits, and make the next move obvious.
          </div>
        </div>
        <div className="tools-hero__aside">
          <div className="status-badge status-badge--muted">Live demos</div>
          <div className="status-badge status-badge--muted">Public repo links</div>
          <div className="status-badge status-badge--muted">Mobile-friendly</div>
        </div>
      </header>

      <section className="tools-grid" aria-label="PromptHound tools">
        {TOOL_CARDS.map((tool) => (
          <article key={tool.id} className="panel tools-card">
            <div className="card-label">{tool.label}</div>
            <h2>{tool.title}</h2>
            <p>{tool.description}</p>
            <div className="button-row tools-card__actions">
              <a
                className="pill pill--primary"
                href={tool.liveHref}
                onClick={(event) => {
                  event.preventDefault();
                  onOpenTool(tool.id);
                }}
              >
                {tool.liveLabel}
              </a>
              <a
                className="pill tools-card__link"
                href={tool.repoHref}
                target="_blank"
                rel="noreferrer"
              >
                {tool.repoLabel}
              </a>
            </div>
          </article>
        ))}
      </section>

      <section className="panel tools-feedback">
        <div className="panel__head">
          <div>
            <div className="eyebrow">Feedback</div>
            <h2>What to ask after a demo</h2>
          </div>
        </div>
        <div className="tools-feedback__grid">
          {FEEDBACK_PROMPTS.map((prompt) => (
            <div key={prompt} className="mini-card">
              <div className="tools-feedback__prompt">{prompt}</div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

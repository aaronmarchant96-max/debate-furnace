import { useEffect, useState } from "react";
import DebateFurnace from "./DebateFurnace.jsx";
import CreativeEngine from "./CreativeEngine.jsx";
import StormReplay from "./StormReplay.jsx";
import CardoGuard from "./CardoGuard.jsx";

const TOP_LEVEL = [
  {
    id: "furnace",
    label: "Debate Furnace",
    subtitle: "Arguments get pressure-tested here."
  },
  {
    id: "story-forge",
    label: "Story Forge",
    subtitle: "Old sources turn into story blueprints."
  },
  {
    id: "storm-replay",
    label: "Storm Replay",
    subtitle: "Storm imagery gets a careful read."
  },
  {
    id: "cardo-guard",
    label: "CARDO GUARD",
    subtitle: "Decision scores get a launch gate."
  }
];

function getInitialTool() {
  if (typeof window === "undefined") return "furnace";
  if (window.location.hash === "#story-forge") return "story-forge";
  if (window.location.hash === "#storm-replay") return "storm-replay";
  if (window.location.hash === "#cardo-guard") return "cardo-guard";
  return "furnace";
}

export default function AppShell() {
  const [tool, setTool] = useState(getInitialTool);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hashByTool = {
      furnace: "#furnace",
      "story-forge": "#story-forge",
      "storm-replay": "#storm-replay",
      "cardo-guard": "#cardo-guard"
    };
    const resolvedHash = hashByTool[tool] || "#furnace";
    if (window.location.hash !== resolvedHash) {
      window.history.replaceState({}, "", resolvedHash);
    }
    document.title =
      tool === "story-forge"
        ? "PromptHound Labs | Story Forge"
        : tool === "storm-replay"
          ? "PromptHound Labs | Storm Replay"
          : tool === "cardo-guard"
            ? "PromptHound Labs | CARDO GUARD"
          : "PromptHound Labs | Debate Furnace";
  }, [tool]);

  return (
    <div className="app-shell">
      <header className="shell-header">
        <div className="shell-brand">
          <div className="shell-brand__eyebrow">AI tools lab</div>
          <div className="shell-brand__title">PromptHound Labs</div>
          <div className="shell-brand__sub">Structured outputs for messy input.</div>
          <div className="shell-brand__method">Bring the hard question. We’ll find the hinge.</div>
          <div className="shell-brand__method shell-brand__method--sub">CARDO REI loop: build the slice, test what holds, keep the limits visible.</div>
        </div>

        <nav className="top-tabs" aria-label="Top-level tools">
          {TOP_LEVEL.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tool === item.id ? "top-tab is-active" : "top-tab"}
              onClick={() => setTool(item.id)}
              aria-pressed={tool === item.id}
            >
              <span className="top-tab__label">{item.label}</span>
              <span className="top-tab__sub">{item.subtitle}</span>
            </button>
          ))}
        </nav>
      </header>
      <main className="shell-main">
        {tool === "story-forge" ? (
          <CreativeEngine />
        ) : tool === "storm-replay" ? (
          <StormReplay />
        ) : tool === "cardo-guard" ? (
          <CardoGuard />
        ) : (
          <DebateFurnace />
        )}
      </main>
    </div>
  );
}

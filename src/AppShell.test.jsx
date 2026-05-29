import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AppShell from "./AppShell.jsx";

describe("AppShell", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    document.title = "";
  });

  it("defaults to Debate Furnace and updates the hash and title when switching tools", async () => {
    render(<AppShell />);

    expect(screen.getByText("PromptHound Labs")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /debate furnace/i })).toHaveAttribute("aria-pressed", "true");
    expect(document.title).toBe("PromptHound Labs | Debate Furnace");

    fireEvent.click(screen.getByRole("button", { name: /story forge/i }));

    await waitFor(() => {
      expect(window.location.hash).toBe("#story-forge");
    });
    await waitFor(() => {
      expect(document.title).toBe("PromptHound Labs | Story Forge");
    });
    expect(screen.getByRole("button", { name: /story forge/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Find the real pattern. Forge a new story.")).toBeInTheDocument();
  });

  it("respects the initial hash on load", () => {
    window.history.replaceState({}, "", "/#storm-replay");

    render(<AppShell />);

    expect(screen.getByRole("button", { name: /storm replay/i })).toHaveAttribute("aria-pressed", "true");
    expect(document.title).toBe("PromptHound Labs | Storm Replay");
  });
});

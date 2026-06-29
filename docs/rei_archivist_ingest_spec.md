/**
 * REI.AI Archivist — Raw Record Ingest (v2)
 * -------------------------------------------------------
 * Universal copy-paste ingest for genealogy source material:
 * Ancestry.com transcripts, FamilySearch record pages, Find A
 * Grave memorial pages — any raw text the user pastes in manually.
 * No scraping, no automated querying of any site. The user is the
 * one who visits the source and copies the text; REI only receives
 * what's pasted.
 *
 * v2 changes from the first pass:
 *   - Client-side length guard + live character counter (was
 *     backend-only, so failures only surfaced after a wasted round
 *     trip)
 *   - Ingested records now leave a visible trace in the chat
 *     transcript instead of riding along invisibly
 *   - rawRecordText/showIngest are cleared on domain switch, so a
 *     pasted record can't silently leak into a different tab
 *   - Optional source-type tag (Ancestry / FamilySearch / Find A
 *     Grave / Other) so the model starts tiering with better-
 *     grounded context
 *   - Fixed "Unburned Claims" -> "Unverified Claims" typo in the
 *     fallback text
 *
 * Two files change:
 *   1. src/REI.jsx        — textarea UI + payload wiring + safeguards
 *   2. api/cfai.js         — accept ingested text, enforce length cap
 */

// =========================================================
// FILE 1: src/REI.jsx
// =========================================================

/**
 * Shared constant — keep this in sync with the backend's
 * MAX_INPUT_CHARS in api/cfai.js. Defined once near the top of
 * REI.jsx, outside the component, so both the live counter and the
 * pre-send check use the same number.
 */
const MAX_RECORD_CHARS = 12000;

const SOURCE_TYPES = [
  { id: "ancestry", label: "Ancestry transcript" },
  { id: "familysearch", label: "FamilySearch record" },
  { id: "findagrave", label: "Find A Grave memorial" },
  { id: "other", label: "Other / unspecified" },
];

/**
 * STEP 1 — New state, alongside your existing useState calls
 * (selectedDomain, inputMessage, messages, isTyping):
 */
const [rawRecordText, setRawRecordText] = useState("");
const [showIngest, setShowIngest] = useState(false);
const [recordSourceType, setRecordSourceType] = useState("other");

/**
 * STEP 2 — Clear ingest state on domain switch.
 *
 * Add these three lines INSIDE your existing useEffect that runs
 * on selectedDomain change (the one that currently resets `messages`
 * and writes the domain-specific welcome message to localStorage).
 * Without this, a record pasted while on the Archivist tab would
 * silently survive a tab switch and attach to a message sent under
 * a completely different domain.
 *
 * Existing effect (abbreviated — only the addition is new):
 */
useEffect(() => {
  const domainSpecificMessage = {
    sender: "rei",
    text: `System initialized. Welcome to REI.AI ${currentDomain.label}. ${currentDomain.description} Let's begin our ${currentDomain.id === "coding" ? "coding session" : currentDomain.id === "genealogy" ? "research analysis" : currentDomain.id === "story" ? "story building" : "conversation"}!`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  setMessages([domainSpecificMessage]);
  if (typeof window !== "undefined") {
    localStorage.setItem(`rei_chat_history_${selectedDomain}`, JSON.stringify([domainSpecificMessage]));
  }

  // NEW — prevent a pasted record from leaking into a different domain
  setRawRecordText("");
  setShowIngest(false);
  setRecordSourceType("other");
}, [selectedDomain]);

/**
 * STEP 3 — The Ingest panel. Same collapse-by-default behavior as
 * before, now with a source-type selector and a live, color-coded
 * character counter instead of a silent backend-only cutoff.
 */
function IngestPanel() {
  if (selectedDomain !== "genealogy") return null;

  const charCount = rawRecordText.length;
  const overLimit = charCount > MAX_RECORD_CHARS;
  const nearLimit = charCount > MAX_RECORD_CHARS * 0.85;

  return (
    <div style={{ width: "100%", marginBottom: "10px" }}>
      <button
        type="button"
        onClick={() => setShowIngest((v) => !v)}
        style={{
          background: "rgba(251,146,60,0.08)",
          border: "1px solid rgba(251,146,60,0.25)",
          color: "#fdba74",
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "12.5px",
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: showIngest ? "8px" : "0",
        }}
      >
        {showIngest ? "− Hide Record Ingest" : "+ Paste a Record (Ancestry / FamilySearch / Find A Grave)"}
      </button>

      {showIngest && (
        <div>
          {/* Source type selector — helps the model start tiering
              with the right priors instead of guessing source
              reliability from formatting alone. */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
            {SOURCE_TYPES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setRecordSourceType(s.id)}
                style={{
                  fontSize: "11px",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  border: recordSourceType === s.id
                    ? "1px solid #f97316"
                    : "1px solid rgba(255,255,255,0.1)",
                  background: recordSourceType === s.id
                    ? "rgba(249,115,22,0.18)"
                    : "rgba(255,255,255,0.02)",
                  color: recordSourceType === s.id ? "#fed7aa" : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <textarea
            value={rawRecordText}
            onChange={(e) => setRawRecordText(e.target.value)}
            placeholder="Paste raw record text here — Ancestry transcript, FamilySearch page text, Find A Grave memorial details, census entry, etc. REI will evaluate and tier it as evidence alongside your question."
            rows={6}
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.25)",
              border: overLimit
                ? "1px solid #ef4444"
                : "1px solid rgba(251,146,60,0.2)",
              borderRadius: "8px",
              color: "#E2E8F0",
              fontSize: "12.5px",
              padding: "10px 12px",
              fontFamily: "monospace",
              resize: "vertical",
            }}
          />

          {charCount > 0 && (
            <div
              style={{
                fontSize: "11px",
                marginTop: "4px",
                color: overLimit ? "#f87171" : nearLimit ? "#fbbf24" : "#94a3b8",
              }}
            >
              {charCount.toLocaleString()} / {MAX_RECORD_CHARS.toLocaleString()} characters
              {overLimit && " — too long, trim before sending"}
              {!overLimit && nearLimit && " — approaching limit"}
              {!overLimit && !nearLimit && " — will attach to your next message, then clear"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * STEP 4 — handleSendMessage, updated with:
 *   - a pre-send length check (blocks send instead of wasting a
 *     round trip to the backend)
 *   - a visible record indicator stored on the user message itself,
 *     so the chat transcript shows when a record was attached
 *   - source type included in the payload
 */
async function handleSendMessage(e) {
  e.preventDefault();
  if (!inputMessage.trim()) return;

  const ingestedRecord = rawRecordText.trim();

  // Pre-send guard — fail fast, locally, instead of round-tripping
  // to the backend only to get rejected there.
  if (ingestedRecord.length > MAX_RECORD_CHARS) {
    setMessages((prev) => [
      ...prev,
      {
        sender: "rei",
        text: `That pasted record is ${ingestedRecord.length.toLocaleString()} characters — over the ${MAX_RECORD_CHARS.toLocaleString()} limit. Trim it to the relevant section (e.g. just the entry for the person in question) and try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isSystemNotice: true,
      },
    ]);
    return; // don't clear the textarea — let them edit and resend
  }

  const userMsg = {
    sender: "user",
    text: inputMessage,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    // NEW — visible trace of the attached record, shown in the
    // chat thread itself rather than disappearing into the payload.
    attachedRecord: ingestedRecord
      ? { charCount: ingestedRecord.length, sourceType: recordSourceType }
      : null,
  };

  setIsTyping(true);

  // Capture and clear ingest state up front, so it can't
  // accidentally attach to a later, unrelated message.
  setRawRecordText("");
  setShowIngest(false);
  setRecordSourceType("other");

  try {
    let systemContext = "..."; // unchanged — existing per-domain block

    const historyPayload = messages.slice(-10).map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    const sourceLabel = SOURCE_TYPES.find((s) => s.id === recordSourceType)?.label || "Other / unspecified";

    const recordBlock = ingestedRecord
      ? `\n\nIngested Source Record (pasted by user, source: ${sourceLabel} — treat as raw, unverified material to evaluate and tier, not as established fact):\n\"\"\"\n${ingestedRecord}\n\"\"\"\n`
      : "";

    const response = await fetch("/api/cfai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command: "score",
        input: `${systemContext}\n\nDomain: ${currentDomain.label}\nRules: ${currentDomain.rules.join(", ")}${recordBlock}\n\nUser Query: ${userMsg.text}`,
        history: historyPayload,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Server returned failure response status");
    }

    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        sender: "rei",
        text: data.result,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        rawJson: {
          engine: "REI-Hinge-Core v0.3",
          domain: selectedDomain,
          model: data.model || "Local cfai CLI Executable",
          timestamp: data.timestamp || new Date().toISOString(),
          hadIngestedRecord: Boolean(ingestedRecord),
          recordSourceType: ingestedRecord ? recordSourceType : null,
        },
      },
    ]);
  } catch (error) {
    console.error("REI.AI API error:", error);
    const fallbackText = `[REI.ai FALLBACK RESPONSE]
Confidence Score: 75%
Decision Hinge: Whether context boundaries explicitly justify the assertions.

Unverified Claims:
• Verification fallback active (Backend execution error: ${error.message}).

Limitations:
• Direct Groq backend not reachable. Running simulated local evaluation.`;

    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        sender: "rei",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        rawJson: {
          engine: "REI-Fallback v0.3",
          domain: selectedDomain,
          error: error.message,
          fallback: true,
        },
      },
    ]);
  } finally {
    setIsTyping(false);
  }
}

/**
 * STEP 5 — Rendering the attached-record indicator in the chat
 * transcript. Wherever you currently map over `messages` to render
 * each bubble, add this small badge above/inside user messages that
 * have `attachedRecord` set:
 *
 *   {msg.sender === "user" && msg.attachedRecord && (
 *     <div style={{
 *       fontSize: "10.5px",
 *       color: "#fdba74",
 *       marginBottom: "4px",
 *       display: "flex",
 *       alignItems: "center",
 *       gap: "4px",
 *     }}>
 *       📋 Record attached — {msg.attachedRecord.sourceType} ({msg.attachedRecord.charCount.toLocaleString()} chars)
 *     </div>
 *   )}
 *
 * This doesn't render the full pasted text inline (that would
 * clutter the thread) — just a visible, honest trace that a record
 * was part of that exchange, which matters for an "evidence-tiered,
 * auditable" tool. Clicking it later could optionally expand to
 * show the full pasted text, if you want that as a stretch feature.
 */

// =========================================================
// FILE 2: api/cfai.js
// =========================================================

/**
 * No scraping logic, no outbound fetches to FindAGrave/FamilySearch/
 * Ancestry — the "Ingested Source Record" block already arrives
 * embedded in the `input` string from REI.jsx, exactly like the rest
 * of the prompt (systemContext, Domain, Rules, User Query).
 *
 * The frontend now pre-checks length before sending, but keep this
 * backend guard too — never trust client-side validation alone.
 * A direct curl/API call (like the one you ran earlier testing
 * cfai.js directly) bypasses the frontend entirely, so the backend
 * is the only check that actually can't be skipped.
 *
 * MAX_INPUT_CHARS here should stay >= MAX_RECORD_CHARS from REI.jsx,
 * since `input` includes the record PLUS systemContext/Domain/Rules/
 * User Query wrapped around it — give it some headroom above the
 * record-only limit.
 */

const MAX_INPUT_CHARS = 14000; // record cap (12000) + room for the surrounding prompt scaffolding

// Add near the top of your existing request handler, right after
// you read `input` from req.body:
if (typeof input === "string" && input.length > MAX_INPUT_CHARS) {
  return res.status(400).json({
    success: false,
    error: `Input too long (${input.length} chars, max ${MAX_INPUT_CHARS}). If you pasted a large record, trim it to the relevant section.`,
  });
}

/**
 * That's the only required change in cfai.js. The rest of your
 * existing handler (Groq call, CLI fallback, empty-response guards
 * Vibe already added) stays untouched.
 *
 * One more thing worth a look while you're in this file, not
 * required for this feature but flagged since it's adjacent: your
 * earlier curl test against /api/cfai returned "Internal Server
 * Error" with no JSON body. If that's still the case for malformed
 * requests generally (not just the "server wasn't running" issue
 * from before), consider wrapping the whole handler body in a
 * try/catch that always returns a JSON error response — an HTML/
 * plaintext "Internal Server Error" from an API route is hard for
 * the frontend to parse as `data.error` and will itself trigger
 * your fallback text rather than showing the real cause.
 */

import { useMemo, useState } from "react";

const CASE_ID = "case_001";
const CASE_TITLE = "December 10 to 11, 2021 Tornado Outbreak Replay";
const CASE_STATUS = "Calibration pass";
const FRAMES_REVIEWED = 24;
const LIMITATION_STATEMENT = [
  "Storm Replay is not a forecasting system.",
  "Storm Replay is not a warning system.",
  "Storm Replay does not confirm tornado formation.",
  "It reviews historical weather imagery and prepares evidence for human inspection."
].join(" ");
const CONTACT_SHEET_URL = "https://github.com/aaronmarchant96-max/uap-footage-analyzer/tree/main/storm-replay";

const METRICS = {
  motion: { min: 0.0, max: 0.0162 },
  intensity: { min: 0.3791, max: 0.3844 },
  combined: { min: 0.0015, max: 0.0176 }
};

const REVIEW_MARK_OPTIONS = [
  "stable",
  "needs review",
  "possible false positive",
  "possible missed activity",
  "ignore"
];

function formatScore(value) {
  return Number(value).toFixed(4);
}

function buildFrames() {
  const rows = [];
  const motionValues = [
    0.0000, 0.0141, 0.0139, 0.0139, 0.0138, 0.0128, 0.0114, 0.0101,
    0.0096, 0.0100, 0.0098, 0.0093, 0.0074, 0.0053, 0.0040, 0.0041,
    0.0067, 0.0092, 0.0093, 0.0108, 0.0137, 0.0153, 0.0162, 0.0156
  ];
  const timestamps = [
    "2021-12-10 18:00 CST",
    "2021-12-10 18:15 CST",
    "2021-12-10 18:30 CST",
    "2021-12-10 18:45 CST",
    "2021-12-10 19:00 CST",
    "2021-12-10 19:15 CST",
    "2021-12-10 19:30 CST",
    "2021-12-10 19:45 CST",
    "2021-12-10 20:00 CST",
    "2021-12-10 20:15 CST",
    "2021-12-10 20:30 CST",
    "2021-12-10 20:45 CST",
    "2021-12-10 21:00 CST",
    "2021-12-10 21:15 CST",
    "2021-12-10 21:30 CST",
    "2021-12-10 21:45 CST",
    "2021-12-10 22:00 CST",
    "2021-12-10 22:15 CST",
    "2021-12-10 22:30 CST",
    "2021-12-10 22:45 CST",
    "2021-12-10 23:00 CST",
    "2021-12-10 23:15 CST",
    "2021-12-10 23:30 CST",
    "2021-12-10 23:45 CST"
  ];
  const frameNames = [
    "000_202112101800.png",
    "001_202112101815.png",
    "002_202112101830.png",
    "003_202112101845.png",
    "004_202112101900.png",
    "005_202112101915.png",
    "006_202112101930.png",
    "007_202112101945.png",
    "008_202112102000.png",
    "009_202112102015.png",
    "010_202112102030.png",
    "011_202112102045.png",
    "012_202112102100.png",
    "013_202112102115.png",
    "014_202112102130.png",
    "015_202112102145.png",
    "016_202112102200.png",
    "017_202112102215.png",
    "018_202112102230.png",
    "019_202112102245.png",
    "020_202112102300.png",
    "021_202112102315.png",
    "022_202112102330.png",
    "023_202112102345.png"
  ];
  const intensityValues = [
    0.3839, 0.3839, 0.3826, 0.3837, 0.3841, 0.3837, 0.3842, 0.3841,
    0.3835, 0.3822, 0.3815, 0.3823, 0.3828, 0.3835, 0.3838, 0.3825,
    0.3806, 0.3791, 0.3801, 0.3794, 0.3796, 0.3802, 0.3829, 0.3844
  ];
  const combinedValues = [
    0.0015, 0.0156, 0.0141, 0.0152, 0.0155, 0.0141, 0.0132, 0.0118,
    0.0107, 0.0102, 0.0107, 0.0094, 0.0078, 0.0064, 0.0054, 0.0042,
    0.0085, 0.0125, 0.0116, 0.0138, 0.0165, 0.0175, 0.0167, 0.0176
  ];

  for (let index = 0; index < FRAMES_REVIEWED; index += 1) {
    rows.push({
      frame: frameNames[index],
      timestamp: timestamps[index],
      motion_score: motionValues[index],
      intensity_score: intensityValues[index],
      combined_score: combinedValues[index],
      label: "low_activity",
      reviewer_mark: ""
    });
  }

  return rows;
}

function downloadJsonFile(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function MetricCard({ label, value, note }) {
  return (
    <div className="panel storm-card storm-card--metric">
      <div className="card-label">{label}</div>
      <div className="storm-metric">{value}</div>
      {note ? <div className="storm-note">{note}</div> : null}
    </div>
  );
}

export default function StormReplay() {
  const [reviewerNotes, setReviewerNotes] = useState(
    [
      "Most frames stay in a steady radar background and do not jump into a stronger label band.",
      "A few later frames rise slightly in motion score, but they still remain low_activity.",
      "No obvious false positives appeared in this pass because the detector stayed conservative.",
      "If there is meaningful storm structure in this slice, current thresholding may be too conservative to surface it.",
      "low_activity seems fair overall for this first calibration pass."
    ].join(" ")
  );
  const [rows, setRows] = useState(buildFrames);

  const summaryMetrics = useMemo(
    () => ({
      motion_score: "0.0000 to 0.0162",
      intensity_score: "0.3791 to 0.3844",
      combined_score: "0.0015 to 0.0176",
      label_count: "low_activity 24"
    }),
    []
  );

  function updateMark(index, value) {
    setRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, reviewer_mark: value } : row))
    );
  }

  function exportPacket() {
    const reviewer_marks = rows.map((row) => ({
      frame: row.frame,
      timestamp: row.timestamp,
      reviewer_mark: row.reviewer_mark || "ignore",
      label: row.label
    }));

    const payload = {
      case_id: CASE_ID,
      reviewer_marks,
      notes: reviewerNotes,
      summary_metrics: summaryMetrics,
      limitation_statement: LIMITATION_STATEMENT,
      exported_at: new Date().toISOString()
    };

    downloadJsonFile(`storm-replay-${CASE_ID}-review-packet.json`, payload);
  }

  return (
    <section className="storm-replay">
      <header className="storm-hero">
        <div className="storm-hero__copy">
          <div className="eyebrow">Storm Replay</div>
          <h1>Extract the signal inside historical storm imagery.</h1>
          <p className="lead">
            Historical weather signal extraction for human review. Not a forecast. Not an alert system.
          </p>
          <div className="storm-tagline">
            Replay the event. Extract the signal. Review the evidence. Keep the limits visible.
          </div>
        </div>
        <div className="storm-hero__status">
          <div className="storm-status">
            <span className="status-badge status-badge--violet">Beta</span>
            <span className="status-badge status-badge--cyan">Historical replay</span>
          </div>
          <div className="storm-hero__linkpanel">
            <div className="card-label">Source repo</div>
            <a href={CONTACT_SHEET_URL} target="_blank" rel="noreferrer">
              Contact sheet artifact lives in the Storm Replay source repo.
            </a>
          </div>
        </div>
      </header>

      <section className="storm-grid storm-grid--summary">
        <div className="panel storm-card">
          <div className="panel__head">
            <div>
              <div className="eyebrow">Case summary</div>
              <h2>{CASE_TITLE}</h2>
            </div>
            <div className="meta">Case 001</div>
          </div>
          <div className="storm-summary__rows">
            <div className="storm-summary__row">
              <span className="card-label">Case 001 name</span>
              <span>{CASE_TITLE}</span>
            </div>
            <div className="storm-summary__row">
              <span className="card-label">Status</span>
              <span className="status-badge status-badge--cyan">{CASE_STATUS}</span>
            </div>
            <div className="storm-summary__row">
              <span className="card-label">Frames reviewed</span>
              <span className="storm-metric">{FRAMES_REVIEWED}</span>
            </div>
            <div className="storm-summary__row">
              <span className="card-label">Current label result</span>
              <span className="storm-metric">24 low_activity</span>
            </div>
            <div className="storm-summary__row storm-summary__row--stacked">
              <span className="card-label">Limitation statement</span>
              <span className="storm-note">{LIMITATION_STATEMENT}</span>
            </div>
          </div>
        </div>

        <div className="panel storm-card storm-card--placeholder">
          <div className="panel__head">
            <div>
              <div className="eyebrow">Contact sheet preview</div>
              <h2>Artifact preview</h2>
            </div>
            <div className="meta">Placeholder panel</div>
          </div>
          <div className="storm-placeholder">
            <div className="storm-placeholder__title">Contact sheet artifact lives in the Storm Replay source repo.</div>
            <div className="storm-placeholder__text">
              This frontend shows the case summary and review workflow. The rendered SVG sheet is stored in the source repo.
            </div>
            <a className="storm-placeholder__link" href={CONTACT_SHEET_URL} target="_blank" rel="noreferrer">
              Open source repo
            </a>
          </div>
        </div>
      </section>

      <section className="storm-grid storm-grid--metrics">
        <MetricCard
          label="Motion score range"
          value={`${formatScore(METRICS.motion.min)} to ${formatScore(METRICS.motion.max)}`}
          note="Observed on the Case 001 calibration pass."
        />
        <MetricCard
          label="Intensity score range"
          value={`${formatScore(METRICS.intensity.min)} to ${formatScore(METRICS.intensity.max)}`}
          note="Flat enough to stay conservative."
        />
        <MetricCard
          label="Combined score range"
          value={`${formatScore(METRICS.combined.min)} to ${formatScore(METRICS.combined.max)}`}
          note="Useful for calibration notes, not forecasting."
        />
        <MetricCard
          label="Label count"
          value="low_activity 24"
          note="No higher label band surfaced in this pass."
        />
      </section>

      <section className="panel storm-card storm-table-card">
        <div className="panel__head">
          <div>
            <div className="eyebrow">Events review</div>
            <h2>Static sample rows</h2>
          </div>
          <div className="meta">Case 001 calibration pass</div>
        </div>

        <div className="storm-table-wrap">
          <table className="storm-table">
            <thead>
              <tr>
                <th>frame</th>
                <th>timestamp</th>
                <th>motion_score</th>
                <th>intensity_score</th>
                <th>combined_score</th>
                <th>label</th>
                <th>reviewer mark</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.frame}>
                  <td className="storm-table__mono">{row.frame}</td>
                  <td>{row.timestamp}</td>
                  <td className="storm-table__mono">{formatScore(row.motion_score)}</td>
                  <td className="storm-table__mono">{formatScore(row.intensity_score)}</td>
                  <td className="storm-table__mono">{formatScore(row.combined_score)}</td>
                  <td>
                    <span className="status-badge status-badge--muted">{row.label}</span>
                  </td>
                  <td>
                    <select
                      className="storm-select"
                      value={row.reviewer_mark}
                      onChange={(event) => updateMark(index, event.target.value)}
                      aria-label={`Reviewer mark for ${row.frame}`}
                    >
                      <option value="">Select mark</option>
                      {REVIEW_MARK_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="storm-grid storm-grid--review">
        <div className="panel storm-card">
          <div className="panel__head">
            <div>
              <div className="eyebrow">Review notes</div>
              <h2>Manual reviewer notes</h2>
            </div>
          </div>
          <textarea
            className="storm-notes"
            rows={8}
            value={reviewerNotes}
            onChange={(event) => setReviewerNotes(event.target.value)}
            placeholder="Write quick calibration notes here."
          />
          <div className="storm-note">
            Most frames stay in a steady radar background and do not jump into a stronger label band.
          </div>
        </div>

        <div className="panel storm-card">
          <div className="panel__head">
            <div>
              <div className="eyebrow">Methodology and limits</div>
              <h2>Review framing</h2>
            </div>
          </div>
          <div className="storm-method">
            <p>Storm Replay is not a forecasting system.</p>
            <p>Storm Replay is not a warning system.</p>
            <p>Storm Replay does not confirm tornado formation.</p>
            <p>It reviews historical weather imagery and prepares evidence for human inspection.</p>
          </div>
          <div className="storm-method__footer">
            The goal is to keep limits visible while the detector explains its scoring.
          </div>
        </div>
      </section>

      <section className="storm-footer">
        <button type="button" className="pill pill--primary pill--large" onClick={exportPacket}>
          Export review packet
        </button>
        <div className="storm-footer__meta">
          <div className="storm-note">Exports include case_id, reviewer marks, notes, summary metrics, limitation statement, and timestamp.</div>
          <div className="storm-note">Downloads happen locally in the browser.</div>
        </div>
      </section>
    </section>
  );
}

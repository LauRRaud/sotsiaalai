// Fix chat analysis header + empty state layout in ChatBody.jsx

const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "components", "alalehed", "ChatBody.jsx");

let src = fs.readFileSync(file, "utf8");

function replaceAny(haystack, variants, replacement) {
  for (const v of variants) {
    if (haystack.includes(v)) {
      return haystack.replace(v, replacement);
    }
  }
  return haystack;
}

// 1) Header: remove "Laadi dokument" from header, keep only X in top-right
const oldHeaderVariants = [
  `              <header className="chat-analysis-header">
                <div className="chat-analysis-actions">
                  {!uploadPreview ? (
                    <button
                      type="button"
                      className="btn-tertiary chat-analysis-close"
                      onClick={onPickFile}
                      disabled={uploadBusy || isGenerating}
                    >
                      {t("chat.upload.aria", "Laadi dokument")}
                    </button>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="btn-tertiary chat-analysis-close"
                  onClick={() => {
                    setUploadPreview(null);
                    setUploadError(null);
                    setEphemeralChunks([]);
                    setUseAsContext(false);
                    closeAnalysisPanel();
                  }}
                  aria-label={t("buttons.close", "Sulge")}
                  style={{ marginLeft: "auto" }}
                >
                  ×
                </button>
              </header>`,
  // Variant with replacement char instead of × as seen in CLI
  `              <header className="chat-analysis-header">
                <div className="chat-analysis-actions">
                  {!uploadPreview ? (
                    <button
                      type="button"
                      className="btn-tertiary chat-analysis-close"
                      onClick={onPickFile}
                      disabled={uploadBusy || isGenerating}
                    >
                      {t("chat.upload.aria", "Laadi dokument")}
                    </button>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="btn-tertiary chat-analysis-close"
                  onClick={() => {
                    setUploadPreview(null);
                    setUploadError(null);
                    setEphemeralChunks([]);
                    setUseAsContext(false);
                    closeAnalysisPanel();
                  }}
                  aria-label={t("buttons.close", "Sulge")}
                  style={{ marginLeft: "auto" }}
                >
                  �
                </button>
              </header>`,
];

const newHeader = `              <header className="chat-analysis-header">
                <button
                  type="button"
                  onClick={() => {
                    setUploadPreview(null);
                    setUploadError(null);
                    setEphemeralChunks([]);
                    setUseAsContext(false);
                    closeAnalysisPanel();
                  }}
                  aria-label={t("buttons.close", "Sulge")}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "1.3rem",
                    lineHeight: 1,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </header>`;

src = replaceAny(src, oldHeaderVariants, newHeader);

// 2) Empty state: center "Laadi dokument" and show usage text under it
const oldEmptyVariants = [
  `                  <div className="chat-analysis-empty">
                    <p className="chat-analysis-meta">
                      {uploadUsage?.limit
                        ? t("chat.upload.usage", "{used}/{limit} anal��si t��na")
                            .replace(
                              "{used}",
                              String(
                                Math.max(
                                  0,
                                  (uploadUsage.limit ?? 0) - (uploadUsage.used ?? 0)
                                )
                              )
                            )
                            .replace("{limit}", String(uploadUsage.limit ?? 0))
                        : ""}
                    </p>
                  </div>`,
  `                  <div className="chat-analysis-empty">
                    <p className="chat-analysis-meta">
                      {uploadUsage?.limit
                        ? t("chat.upload.usage", "{used}/{limit} analüüsi täna")
                            .replace(
                              "{used}",
                              String(
                                Math.max(
                                  0,
                                  (uploadUsage.limit ?? 0) - (uploadUsage.used ?? 0)
                                )
                              )
                            )
                            .replace("{limit}", String(uploadUsage.limit ?? 0))
                        : ""}
                    </p>
                  </div>`,
];

const newEmpty = `                  <div className="chat-analysis-empty">
                    <button
                      type="button"
                      className="chat-upload-action-btn"
                      onClick={onPickFile}
                      disabled={uploadBusy || isGenerating}
                    >
                      {t("chat.upload.aria", "Laadi dokument")}
                    </button>
                    <p className="chat-analysis-meta" style={{ marginTop: "0.35rem" }}>
                      {uploadUsage?.limit
                        ? t("chat.upload.usage", "{used}/{limit} analüüsi täna")
                            .replace(
                              "{used}",
                              String(
                                Math.max(
                                  0,
                                  (uploadUsage.limit ?? 0) - (uploadUsage.used ?? 0)
                                )
                              )
                            )
                            .replace("{limit}", String(uploadUsage.limit ?? 0))
                        : ""}
                    </p>
                  </div>`;

src = replaceAny(src, oldEmptyVariants, newEmpty);

fs.writeFileSync(file, src, "utf8");


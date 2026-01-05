export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      style={{
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--page-bg)",
        backgroundImage: "linear-gradient(180deg, var(--page-bg-top) 0%, var(--page-bg-bottom) 100%)",
      }}
    >
      <span style={{ opacity: 0.75, color: "var(--text-main, #e5e7eb)" }}>Laen...</span>
    </div>
  );
}

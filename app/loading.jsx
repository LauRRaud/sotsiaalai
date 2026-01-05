export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      style={{
        minHeight: "100dvh",
        width: "100%",
        backgroundColor: "var(--page-bg, var(--page-bg-fallback))",
        backgroundImage:
          "linear-gradient(180deg, var(--page-bg-top, var(--page-bg-top-fallback)) 0%, var(--page-bg-bottom, var(--page-bg-bottom-fallback)) 100%)",
      }}
    />
  );
}

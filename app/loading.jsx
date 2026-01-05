export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      style={{
        minHeight: "100dvh",
        width: "100%",
        backgroundColor: "var(--page-bg, #050a10)",
        backgroundImage:
          "linear-gradient(180deg, var(--page-bg-top, #02050f) 0%, var(--page-bg-bottom, #050a10) 100%)",
      }}
    />
  );
}

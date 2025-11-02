"use client";
export default function RichText({
  value,
  as: Component = "span",
  className,
  replacements = {},
}) {
  if (!value) return null;
  let html = value;
  Object.entries(replacements).forEach(([tag, replacement]) => {
    if (!replacement) return;
    const { open = "", close = "" } =
      typeof replacement === "string"
        ? { open: replacement, close: "" }
        : replacement;
    const openRe = new RegExp(`<${tag}>`, "g");
    const closeRe = new RegExp(`</${tag}>`, "g");
    html = html.replace(openRe, open).replace(closeRe, close);
  });
  return <Component className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

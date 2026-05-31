export const linkBrandBase =
  // Used on both <a> and <button> elements.
  // Buttons can have UA default background/appearance (especially on mobile),
  // which makes them look like a filled gray pill. We reset that here.
  "inline-block appearance-none bg-transparent cursor-pointer " +
  "text-[1.1em] font-[500] tracking-[0.03em] px-[0.2em] py-[0.02em] " +
  "rounded-[0.32em] border-[2px] border-transparent no-underline " +
  // IMPORTANT: `!text-*` ensures brand links win over contextual selectors like `.glass-box a { color: ... }`.
  "!text-[color:var(--link-brand-text,var(--link-color,#f2e3d4))] " +
  "transition-[border-color,box-shadow,color] duration-150 " +
  "hover:!text-[color:var(--link-brand-text,var(--link-color,#f2e3d4))] " +
  "hover:border-[color:var(--link-brand-border-hover,#e1a0a0)] " +
  "hover:shadow-[0_0_0.4375rem_0_var(--link-brand-shadow-hover,rgba(175,170,163,0.4))] " +
  // Touch/keyboard parity: show the same box while pressing.
  "active:!text-[color:var(--link-brand-text,var(--link-color,#f2e3d4))] " +
  "active:border-[color:var(--link-brand-border-hover,#e1a0a0)] " +
  "active:shadow-[0_0_0.4375rem_0_var(--link-brand-shadow-hover,rgba(175,170,163,0.4))] " +
  "focus-visible:outline-none " +
  "focus-visible:!text-[color:var(--link-brand-text,var(--link-color,#f2e3d4))] " +
  "focus-visible:border-[color:var(--link-brand-border-hover,#e1a0a0)] " +
  "focus-visible:shadow-[0_0_0.4375rem_0_var(--link-brand-shadow-hover,rgba(175,170,163,0.4))] " +
  // Disabled buttons should not revert to UA gray background.
  "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-transparent " +
  // Light theme overrides: use the configured link color, still with `!` to win over `.glass-box a`.
  "light:!text-[color:var(--link-color)] light:border-transparent " +
  "light:hover:!text-[color:var(--link-color)] light:hover:border-[color:var(--link-color)] " +
  "light:active:!text-[color:var(--link-color)] light:active:border-[color:var(--link-color)] " +
  "light:focus-visible:!text-[color:var(--link-color)] light:focus-visible:border-[color:var(--link-color)] " +
  // HC theme: keep strong accent
  "hc:!text-[color:var(--hc-accent)] hc:hover:!text-[color:var(--hc-accent)] " +
  "hc:active:!text-[color:var(--hc-accent)] hc:focus-visible:!text-[color:var(--hc-accent)]";

const linkBrandInline = "text-[0.95em] tracking-[0.02em] px-[0.18em]";

export const linkBrandInlineClass = `${linkBrandBase} ${linkBrandInline}`;

export const linkRichTextBase =
  "inline appearance-none bg-transparent cursor-pointer " +
  "font-[500] tracking-[0.01em] align-baseline " +
  "border-0 p-0 m-0 rounded-none no-underline shadow-none " +
  "!text-[color:var(--link-brand-text,var(--brand-primary))] " +
  "transition-[color] duration-150 " +
  "hover:!text-[color:var(--link-brand-text,var(--brand-primary))] " +
  "hover:border-transparent hover:shadow-none " +
  "active:!text-[color:var(--link-brand-text,var(--brand-primary))] " +
  "active:border-transparent active:shadow-none " +
  "focus-visible:outline-none " +
  "focus-visible:!text-[color:var(--link-brand-text,var(--brand-primary))] " +
  "focus-visible:border-transparent focus-visible:shadow-none " +
  "light:!text-[color:var(--link-color,#7a3a38)] " +
  "light:hover:!text-[color:var(--link-color,#7a3a38)] " +
  "light:active:!text-[color:var(--link-color,#7a3a38)] " +
  "light:focus-visible:!text-[color:var(--link-color,#7a3a38)] " +
  "hc:!text-[color:var(--hc-accent)] hc:hover:!text-[color:var(--hc-accent)] " +
  "hc:active:!text-[color:var(--hc-accent)] hc:focus-visible:!text-[color:var(--hc-accent)]";

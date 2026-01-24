export const linkBrandBase =
  "inline-block text-[1.1em] font-[500] tracking-[0.03em] px-[0.2em] py-[0.02em] " +
  "rounded-[0.32em] border-[2px] border-transparent no-underline " +
  "text-[color:var(--link-brand-text,var(--link-color,#f2e3d4))] " +
  "transition-[border-color,box-shadow,color] duration-150 " +
  "hover:text-[color:var(--link-brand-text,var(--link-color,#f2e3d4))] " +
  "hover:border-[color:var(--link-brand-border-hover,#e1a0a0)] " +
  "hover:shadow-[0_0_0.4375rem_0_var(--link-brand-shadow-hover,rgba(175,170,163,0.4))] " +
  "focus-visible:outline-none " +
  "focus-visible:border-[color:var(--link-brand-border-hover,#e1a0a0)] " +
  "focus-visible:shadow-[0_0_0.4375rem_0_var(--link-brand-shadow-hover,rgba(175,170,163,0.4))] " +
  "light:text-[color:var(--link-color)] light:border-transparent " +
  "light:hover:text-[color:var(--link-color)] light:hover:border-[color:var(--link-color)] " +
  "light:focus-visible:text-[color:var(--link-color)] light:focus-visible:border-[color:var(--link-color)] " +
  "hc:text-[color:var(--hc-accent)] hc:hover:text-[color:var(--hc-accent)] " +
  "hc:focus-visible:text-[color:var(--hc-accent)]";

export const linkBrandInline = "text-[0.95em] tracking-[0.02em] px-[0.18em]";

export const linkBrandInlineClass = `${linkBrandBase} ${linkBrandInline}`;

# Tailwind Theme Variants

This project uses custom Tailwind variants tied to the global theme state.

light:
- Enabled when `html` has the `theme-light` class.
- Usage: `light:*` applies only in light theme.

hc:
- Enabled when `html` has `data-contrast="hc"`.
- Only applies in dark mode (never in light).
- Usage: `hc:*` applies only in dark + high-contrast.

Examples:
- `light:text-foreground`
- `hc:ring-2 hc:ring-accent`
- `focus-visible:ring-2 light:focus-visible:ring-border hc:focus-visible:ring-accent`

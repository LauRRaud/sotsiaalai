# Dead-class candidates (scoped to inspected primitives + keyProps)

> A semantic class that appeared on an inspected element but NEVER contributed
> to the key computed props in ANY route/theme/resting-state. Strong delete
> candidate FOR THESE PROPS — but a class may still set props not measured
> (appearance/transition) or only matter in hover/active. Verify before deleting.

| class | seen (route@theme) | contributed | verdict |
|---|---|---|---|
| `p-0` | 12 | 0 | **never — candidate** |
| `group` | 12 | 0 | **never — candidate** |
| `scroll-reactive-back` | 6 | 0 | **never — candidate** |
| `glass-subpage-back-button` | 6 | 0 | **never — candidate** |
| `pointer-events-auto` | 6 | 0 | **never — candidate** |
| `button` | 12 | 2 | alive |
| `ui-glow-button-control` | 12 | 2 | alive |
| `ui-glow-button-frame` | 12 | 8 | alive |
| `bg-transparent` | 12 | 10 | alive |
| `back-button` | 12 | 12 | alive |
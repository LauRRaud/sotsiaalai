# Dead-class candidates (scoped to inspected primitives + keyProps)

> A semantic class that appeared on an inspected element but NEVER contributed
> to the key computed props in ANY route/theme/resting-state. Strong delete
> candidate FOR THESE PROPS — but a class may still set props not measured
> (appearance/transition) or only matter in hover/active. Verify before deleting.

| class | seen (route@theme) | contributed | verdict |
|---|---|---|---|
| `p-0` | 40 | 0 | **never — candidate** |
| `group` | 40 | 0 | **never — candidate** |
| `rag-admin-shell-back` | 34 | 0 | **never — candidate** |
| `shadow-none` | 22 | 0 | **never — candidate** |
| `documents-field` | 16 | 0 | **never — candidate** |
| `glass-subpage-back-button` | 6 | 0 | **never — candidate** |
| `profile-back-button` | 6 | 0 | **never — candidate** |
| `pointer-events-auto` | 6 | 0 | **never — candidate** |
| `account-settings-back-button` | 6 | 0 | **never — candidate** |
| `invite-primary-btn` | 10 | 1 | alive |
| `self-start` | 6 | 1 | alive |
| `ui-glow-button-frame--disabled` | 4 | 1 | alive |
| `ui-glow-button-control` | 16 | 2 | alive |
| `account-settings-modal-button` | 6 | 2 | alive |
| `shrink-0` | 6 | 2 | alive |
| `button` | 28 | 3 | alive |
| `ui-glow-button-frame` | 16 | 10 | alive |
| `documents-dropdown-trigger` | 16 | 16 | alive |
| `bg-transparent` | 40 | 33 | alive |
| `back-button` | 40 | 40 | alive |
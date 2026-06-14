# Dead-class candidates (scoped to inspected primitives + keyProps)

> A semantic class that appeared on an inspected element but NEVER contributed
> to the key computed props in ANY route/theme/resting-state. Strong delete
> candidate FOR THESE PROPS — but a class may still set props not measured
> (appearance/transition) or only matter in hover/active. Verify before deleting.

| class | seen (route@theme) | contributed | verdict |
|---|---|---|---|
| `p-0` | 197 | 0 | **never — candidate** |
| `group` | 197 | 0 | **never — candidate** |
| `pointer-events-auto` | 163 | 0 | **never — candidate** |
| `glass-subpage-back-button` | 157 | 0 | **never — candidate** |
| `workspace-scroll-back-button` | 132 | 0 | **never — candidate** |
| `outline-none` | 106 | 0 | **never — candidate** |
| `dashboard-info-trigger-corner` | 106 | 0 | **never — candidate** |
| `documents-field` | 78 | 0 | **never — candidate** |
| `documents-scroll-back-button` | 12 | 0 | **never — candidate** |
| `register-back-button` | 6 | 0 | **never — candidate** |
| `profile-back-button` | 3 | 0 | **never — candidate** |
| `cs-delete` | 2 | 0 | **never — candidate** |
| `register-submit` | 6 | 1 | alive |
| `shrink-0` | 6 | 1 | alive |
| `self-center` | 6 | 1 | alive |
| `materials-surface-button` | 6 | 1 | alive |
| `drawer-pill-btn` | 6 | 1 | alive |
| `documents-agent-handoff-button` | 6 | 1 | alive |
| `service-profile-publish-save` | 6 | 1 | alive |
| `rooms-delete-btn` | 2 | 1 | alive |
| `workspace-feature-action-btn` | 6 | 2 | alive |
| `materials-upload-choose-button` | 6 | 3 | alive |
| `materials-upload-submit-button` | 6 | 3 | alive |
| `invite-primary-btn` | 16 | 4 | alive |
| `chat-dictate-btn` | 6 | 4 | alive |
| `chat-listen-btn` | 6 | 6 | alive |
| `documents-upload-submit` | 6 | 6 | alive |
| `documents-upload-dropzone-trigger` | 6 | 6 | alive |
| `ui-glow-button-frame--disabled` | 40 | 7 | alive |
| `chat-send-btn` | 12 | 12 | alive |
| `ui-glow-button-control` | 152 | 25 | alive |
| `scroll-reactive-back` | 34 | 34 | alive |
| `documents-dropdown-trigger` | 78 | 78 | alive |
| `button` | 152 | 87 | alive |
| `shadow-none` | 112 | 93 | alive |
| `ui-glow-button-frame` | 152 | 102 | alive |
| `transform-gpu` | 106 | 106 | alive |
| `bg-transparent` | 197 | 164 | alive |
| `back-button` | 197 | 197 | alive |
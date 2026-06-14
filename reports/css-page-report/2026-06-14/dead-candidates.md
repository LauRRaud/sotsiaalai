# Dead-class candidates (scoped to inspected primitives + keyProps)

> A semantic class that appeared on an inspected element but NEVER contributed
> to the key computed props in ANY route/theme/resting-state. Strong delete
> candidate FOR THESE PROPS — but a class may still set props not measured
> (appearance/transition) or only matter in hover/active. Verify before deleting.

| class | seen (route@theme) | contributed | verdict |
|---|---|---|---|
| `group` | 236 | 0 | **never — candidate** |
| `pointer-events-auto` | 167 | 0 | **never — candidate** |
| `glass-subpage-back-button` | 161 | 0 | **never — candidate** |
| `workspace-scroll-back-button` | 132 | 0 | **never — candidate** |
| `outline-none` | 105 | 0 | **never — candidate** |
| `dashboard-info-trigger-corner` | 105 | 0 | **never — candidate** |
| `documents-field` | 96 | 0 | **never — candidate** |
| `rag-admin-shell-back` | 36 | 0 | **never — candidate** |
| `documents-scroll-back-button` | 12 | 0 | **never — candidate** |
| `profile-back-button` | 8 | 0 | **never — candidate** |
| `inset-0` | 8 | 0 | **never — candidate** |
| `block` | 8 | 0 | **never — candidate** |
| `register-back-button` | 6 | 0 | **never — candidate** |
| `account-settings-back-button` | 6 | 0 | **never — candidate** |
| `cs-delete` | 1 | 0 | **never — candidate** |
| `rooms-delete-btn` | 1 | 0 | **never — candidate** |
| `p-0` | 242 | 1 | alive |
| `isolate` | 8 | 1 | alive |
| `place-items-center` | 8 | 1 | alive |
| `outline` | 8 | 1 | alive |
| `outline-1` | 8 | 1 | alive |
| `register-submit` | 6 | 1 | alive |
| `self-center` | 6 | 1 | alive |
| `materials-surface-button` | 6 | 1 | alive |
| `drawer-pill-btn` | 6 | 1 | alive |
| `documents-agent-handoff-button` | 6 | 1 | alive |
| `service-profile-publish-save` | 6 | 1 | alive |
| `self-start` | 6 | 1 | alive |
| `workspace-feature-action-btn` | 6 | 2 | alive |
| `account-settings-modal-button` | 6 | 2 | alive |
| `shrink-0` | 12 | 3 | alive |
| `outline-transparent` | 8 | 3 | alive |
| `materials-upload-choose-button` | 6 | 3 | alive |
| `materials-upload-submit-button` | 6 | 3 | alive |
| `chat-dictate-btn` | 6 | 4 | alive |
| `invite-primary-btn` | 26 | 6 | alive |
| `chat-listen-btn` | 6 | 6 | alive |
| `documents-upload-submit` | 6 | 6 | alive |
| `documents-upload-dropzone-trigger` | 6 | 6 | alive |
| `ui-glow-button-frame--disabled` | 42 | 7 | alive |
| `profile-orbit-edge-glow` | 8 | 8 | alive |
| `dock-item` | 8 | 8 | alive |
| `chat-send-btn` | 12 | 12 | alive |
| `ui-glow-button-control` | 172 | 27 | alive |
| `scroll-reactive-back` | 33 | 33 | alive |
| `button` | 176 | 87 | alive |
| `shadow-none` | 135 | 93 | alive |
| `documents-dropdown-trigger` | 96 | 96 | alive |
| `transform-gpu` | 105 | 105 | alive |
| `ui-glow-button-frame` | 172 | 111 | alive |
| `bg-transparent` | 236 | 197 | alive |
| `back-button` | 236 | 236 | alive |
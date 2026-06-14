# !important audit — 2026-06-14

**Total `!important` declarations:** 3769

- on **surface props** (Root B theme-war: background/box-shadow/color/border/backdrop/opacity): **1686**
- under **theme-override selectors** (`:not(.theme-)`/`:root.theme-`/`[data-contrast]`): **1646**

> Strategy (css-tailwind-cleanup-plan §1): these are a SYMPTOM. Surface-prop +
> theme-override `!important` dissolves when theming moves to `:root.theme-X { --token }`
> (Root B). Track this count as the progress metric — it should fall each slice.

## Top files

| file | !important |
|---|---|
| `app/styles/theme/hc.css` | 407 |
| `app/styles/features/service-map/desktop.css` | 281 |
| `app/styles/features/chat/hc.css` | 207 |
| `app/styles/features/chat/shell.css` | 204 |
| `app/styles/theme/mono.css` | 171 |
| `app/styles/features/chat/mobile.css` | 169 |
| `app/styles/mobile/accessibility-touch.css` | 138 |
| `app/styles/features/chat/mono.css` | 131 |
| `app/styles/shared/ui-glow.css` | 118 |
| `app/styles/features/documents/ui.css` | 110 |
| `app/styles/mobile/invite-workspace.css` | 101 |
| `app/styles/mobile/platform-android.css` | 98 |
| `app/styles/mobile/scroll-panels.css` | 95 |
| `app/styles/features/chat/themes.css` | 93 |
| `app/styles/shared/workspace-guide.css` | 92 |
| `app/styles/features/home/mobile.css` | 87 |
| `app/styles/mobile/subpage-title-system.css` | 82 |
| `app/styles/features/service-map/mobile.css` | 81 |
| `app/styles/shared/register.css` | 79 |
| `app/styles/features/profile/mobile.css` | 74 |
| `app/styles/mobile/background-home.css` | 67 |
| `app/styles/shared/glass-subpage.css` | 66 |
| `app/styles/features/policy/responsive.css` | 65 |
| `app/styles/theme/mid.css` | 65 |
| `app/styles/mobile/modal-surfaces.css` | 62 |

## Top properties

| property | count | surface? |
|---|---|---|
| `box-shadow` | 397 | ✓ |
| `background` | 395 | ✓ |
| `color` | 255 | ✓ |
| `border` | 162 | ✓ |
| `border-color` | 149 | ✓ |
| `-webkit-backdrop-filter` | 95 | ✓ |
| `backdrop-filter` | 95 | ✓ |
| `width` | 94 |  |
| `opacity` | 90 | ✓ |
| `transform` | 72 |  |
| `display` | 68 |  |
| `height` | 68 |  |
| `min-height` | 59 |  |
| `max-width` | 54 |  |
| `margin-top` | 54 |  |
| `padding-bottom` | 51 |  |
| `padding-top` | 48 |  |
| `padding-left` | 41 |  |
| `max-height` | 40 |  |
| `top` | 39 |  |
| `outline` | 38 |  |
| `padding-right` | 37 |  |
| `transition` | 36 |  |
| `border-radius` | 34 |  |
| `left` | 34 |  |

## By selector category

| category | count |
|---|---|
| plain | 1857 |
| theme-override | 1646 |
| state | 647 |
| not-chain | 315 |
| pseudo-el | 157 |

## Highest-value targets (surface prop + theme-override, same selector)

- `app/styles/theme/hc.css` — 325 surface+theme-override `!important` (tokenise these first)
- `app/styles/features/chat/hc.css` — 144 surface+theme-override `!important` (tokenise these first)
- `app/styles/features/chat/themes.css` — 93 surface+theme-override `!important` (tokenise these first)
- `app/styles/theme/mono.css` — 87 surface+theme-override `!important` (tokenise these first)
- `app/styles/features/chat/mono.css` — 84 surface+theme-override `!important` (tokenise these first)
- `app/styles/features/service-map/desktop.css` — 75 surface+theme-override `!important` (tokenise these first)
- `app/styles/shared/ui-glow.css` — 70 surface+theme-override `!important` (tokenise these first)
- `app/styles/features/documents/ui.css` — 61 surface+theme-override `!important` (tokenise these first)
- `app/styles/theme/mid.css` — 61 surface+theme-override `!important` (tokenise these first)
- `app/styles/features/chat/shell.css` — 52 surface+theme-override `!important` (tokenise these first)
- `app/styles/features/profile/hc.css` — 27 surface+theme-override `!important` (tokenise these first)
- `app/styles/mobile/accessibility-touch.css` — 23 surface+theme-override `!important` (tokenise these first)
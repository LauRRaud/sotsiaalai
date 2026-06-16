# !important audit — 2026-06-16

**Total `!important` declarations:** 1215

- on **surface props** (Root B theme-war: background/box-shadow/color/border/backdrop/opacity): **571**
- under **theme-override selectors** (`:not(.theme-)`/`:root.theme-`/`[data-contrast]`): **414**

> Strategy (css-tailwind-cleanup-plan §1): these are a SYMPTOM. Surface-prop +
> theme-override `!important` dissolves when theming moves to `:root.theme-X { --token }`
> (Root B). Track this count as the progress metric — it should fall each slice.

## Top files

| file | !important |
|---|---|
| `app/styles/shared/ui-glow.css` | 118 |
| `app/styles/features/service-map/desktop.css` | 104 |
| `app/styles/mobile/platform-android.css` | 98 |
| `app/styles/features/chat/themes.css` | 92 |
| `app/styles/features/service-map/mobile.css` | 77 |
| `app/styles/mobile/invite-workspace.css` | 63 |
| `app/styles/features/policy/responsive.css` | 62 |
| `app/styles/features/chat/shell.css` | 59 |
| `app/styles/features/home/desktop.css` | 49 |
| `app/styles/features/policy/pages.css` | 38 |
| `app/styles/shared/workspace-guide.css` | 33 |
| `app/styles/components/workspace-help-listings.css` | 29 |
| `app/styles/features/chat/hc.css` | 29 |
| `app/styles/features/profile/hc.css` | 28 |
| `app/styles/mobile/touch-controls.css` | 25 |
| `app/styles/theme/mono.css` | 24 |
| `app/styles/mobile/panel-surfaces.css` | 23 |
| `app/styles/mobile/subpage-title-system.css` | 21 |
| `app/styles/features/chat/mono.css` | 20 |
| `app/styles/shared/glass-subpage.css` | 19 |
| `app/styles/theme/hc.css` | 16 |
| `app/styles/features/policy/mobile.css` | 15 |
| `app/styles/mobile/scroll-panels.css` | 15 |
| `app/styles/features/chat/mobile.css` | 14 |
| `app/styles/theme/dark.css` | 14 |

## Top properties

| property | count | surface? |
|---|---|---|
| `box-shadow` | 152 | ✓ |
| `background` | 129 | ✓ |
| `border` | 61 | ✓ |
| `opacity` | 52 | ✓ |
| `-webkit-backdrop-filter` | 48 | ✓ |
| `color` | 48 | ✓ |
| `display` | 43 |  |
| `border-color` | 35 | ✓ |
| `width` | 35 |  |
| `backdrop-filter` | 33 | ✓ |
| `height` | 28 |  |
| `max-width` | 25 |  |
| `margin-top` | 23 |  |
| `overflow` | 21 |  |
| `padding` | 19 |  |
| `transform` | 19 |  |
| `padding-top` | 17 |  |
| `top` | 17 |  |
| `padding-bottom` | 16 |  |
| `min-height` | 15 |  |
| `mask-image` | 15 |  |
| `-webkit-mask-image` | 15 |  |
| `position` | 15 |  |
| `max-height` | 14 |  |
| `left` | 14 |  |

## By selector category

| category | count |
|---|---|
| plain | 696 |
| theme-override | 414 |
| state | 207 |
| not-chain | 111 |
| pseudo-el | 58 |

## Highest-value targets (surface prop + theme-override, same selector)

- `app/styles/features/chat/themes.css` — 92 surface+theme-override `!important` (tokenise these first)
- `app/styles/shared/ui-glow.css` — 70 surface+theme-override `!important` (tokenise these first)
- `app/styles/features/chat/hc.css` — 26 surface+theme-override `!important` (tokenise these first)
- `app/styles/features/profile/hc.css` — 20 surface+theme-override `!important` (tokenise these first)
- `app/styles/theme/mono.css` — 18 surface+theme-override `!important` (tokenise these first)
- `app/styles/features/service-map/desktop.css` — 15 surface+theme-override `!important` (tokenise these first)
- `app/styles/theme/hc.css` — 15 surface+theme-override `!important` (tokenise these first)
- `app/styles/theme/dark.css` — 14 surface+theme-override `!important` (tokenise these first)
- `app/styles/features/chat/mono.css` — 11 surface+theme-override `!important` (tokenise these first)
- `app/styles/features/chat/shell.css` — 9 surface+theme-override `!important` (tokenise these first)
- `app/styles/features/home/desktop.css` — 9 surface+theme-override `!important` (tokenise these first)
- `app/styles/components/workspace-help-listings.css` — 8 surface+theme-override `!important` (tokenise these first)
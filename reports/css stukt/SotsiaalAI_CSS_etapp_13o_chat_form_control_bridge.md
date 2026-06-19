# SotsiaalAI CSS etapp 13o — chat form-control bridge

## Eesmärk

Etapp 13o jätkab vormiväljade tokenipere korrastamist pärast `documents/workspace.css` bridge-migratsiooni.

Algne plaan oli vaadata auth/register/invite vormiväljade otsedefinitsioone, kuid pärast patch 32 auditit selgus, et selles grupis ei ole enam `form-control` tokenipere otsedefinitsioone. Allesolev suurim võlg oli hoopis `app/styles/features/chat/hc.css` failis.

Seetõttu tehti 13o-s chat HC drawer/sidebar vormiväljade bridge-migratsioon.

## Muudetud failid

- `app/styles/features/chat/hc.css`
- `app/styles/TOKENS.md`
- `reports/css-token-audit.json`
- `reports/css-token-collisions.csv`
- `reports/css-token-family-form-control.csv`

## Muudatuse sisu

Failis `app/styles/features/chat/hc.css` asendati otsesed vormivälja tokeniväärtused feature-prefiksiga alias-tokenitega.

Enne oli chat HC drawer/sidebar plokis otse:

```css
--input-border: 2px solid rgba(var(--hc-accent-rgb), 0.68);
--input-text: var(--hc-accent);
--input-placeholder: rgba(var(--hc-accent-rgb), 0.92);
--input-caret: var(--hc-accent);
--input-bg: var(--chat-card-surface-night-standard-bg);
--input-bg-hover: var(--chat-card-surface-night-standard-flat-bg);
--input-bg-focus: var(--chat-card-surface-night-standard-flat-bg);
--input-shadow: none;
--input-shadow-hover: none;
```

Pärast on päris väärtused `--chat-input-*` tokenites ja üldised `--input-*` tokenid on bridge:

```css
--chat-input-border: 2px solid rgba(var(--hc-accent-rgb), 0.68);
--chat-input-text: var(--hc-accent);
--chat-input-placeholder: rgba(var(--hc-accent-rgb), 0.92);
--chat-input-caret: var(--hc-accent);
--chat-input-bg: var(--chat-card-surface-night-standard-bg);
--chat-input-bg-hover: var(--chat-card-surface-night-standard-flat-bg);
--chat-input-bg-focus: var(--chat-card-surface-night-standard-flat-bg);
--chat-input-shadow: none;
--chat-input-shadow-hover: none;

--input-border: var(--chat-input-border);
--input-text: var(--chat-input-text);
--input-placeholder: var(--chat-input-placeholder);
--input-caret: var(--chat-input-caret);
--input-bg: var(--chat-input-bg);
--input-bg-hover: var(--chat-input-bg-hover);
--input-bg-focus: var(--chat-input-bg-focus);
--input-shadow: var(--chat-input-shadow);
--input-shadow-hover: var(--chat-input-shadow-hover);
```

Visuaalseid väärtusi ei muudetud.

## Mõju tokeniauditis

| Mõõdik | Enne 13o | Pärast 13o |
|---|---:|---:|
| Form-control `feature-direct-definition` | 27 | **18** |
| Form-control `feature-bridge` | 28 | **37** |
| Chat HC direct form-control definitions | 9 | **0** |
| Chat HC bridge form-control definitions | 0 | **9** |
| Form-control `other` | 0 | 0 |
| Projekti `!important` arv | 2025 | 2025 |

Allesolev `form-control` direct-võlg pärast 13o:

| Fail | Direct definitsioone |
|---|---:|
| `app/styles/features/documents/ui.css` | 9 |
| `app/styles/features/service-map/desktop/base.css` | 7 |
| `app/styles/features/documents/mono.css` | 1 |
| `app/styles/features/service-map/desktop/pre-inquiry-agent.css` | 1 |

## Staatiline kontroll

```text
git apply --check: OK
Missing local CSS imports: 0
CSS import cycles: 0
CSS brace-balance errors: 0
Project CSS !important count: 2025
Form-control feature direct definitions: 18
Form-control feature bridge definitions: 37
Form-control other definitions: 0
Chat hc direct form-control definitions: 0
Chat hc bridge form-control definitions: 9
npm run css:tokens:check: OK
```

## Rakendamine

Rakenda pärast patch 32:

```bash
git apply --check sotsiaalai-css-cleanup-33-chat-form-control-bridge.patch
git apply sotsiaalai-css-cleanup-33-chat-form-control-bridge.patch

npm run css:tokens
npm run css:tokens:check
```

## Järgmine soovitus

Järgmine mõistlik etapp on **13p: documents `ui.css` ja `mono.css` form-control bridge**, sest see eemaldab 10 allesolevast 18 otsedefinitsioonist.

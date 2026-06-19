# SotsiaalAI CSS etapp 13k — documents `--btn-primary-*` bridge

## Eesmärk

Etapi 13k eesmärk oli lõpetada `app/styles/features/documents/ui.css` sees olev `--btn-primary-*` otsedefinitsioonide võlg ning viia dokumentide HC nupu väärtused feature-prefiksiga alias-tokenite alla.

See on tokeni omandiparandus. Visuaalseid väärtusi ei muudetud.

## Muudatused

Muudetud failid:

- `app/styles/features/documents/ui.css`
- `app/styles/TOKENS.md`

`documents/ui.css` sees asendati otsesed väärtused kujul:

```css
--btn-primary-bg: rgba(...);
--btn-primary-text: var(--hc-accent);
```

uue bridge-mustriga:

```css
--documents-btn-primary-bg: rgba(...);
--documents-btn-primary-text: var(--hc-accent);

--btn-primary-bg: var(--documents-btn-primary-bg);
--btn-primary-text: var(--documents-btn-primary-text);
```

Kokku migreeriti 10 dokumentide `--btn-primary-*` definitsiooni:

- `--btn-primary-border`
- `--btn-primary-border-hover`
- `--btn-primary-border-active`
- `--btn-primary-text`
- `--btn-primary-bg`
- `--btn-primary-bg-hover`
- `--btn-primary-bg-active`
- `--btn-primary-shadow`
- `--btn-primary-shadow-hover`
- `--btn-primary-shadow-active`

## Mõju tokeniauditile

| Mõõdik | Enne 13k | Pärast 13k |
|---|---:|---:|
| `feature-direct-definition` | 12 | **2** |
| `feature-bridge` | 66 | **76** |
| Documents direct `--btn-primary-*` | 10 | **0** |
| Documents bridge `--btn-primary-*` | 0 | **10** |
| `other` | 0 | 0 |
| Projekti `!important` arv | 2025 | 2025 |

Allesolev `btn-primary` direct-võlg on nüüd ainult `components/wellbeing/WellbeingPage.module.css` failis:

- `--btn-primary-text: var(--wellbeing-primary-button-text)`
- `--btn-primary-text: var(--hc-accent, #ffea00)`

## Staatiline kontroll

```text
git apply --check: OK
Missing local CSS imports: 0
CSS import cycles: 0
CSS brace-balance errors: 0
Bad use client directive files: 0
Project CSS !important count: 2025
Btn-primary feature direct definitions: 2
Btn-primary feature bridge definitions: 76
Documents ui direct --btn-primary definitions: 0
Documents ui bridge --btn-primary definitions: 10
npm run css:tokens:check: OK
```

## Rakendamine

Rakenda pärast patch’i 28:

```bash
git apply --check sotsiaalai-css-cleanup-29-documents-btn-primary-bridge.patch
git apply sotsiaalai-css-cleanup-29-documents-btn-primary-bridge.patch

npm run css:tokens
npm run css:tokens:check
```

## Järgmine samm

Järgmine loogiline etapp on **13l: WellbeingPage `--btn-primary-*` bridge**, mis viib `feature-direct-definition` arvu 2-lt 0-ni ja lõpetab `--btn-primary-*` esimese bridge-migratsiooni vooru.

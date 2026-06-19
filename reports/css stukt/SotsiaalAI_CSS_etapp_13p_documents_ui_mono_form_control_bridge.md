# SotsiaalAI CSS etapp 13p — documents UI/mono form-control bridge

## Eesmärk

Etapi 13p eesmärk oli viia `documents/ui.css` ja `documents/mono.css` allesolevad vormiväljade üldtokenite otsedefinitsioonid documents feature-alias mudelisse.

Fookuses olid tokenid:

- `--input-bg`
- `--input-bg-hover`
- `--input-bg-focus`
- `--input-flat-bg`
- `--input-flat-bg-hover`
- `--input-border`
- `--input-text`
- `--input-placeholder`
- `--input-caret`
- `--input-shadow`
- `--input-shadow-hover`

Visuaalseid väärtusi ei muudetud. Muutus ainult tokenite omandikiht.

---

## Muudatused

### `app/styles/features/documents/ui.css`

HC dokumendivaate vormiväljade väärtused liikusid `--documents-input-*` alias-tokenitesse.

Enne:

```css
--input-border: 2px solid rgba(255, 234, 0, 0.68);
--input-text: var(--hc-accent);
--input-placeholder: rgba(255, 234, 0, 0.72);
--input-caret: var(--hc-accent);
--input-bg: rgba(14, 20, 32, 0.42);
--input-bg-hover: rgba(14, 20, 32, 0.5);
--input-bg-focus: rgba(14, 20, 32, 0.56);
--input-shadow: none;
--input-shadow-hover: none;
```

Pärast:

```css
--documents-input-border: 2px solid rgba(255, 234, 0, 0.68);
--documents-input-text: var(--hc-accent);
--documents-input-placeholder: rgba(255, 234, 0, 0.72);
--documents-input-caret: var(--hc-accent);
--documents-input-bg: rgba(14, 20, 32, 0.42);
--documents-input-bg-hover: rgba(14, 20, 32, 0.5);
--documents-input-bg-focus: rgba(14, 20, 32, 0.56);
--documents-input-shadow: none;
--documents-input-shadow-hover: none;

--input-border: var(--documents-input-border);
--input-text: var(--documents-input-text);
--input-placeholder: var(--documents-input-placeholder);
--input-caret: var(--documents-input-caret);
--input-bg: var(--documents-input-bg);
--input-bg-hover: var(--documents-input-bg-hover);
--input-bg-focus: var(--documents-input-bg-focus);
--input-shadow: var(--documents-input-shadow);
--input-shadow-hover: var(--documents-input-shadow-hover);
```

### `app/styles/features/documents/mono.css`

Mono dokumendivaate vormiväljade väärtused liikusid samuti `--documents-input-*` alias-tokenitesse.

Pärast muudatust on ka mono-kontekstis üldised `--input-*` tokenid bridge, mitte lõpliku väärtuse omanikud.

---

## Mõju tokeniauditis

| Mõõdik | Enne 13p | Pärast 13p |
|---|---:|---:|
| Form-control `feature-direct-definition` | 18 | **8** |
| Form-control `feature-bridge` | 37 | **47** |
| Documents UI/mono direct definitsioonid | 10 | **0** |
| Documents UI/mono bridge definitsioonid | 7 | **17** |
| Form-control `other` | 0 | 0 |
| Projekti `!important` arv | 2025 | 2025 |

Allesolev form-control direct-võlg on nüüd ainult service-map’is:

| Fail | Direct definitsioone |
|---|---:|
| `app/styles/features/service-map/desktop/base.css` | 7 |
| `app/styles/features/service-map/desktop/pre-inquiry-agent.css` | 1 |

---

## Staatiline kontroll

```text
git apply --check: OK
Missing local CSS imports: 0
CSS import cycles: 0
CSS brace-balance errors: 0
Project CSS !important count: 2025
Form-control feature direct definitions: 8
Form-control feature bridge definitions: 47
Form-control other definitions: 0
Documents ui/mono direct form-control definitions: 0
Documents ui/mono bridge form-control definitions: 17
Remaining direct owners:
  app/styles/features/service-map/desktop/base.css: 7
  app/styles/features/service-map/desktop/pre-inquiry-agent.css: 1
```

---

## Rakendamine

Rakenda pärast patch’i 33:

```bash
git apply --check sotsiaalai-css-cleanup-34-documents-ui-mono-form-control-bridge.patch
git apply sotsiaalai-css-cleanup-34-documents-ui-mono-form-control-bridge.patch

npm run css:tokens
npm run css:tokens:check
```

---

## Järgmine samm

Järgmine loogiline etapp on **13q: service-map form-control bridge**.

See peaks viima form-control `feature-direct-definition` arvu 8-lt 0-ni ja lõpetama vormiväljade tokenipere esimese omandivooru.

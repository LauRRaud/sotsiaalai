# SotsiaalAI CSS etapp 13n — documents form-control bridge

## Eesmärk

Etapi 13n eesmärk oli viia `app/styles/features/documents/workspace.css` vormiväljade üldtokenid bridge-mudelisse.

Fookuses olid `--input-*` ja `--input-flat-*` tokenid, mis olid dokumendivaate feature-failis otse lõppväärtustega defineeritud. See tekitas `form-control` tokenipere auditisse `feature-direct-definition` võlga.

Muudatus ei muuda visuaalseid väärtusi. Senised väärtused tõsteti dokumendivaate alias-tokenitesse ning üldised `--input-*` tokenid viitavad nüüd neile aliastele.

## Muudetud failid

- `app/styles/features/documents/workspace.css`
- `app/styles/TOKENS.md`

## Tehtud muudatus

Näidis enne:

```css
.documents-workspace {
  --input-bg: var(--documents-elevated-bg);
  --input-bg-hover: var(--documents-elevated-bg);
  --input-border: 1px solid rgba(255, 255, 255, 0.06);
}
```

Näidis pärast:

```css
.documents-workspace {
  --documents-input-bg: var(--documents-elevated-bg);
  --documents-input-bg-hover: var(--documents-elevated-bg);
  --documents-input-border: 1px solid rgba(255, 255, 255, 0.06);

  --input-bg: var(--documents-input-bg);
  --input-bg-hover: var(--documents-input-bg-hover);
  --input-border: var(--documents-input-border);
}
```

## Mõju tokeniauditile

| Mõõdik | Enne 13n | Pärast 13n |
|---|---:|---:|
| Form-control `feature-direct-definition` | 47 | **27** |
| Form-control `feature-bridge` | 8 | **28** |
| `documents/workspace.css` direct form-control definitsioonid | 20 | **0** |
| `documents/workspace.css` bridge form-control definitsioonid | 0 | **20** |
| Form-control `other` definitsioonid | 0 | 0 |
| Projekti `!important` arv | 2025 | 2025 |

## Staatiline kontroll

```text
git apply --check: OK
Missing local CSS imports: 0
CSS import cycles: 0
CSS brace-balance errors: 0
Project CSS !important count: 2025
Documents workspace direct form-control definitions: 0
Documents workspace bridge form-control definitions: 20
Form-control feature direct definitions: 27
Form-control feature bridge definitions: 28
Form-control other definitions: 0
```

## Risk

Risk on madal kuni keskmine.

Madal, sest CSS-i lõppväärtusi ei muudetud. Keskmine ainult seetõttu, et väärtused liiguvad läbi uue alias-kihi ja seda tuleks päris repos buildi ning vähemalt dokumendivaate visuaalse kontrolliga kinnitada.

## Rakendamine

Rakendada pärast patch'i 31:

```bash
git apply --check sotsiaalai-css-cleanup-32-documents-form-control-bridge.patch
git apply sotsiaalai-css-cleanup-32-documents-form-control-bridge.patch

npm run css:tokens
npm run css:tokens:check
```

## Järgmine soovitus

Järgmine mõistlik samm on **13o: auth/register/invite form-control bridge**, sest pärast documents migratsiooni on alles 27 `feature-direct-definition` vormivälja tokenit. Need koonduvad tõenäoliselt autentimise, registreerimise, invite’i ja teiste vormipõhiste feature’ite ümber.

# SotsiaalAI CSS — etapp 13c: `--subpage-card-*` tokenipere omand

## Eesmärk

Etapi 13c eesmärk oli võtta ette üks suurim tokenikonflikti allikas: `--subpage-card-*`.

Selles etapis ei muudetud ühtegi CSS-i visuaalset väärtust. Muudatus oli kontrolli- ja omandipõhine:

- dokumenteerida `--subpage-card-*` tokenipere omand;
- teha auditiskriptile eraldi subpage-card family kontroll;
- luua eraldi CSV, mis näitab iga `--subpage-card-*` definitsiooni omanikutüüpi;
- jätta tegelik CSS-väärtuste ümbernimetamine järgmisteks väikesteks feature-põhisteks patch’ideks.

## Miks mitte kohe CSS-i ümber kirjutada

Audit näitas, et `--subpage-card-*` ei ole projektis üksainus tokenikiht, vaid kolm eri rolli sama nime all:

1. canonical default ehk vaikimisi subpage/card surface;
2. theme override ehk teema väärtus;
3. feature bridge ehk konkreetse feature’i pinna ühendus shared primitive’iga.

Kui need 159 definitsiooni automaatselt ümber kirjutada, oleks regressioonirisk kõrge. Seetõttu oli esimene õige samm omandi nähtavaks tegemine ja kontrollitavaks muutmine.

## Lisatud omandimudel

`app/styles/TOKENS.md` sai uue osa: `--subpage-card-* tokenipere omand`.

Mudelis on neli lubatud kihti:

| Kiht | Omanik | Roll |
|---|---|---|
| `canonical-default` | `app/styles/tokens.css` | fallback-väärtused |
| `theme-override` | `app/styles/theme/*.css` | light/mid/night/mono/HC väärtused |
| `shared-primitive` | shared/mobile primitive failid | `.glass-subpage-surface`, modal, mobile glass jms |
| `feature-direct-definition` | `app/styles/features/**` | ajutine migratsioonikandidaat |

`other` kategooria ei ole lubatud. Auditiskript annab `--check` režiimis vea, kui `--subpage-card-*` definitsioon satub väljapoole dokumenteeritud omanikke.

## Auditiskripti muudatus

`scripts/css-cleanup/style-token-audit.mjs` sai juurde:

- token family tuvastuse;
- `subpage-card` family poliitika;
- definitsioonide liigituse omanikutüübi järgi;
- uue CSV väljundi:
  - `reports/css-token-family-subpage-card.csv`
- JSON väljundisse uue võtme:
  - `familyPolicies.subpageCard`
- konsooliväljundisse subpage-card kokkuvõtte.

## Mõõdikud pärast patch’i 20

| Mõõdik | Väärtus |
|---|---:|
| CSS-faile | 156 |
| Tokeneid | 1112 |
| Tokenidefinitsioone | 4224 |
| Tokenikasutusi | 5914 |
| Mitme väärtusega tokenikonflikte | 615 |
| Defineerimata kasutusi | 95 |
| Defineeritud, aga kasutamata tokeneid | 259 |
| `--subpage-card-*` definitsioone | 159 |
| `--subpage-card-*` faile | 18 |
| `feature-direct-definition` definitsioone | 41 |
| `other` definitsioone | 0 |

## `--subpage-card-*` jaotus omanikutüübi järgi

| Omanikutüüp | Definitsioone |
|---|---:|
| `theme-override` | 63 |
| `shared-primitive` | 47 |
| `feature-direct-definition` | 41 |
| `canonical-default` | 8 |

Kõige olulisem tulemus: `other` kategooriasse ei jäänud ühtegi definitsiooni. See tähendab, et tokenipere on nüüd vähemalt klassifitseeritav ja edaspidi kontrollitav.

## Suurimad definitsioonifailid

| Fail | Definitsioone |
|---|---:|
| `app/styles/features/documents/workspace.css` | 25 |
| `app/styles/shared/glass-subpage.css` | 22 |
| `app/styles/theme/mono.css` | 18 |
| `app/styles/mobile/modal-surfaces/form-theme.css` | 12 |
| `app/styles/theme/hc.css` | 12 |
| `app/styles/theme/dark.css` | 9 |
| `app/styles/theme/night.css` | 9 |
| `app/styles/mobile/foundations.css` | 8 |
| `app/styles/theme/mid.css` | 8 |
| `app/styles/tokens.css` | 8 |

Kõige suurem järgmine kandidaat on `documents/workspace.css`, sest seal on 25 feature-direct definitsiooni.

## Tokenite kaupa

| Token | Definitsioone |
|---|---:|
| `--subpage-card-bg` | 34 |
| `--subpage-card-bg-hover` | 34 |
| `--subpage-card-shadow` | 21 |
| `--subpage-card-border` | 20 |
| `--subpage-card-shadow-hover` | 20 |
| `--subpage-card-border-hover` | 19 |
| `--subpage-card-text` | 8 |
| `--subpage-card-border-width` | 2 |
| `--subpage-card-radius` | 1 |

## Staatiline kontroll

```text
git apply --check: OK
node --check scripts/css-cleanup/style-token-audit.mjs: OK
node scripts/css-cleanup/style-token-audit.mjs --check: OK
CSS files: 156
Tokens: 1112
Definitions: 4224
Usages: 5914
Multi-value token collisions: 615
Undefined usages: 95
Defined but unused: 259
Subpage-card definitions: 159 across 18 files
Subpage-card feature direct definitions: 41
Subpage-card other definitions: 0
```

## Rakendamine

Patch rakendatakse pärast `sotsiaalai-css-cleanup-20-token-ownership.patch`:

```bash
git apply --check sotsiaalai-css-cleanup-21-subpage-card-policy.patch
git apply sotsiaalai-css-cleanup-21-subpage-card-policy.patch
npm run css:tokens
npm run css:tokens:check
```

## Järgmine soovitatud etapp

Järgmine praktiline samm on **13d: documents subpage-card alias patch**.

Fookus:

- `app/styles/features/documents/workspace.css`;
- `app/styles/features/documents/mono.css`;
- `app/styles/features/documents/ui.css`.

Soovitud muster:

```css
.documents-workspace {
  --documents-card-bg: var(--documents-surface-panel-bg);
  --documents-card-border: var(--documents-card-border);

  --subpage-card-bg: var(--documents-card-bg);
  --subpage-card-border: var(--documents-card-border);
}
```

Eesmärk on mitte muuta visuaali, vaid viia väärtus feature-prefiksiga tokenisse ja jätta `--subpage-card-*` ainult bridge-tokeniks.

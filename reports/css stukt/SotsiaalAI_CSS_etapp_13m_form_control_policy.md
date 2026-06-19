# SotsiaalAI CSS etapp 13m — vormiväljade tokenipere omandipoliitika

## Eesmärk

Etapp 13m võttis eraldi tokeniperena ette vormiväljadega seotud üldtokenid:

- `--input-*`
- `--field-*`
- `--textarea-*`
- `--select-*`

Selles etapis ei muudetud CSS-i visuaalseid väärtusi. Eesmärk oli lisada auditile ja dokumentatsioonile omandimudel, et järgmises etapis saaks vormiväljade feature-spetsiifilised väärtused viia bridge-mudelisse samamoodi nagu varem tehti `--subpage-card-*` ja `--btn-primary-*` tokenitega.

## Tehtud muudatused

Lisatud/uuendatud:

- `app/styles/TOKENS.md`
  - lisatud vormiväljade tokenipere omandireeglid;
  - kirjeldatud canonical default, theme override, shared primitive ja feature bridge mudel;
  - lisatud soovitatud feature-alias mustrid, näiteks `--documents-input-*`, `--chat-input-*`, `--service-map-input-*`.
- `scripts/css-cleanup/style-token-audit.mjs`
  - audit tunneb nüüd `form-control` tokenipere;
  - audit jagab vormivälja tokenite definitsioonid tier'idesse;
  - lisatud uus CSV-väljund `reports/css-token-family-form-control.csv`;
  - `css:tokens:check` annab vea, kui vormivälja token satub dokumenteerimata omanikku.

## Mõõdik pärast etappi 13m

| Mõõdik | Väärtus |
|---|---:|
| CSS-faile | 156 |
| Tokeninimesid | 1160 |
| Tokenidefinitsioone kokku | 4323 |
| `var(...)` kasutusi | 6013 |
| Mitme väärtusega tokenikonflikte | 631 |
| Vormivälja tokenidefinitsioone | 259 |
| Vormivälja tokenitega faile | 15 |
| `feature-direct-definition` | 47 |
| `feature-bridge` | 8 |
| `shared-primitive` | 18 |
| `theme-override` | 167 |
| `canonical-default` | 19 |
| `other` | 0 |
| Projekti `!important` arv | 2025 |

## Vormiväljade otsene feature-võlg

Praegune `feature-direct-definition` jaotus:

| Fail | Otsedefinitsioone |
|---|---:|
| `app/styles/features/documents/workspace.css` | 20 |
| `app/styles/features/chat/hc.css` | 9 |
| `app/styles/features/documents/ui.css` | 9 |
| `app/styles/features/service-map/desktop/base.css` | 7 |
| `app/styles/features/documents/mono.css` | 1 |
| `app/styles/features/service-map/desktop/pre-inquiry-agent.css` | 1 |

Suurim järgmine kandidaat on `documents/workspace.css`, sest see eemaldaks 20 otsedefinitsiooni ühe kontrollitava bridge-migratsiooniga.

## Vormiväljade bridge-definitsioonid

Praegu on juba 8 definitsiooni bridge-kujul:

| Fail | Bridge-definitsioone |
|---|---:|
| `app/styles/features/documents/mono.css` | 7 |
| `app/styles/features/service-map/desktop/pre-inquiry-agent.css` | 1 |

## Staatiline kontroll

Kontrollitud puhtal after-30 tööpuul:

```text
git apply --check: OK
node scripts/css-cleanup/style-token-audit.mjs --check: OK
Missing local CSS imports: 0
CSS brace-balance errors: 0
Project CSS !important count: 2025
Form-control other definitions: 0
```

## Rakendamine

Rakenda pärast patch'i 30:

```bash
git apply --check sotsiaalai-css-cleanup-31-form-control-policy.patch
git apply sotsiaalai-css-cleanup-31-form-control-policy.patch

npm run css:tokens
npm run css:tokens:check
```

## Järgmine soovitus

Järgmine etapp võiks olla **13n: `documents/workspace.css` vormiväljade bridge-migratsioon**.

Eesmärk:

- lisada `--documents-input-*` alias-tokenid;
- jätta `--input-*` ainult bridge-kihiks;
- vähendada `form-control feature-direct-definition` arvu 47-lt 27-le;
- mitte muuta visuaalseid väärtusi.

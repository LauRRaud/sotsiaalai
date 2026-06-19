# SotsiaalAI CSS etapp 13g — service-map `--subpage-card-*` bridge

## Eesmärk

Viia viimased otsesed `--subpage-card-*` feature-definitsioonid service-map feature-alias/bridge mudelisse.

See etapp ei muuda visuaalseid väärtusi. Muutub ainult tokeni omand:

- service-map väärtused pannakse `--service-map-subpage-card-*` alias-tokenitesse;
- `--subpage-card-*` jääb service-map failis ainult bridge-tokeniks;
- subpage-card tokenipere audit ei näita enam ühtegi `feature-direct-definition` kirjet.

## Muudetud failid

- `app/styles/features/service-map/desktop/base.css`
- `app/styles/TOKENS.md`
- `reports/css-token-audit.json`
- `reports/css-token-collisions.csv`
- `reports/css-token-family-subpage-card.csv`

## Sisuline muudatus

Enne:

```css
html[data-contrast="hc"] .workspace-feature-panel {
  --subpage-card-bg: var(--workspace-elevated-card-bg);
  --subpage-card-bg-hover: var(--workspace-elevated-card-bg-hover);
}
```

Pärast:

```css
html[data-contrast="hc"] .workspace-feature-panel {
  --service-map-subpage-card-bg: var(--workspace-elevated-card-bg);
  --service-map-subpage-card-bg-hover: var(--workspace-elevated-card-bg-hover);
  --subpage-card-bg: var(--service-map-subpage-card-bg);
  --subpage-card-bg-hover: var(--service-map-subpage-card-bg-hover);
}
```

Väärtused on samad, kuid üldine `--subpage-card-*` token ei kanna enam service-map feature’i päris väärtust otse.

## Tokeniauditi mõju

| Mõõdik | Enne 13g | Pärast 13g |
|---|---:|---:|
| `feature-direct-definition` | 2 | **0** |
| `feature-bridge` | 21 | **23** |
| `other` | 0 | 0 |
| `service-map/desktop/base.css` direct `--subpage-card-*` | 2 | **0** |
| `service-map/desktop/base.css` bridge `--subpage-card-*` | 0 | **2** |

## `TOKENS.md` täiendus

Feature alias näidete loendisse lisati:

```text
--service-map-subpage-card-*
```

Sellega on `--subpage-card-*` tokenipere esimene korrastusvoor lõpuni viidud: audit ei näita enam ühtegi feature’i otsest väärtusdefinitsiooni.

## Staatiline kontroll

```text
git apply --check: OK
missing_imports: 0
import_cycles: 0
brace_balance_errors: 0
important_count: 2025
subpage_card_feature_direct_definitions: 0
subpage_card_feature_bridge_definitions: 23
subpage_card_other_definitions: 0
service_map_direct_subpage_card_definitions: 0
service_map_bridge_subpage_card_definitions: 2
tokens_mentions_service_map_alias: True
```

## Rakendamine

Rakendada pärast patch’i 24:

```bash
git apply --check sotsiaalai-css-cleanup-25-service-map-subpage-card-bridge.patch
git apply sotsiaalai-css-cleanup-25-service-map-subpage-card-bridge.patch

npm run css:tokens
npm run css:tokens:check
```

## Järgmine soovitus

`--subpage-card-*` perekond on nüüd feature-direct võlast puhas. Järgmine loogiline tokenigrupp on `--btn-primary-*`, sest see on auditites üks suuremaid ja segasemaid konfliktiallikaid:

- palju definitsioone;
- palju eri väärtusi;
- tõenäoliselt segab semantic button tokenit, feature CTA nuppe ja modal/action nuppe.

Soovitatav järgmine etapp: **13h — `--btn-primary-*` tokenipere omandipoliitika**, esmalt audit ja reeglid, mitte veel massiline CSS-väärtuste muutmine.

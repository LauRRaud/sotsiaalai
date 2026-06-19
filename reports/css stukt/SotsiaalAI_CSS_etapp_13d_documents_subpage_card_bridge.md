# SotsiaalAI CSS — etapp 13d: documents `--subpage-card-*` bridge-migratsioon

## Fookus

Etapp 13d võttis ette `app/styles/features/documents/workspace.css` faili `--subpage-card-*` tokenivõla.

Etapp 13c pani paika reegli, et feature ei peaks oma päris väärtuseid kirjutama otse shared `--subpage-card-*` tokenitesse. Õige muster on:

1. feature defineerib oma prefiksiga alias-tokenid;
2. feature shell mapib need alias-tokenid tagasi `--subpage-card-*` bridge-tokeniteks;
3. shared komponendid võivad endiselt lugeda `--subpage-card-*`, kuid feature’i päris väärtus on feature-prefiksiga tokenis.

## Tehtud muudatused

### 1. `documents/workspace.css` sai dokumendivaate alias-tokenid

Lisatud/muudetud alias-tokenid:

```css
--documents-subpage-card-bg
--documents-subpage-card-bg-hover
--documents-subpage-card-border
--documents-subpage-card-border-hover
--documents-subpage-card-shadow
--documents-subpage-card-shadow-hover
--documents-subpage-card-text
```

Dokumendivaate põhiväärtused ei muutu. Varasem otsekujuline seos:

```css
--subpage-card-bg: var(--documents-card-bg);
```

muutus bridge-mustriks:

```css
--documents-subpage-card-bg: var(--documents-card-bg);
--subpage-card-bg: var(--documents-subpage-card-bg);
```

### 2. Library/theme scoped override’id kasutavad nüüd documents alias-tokenit

Näiteks varasem:

```css
--subpage-card-bg: var(--documents-surface-panel-bg);
--subpage-card-bg-hover: var(--subpage-card-bg);
```

muutus:

```css
--documents-subpage-card-bg: var(--documents-surface-panel-bg);
--documents-subpage-card-bg-hover: var(--documents-subpage-card-bg);
```

Seega on `documents/workspace.css` sees dokumendivaate tegelik väärtus nüüd `--documents-subpage-card-*` all, mitte otse shared `--subpage-card-*` tokenis.

### 3. Tokeniaudit oskab nüüd eristada feature bridge’i

`style-token-audit.mjs` tunneb nüüd ära `feature-bridge` kategooria.

Kui `features/` all olev `--subpage-card-*` väärtus on kujul:

```css
--subpage-card-bg: var(--documents-subpage-card-bg);
```

siis see ei ole enam `feature-direct-definition`, vaid `feature-bridge`.

### 4. `TOKENS.md` sai täpsema bridge-reegli

Dokumentatsiooni täpsustati nii, et feature’i päris väärtus peab olema feature-prefiksiga tokenis ning `--subpage-card-*` jääb ainult bridge’iks.

## Mõju tokeniauditile

| Mõõdik | Enne 13d | Pärast 13d | Muutus |
|---|---:|---:|---:|
| `--subpage-card-*` definitsioonid kokku | 134 | 141 | +7 |
| `feature-direct-definition` | 41 | 16 | **−25** |
| `feature-bridge` | 0 | 7 | **+7** |
| `other` | 0 | 0 | 0 |

`documents/workspace.css` tulemus:

| Kontroll | Tulemus |
|---|---:|
| Mitte-bridge `--subpage-card-*` definitsioonid | **0** |
| Bridge `--subpage-card-*` definitsioonid | **7** |
| Uued `--documents-subpage-card-*` alias-tokenid | **25+** |

## Miks definitsioonide koguarv kasvas?

See on oodatud.

Enne oli väärtus otse shared tokenis:

```css
--subpage-card-bg: var(--documents-card-bg);
```

Pärast on sama visuaalne väärtus kahekihiline:

```css
--documents-subpage-card-bg: var(--documents-card-bg);
--subpage-card-bg: var(--documents-subpage-card-bg);
```

Seega lisandus 7 bridge-definitionit. See on teadlik arhitektuuriline hind, et feature’i oma väärtus oleks feature-prefiksiga tokenis.

## Miks multi-value collision count kasvas?

`Multi-value token collisions` kasvas 615 → 619, sest lisandusid uued `--documents-subpage-card-*` alias-tokenid, millel on library ja theme scope’ides eri väärtused.

See on parem kui varasem olukord, sest konflikt on nüüd feature-prefiksiga tokenis. Shared `--subpage-card-*` token ei kanna enam dokumentide eri pindade tegelikke väärtusi otse.

## Staatiline kontroll

```text
git apply --check: OK
Missing local CSS imports: 0
CSS import cycles: 0
CSS brace-balance errors: 0
Documents workspace non-bridge --subpage-card definitions: 0 []
```

Tokeniaudit:

```text
CSS files: 156
Tokens: 1119
Definitions: 4231
Usages: 5921
Multi-value token collisions: 619
Undefined usages: 95
Defined but unused: 259
Subpage-card definitions: 141
Subpage-card feature direct definitions: 16
Subpage-card feature bridge definitions: 7
Subpage-card other definitions: 0
```

## Riskid

### Madal/keskmine risk

CSS-i visuaalseid väärtusi ei muudetud, kuid väärtused liiguvad nüüd läbi alias-tokeni. See peaks brauseris käituma samamoodi, sest custom property väärtused lahenduvad kasutuskohas.

### Vajab hiljem visuaalkontrolli

Kontrollida tuleks vähemalt:

- `/documents` library vaade;
- `/dokreziim` agent vaade;
- `/vestlus` embedded documents view;
- light/mid/night/mono/HC režiimid;
- mobile documents workspace.

## Mis jäi alles

Pärast 13d on `feature-direct-definition` alles veel 16 kohas, peamiselt:

- `features/documents/mono.css`;
- `features/documents/ui.css`;
- `features/chat/hc.css`;
- `features/service-map/desktop/base.css`.

Neid ei tasu samasse patch’i segada, sest need on teised omanikud ja suurema visuaalse riskiga.

## Järgmine soovitus

Järgmine loogiline etapp on **13e: `documents/ui.css` ja `documents/mono.css` `--subpage-card-*` bridge-migratsioon**.

See peaks olema eraldi patch, sest:

- `ui.css` sisaldab HC ja pindade fallback’e;
- `mono.css` mõjutab teemat;
- mõlema visuaalne regressioonirisk on suurem kui `workspace.css` alias-migratsioonil.

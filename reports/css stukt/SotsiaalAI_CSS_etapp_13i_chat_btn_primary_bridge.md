# SotsiaalAI CSS etapp 13i — chat `--btn-primary-*` bridge-migratsioon

## Eesmärk

Etapi 13i eesmärk oli vähendada `--btn-primary-*` tokenipere otsest feature-võlga chat-kihis. Visuaalseid väärtusi ei muudetud. Kõik chat-spetsiifilised nupuväärtused viidi `--chat-btn-primary-*` alias-tokenitesse ning `--btn-primary-*` jäi feature’is bridge-tokeniks.

See järgib etapis 13h lisatud mudelit:

```css
.chat-feature-shell {
  --chat-btn-primary-bg: ...;
  --btn-primary-bg: var(--chat-btn-primary-bg);
}
```

## Muudetud failid

| Fail | Muudetud otsedefinitsioone | Uus mudel |
|---|---:|---|
| `app/styles/features/chat/hc.css` | 22 | `--chat-btn-primary-*` + bridge |
| `app/styles/features/chat/shell.css` | 18 | `--chat-btn-primary-*` + bridge |
| `app/styles/features/chat/themes.css` | 10 | `--chat-btn-primary-*` + bridge |
| `app/styles/features/chat/analysis-touch-controls.css` | 3 | `--chat-btn-primary-*` + bridge |
| `app/styles/features/chat/mono.css` | 2 | `--chat-btn-primary-*` + bridge |

Kokku viidi bridge-mudelisse **55 chat `--btn-primary-*` definitsiooni**.

## Mõju tokeniauditile

| Mõõdik | Enne 13i | Pärast 13i |
|---|---:|---:|
| `btn-primary` definitsioone kokku | 310 | 310 |
| `feature-direct-definition` | 78 | **23** |
| `feature-bridge` | 0 | **55** |
| `legacy-shared-feature` | 6 | 6 |
| `other` | 0 | 0 |
| Chat direct `--btn-primary-*` definitsioonid | 55 | **0** |
| Projekti `!important` arv | 2025 | 2025 |

Allesolev direct-võlg pärast 13i:

| Fail | Direct definitsioone |
|---|---:|
| `components/covision/CovisionPage.module.css` | 11 |
| `app/styles/features/documents/ui.css` | 10 |
| `components/wellbeing/WellbeingPage.module.css` | 2 |

## Oluline tehniline märkus

`app/styles/features/chat/mono.css` sisaldas varem ühte `!important` deklaratsiooni `--btn-primary-bg` peal. Bridge-migratsioonis jäi `!important` semantilisele bridge-tokenile, mitte alias-tokenile:

```css
--chat-btn-primary-bg: var(--mono-orbit-surface);
--btn-primary-bg: var(--chat-btn-primary-bg) !important;
```

See säilitab varasema `--btn-primary-bg` prioriteedi ega suurenda projekti `!important` arvu.

## Staatiline kontroll

```text
git apply --check: OK
Missing local CSS imports: 0 []
CSS import cycles: 0
CSS brace-balance errors: 0 []
Project CSS !important count: 2025
Btn-primary feature direct definitions: 23
Btn-primary feature bridge definitions: 55
Btn-primary other definitions: 0
Chat direct --btn-primary definitions: 0
```

`npm run css:tokens:check` läbis pärast patch’i.

## Rakendamine

Patch rakendatakse pärast patch’i 26:

```bash
git apply --check sotsiaalai-css-cleanup-27-chat-btn-primary-bridge.patch
git apply sotsiaalai-css-cleanup-27-chat-btn-primary-bridge.patch

npm run css:tokens
npm run css:tokens:check
```

## Risk

Risk on madal kuni keskmine:

- väärtusi ei muudetud;
- selectorite ulatus ei muutunud;
- tokenite nimed muutusid feature-siseselt;
- brauseris tuleks siiski kontrollida chat HC, mono ja drawer/sidebar vaateid, sest seal on aktiivsed `--btn-primary-*` tokenid nupuvälimuse aluseks.

## Järgmine samm

Järgmiseks sobib **13j: `documents/ui.css` või `CovisionPage.module.css` `--btn-primary-*` bridge**. Kui eesmärk on suurim arv korraga, siis `CovisionPage.module.css` vähendab direct-võlga 11 võrra. Kui eesmärk on jätkata juba korrastatud documents-tokenite loogikat, siis `documents/ui.css` on sujuvam järgmine samm.

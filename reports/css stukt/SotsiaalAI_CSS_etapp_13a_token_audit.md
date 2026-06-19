# SotsiaalAI CSS etapp 13a — disainitokenite ja teemade inventuur

## Staatus

See etapp on **audit, mitte Git-patch**. Väärtusi, selektoreid ega importgraafi ei muudetud. Analüüs põhineb seisul pärast patch’i 19 ehk pärast globaalse mobiilikihi korrastuse lõppu.

Põhjus, miks ma ei teinud selles etapis kohe CSS-parandust: tokenite/teemade puhul on automaatne asendamine kõrge riskiga. Kõigepealt tuleb eristada, millised erinevused on teadlikud teemavariandid ja millised on juhuslikud killud.

---

## Üldmõõdikud pärast patch’i 19

| Mõõdik | Väärtus |
|---|---:|
| CSS-faile | 156 |
| CSS toorbaite | 1,082,838 B |
| Defineeritud custom property’d | 1017 |
| Custom property definitsioone kokku | 4224 |
| Viidatud custom property’d | 853 |
| `var(...)` viiteid kokku | 5914 |
| Tokenid, millel on mitu erinevat definitsiooni | 615 |
| CSS-is defineeritud, kuid CSS-is mitteviidatud tokenid | 259 |
| CSS-is viidatud, kuid CSS-is defineerimata tokenid | 95 |
| Unikaalseid HEX-värve | 162 |
| Unikaalseid `rgb()/rgba()/hsl()/hsla()` väärtusi | 1531 |
| Unikaalseid `color-mix()/oklch()` jms väärtusi | 131 |
| Unikaalseid radius-väärtusi | 57 |
| Unikaalseid shadow-väärtusi | 308 |
| Unikaalseid blur-väärtusi | 28 |
| Unikaalseid `z-index` väärtusi | 48 |
| Unikaalseid `font-size` väärtusi | 91 |
| Unikaalseid spacing-väärtusi | 524 |
| Unikaalseid breakpoint’e | 17 |
| Unikaalseid transition/animation kestusi | 43 |

---

## Peamine järeldus

SotsiaalAI CSS-is on tokenisüsteem juba olemas, aga see ei ole veel päriselt **üks süsteem**. Seal on korraga kolm erinevat loogikat:

1. **päris disainitokenid**, näiteks `--brand-primary`, `--btn-primary-bg`, `--input-bg`;
2. **teemade override-tokenid**, näiteks light/dark/mid/mono/HC variandid;
3. **feature’i lokaalsed seisunditokenid**, näiteks documents, chat, covision, wellbeing ja service-map omad.

Probleem ei ole ainult hardcoded värvides. Suurem probleem on see, et samad nimed, näiteks `--subpage-card-bg`, `--input-bg` ja `--btn-primary-bg`, saavad väga paljudes failides erinevaid väärtusi. See teeb teema- ja komponendikäitumise raskesti ennustatavaks.

---

## Kõige suuremad tokeni konfliktid

| Token | Definitsioone | Erinevaid väärtusi | Risk |
|---|---:|---:|---|
| `--subpage-card-bg` | 34 | 18 | kõrge |
| `--subpage-card-bg-hover` | 34 | 18 | kõrge |
| `--btn-primary-bg` | 33 | 19 | kõrge |
| `--btn-primary-bg-active` | 33 | 19 | kõrge |
| `--btn-primary-bg-hover` | 32 | 19 | kõrge |
| `--input-bg` | 31 | 16 | kõrge |
| `--input-bg-focus` | 31 | 16 | kõrge |
| `--input-bg-hover` | 31 | 16 | kõrge |
| `--btn-primary-border-active` | 29 | 12 | kõrge |
| `--btn-primary-border` | 28 | 11 | kõrge |
| `--btn-primary-border-hover` | 27 | 12 | kõrge |
| `--btn-primary-shadow` | 24 | 13 | kõrge |

Need ei tähenda automaatselt viga. Osa neist on teadlikud teemaoverride’id. Aga selline maht näitab, et enne `!important` vähendamist tuleb tokenite omand selgeks teha.

### Näide: `--subpage-card-bg`

Sama token on defineeritud 34 korda ja 18 erineva väärtusega. See on liiga üldine nimi, mis on muutunud sisuliselt cross-feature pinnaks. Sellise tokeni puhul on vaja otsustada:

- kas see on tõeline shared primitive;
- kas see peaks jagunema `--surface-card-*`, `--surface-panel-*`, `--surface-field-*` tokeniteks;
- kas documents/service-map/chat peaksid kasutama oma lokaalseid alias-tokenid.

---

## Värvid

### Top HEX-värvid

| Väärtus | Kordi | Faile | Näidisfailid |
|---|---:|---:|---|
| `#000` | 107 | 16 | `app/styles/components/selected-listing.css, app/styles/components/workspace-help-listings.css, app/styles/features/chat/shell.css` |
| `#ffea00` | 92 | 15 | `app/styles/components/workspace-help-listings.css, app/styles/features/chat/help-listings-modal-surfaces.css, app/styles/features/chat/shell.css` |
| `#c57171` | 76 | 30 | `app/styles/components/journey.css, app/styles/features/chat/mobile-topnav.css, app/styles/features/chat/mobile.css` |
| `#7a3a38` | 33 | 14 | `app/styles/features/chat/mobile.css, app/styles/features/chat/themes.css, app/styles/features/documents/workspace.css` |
| `#2f3a4a` | 21 | 4 | `app/styles/features/chat/themes.css, app/styles/features/register/coarse-pointer.css, app/styles/features/service-map/desktop/base.css` |
| `#1f2937` | 20 | 9 | `app/styles/features/chat/mobile.css, app/styles/features/chat/themes.css, app/styles/features/home/themes.css` |
| `#090a0f` | 17 | 7 | `app/styles/base/core.css, app/styles/features/home/background-mobile.css, app/styles/theme/hc.css` |
| `#fff` | 17 | 4 | `app/styles/features/chat/mono.css, app/styles/features/service-map/desktop/popup.css, app/styles/theme/mono.css` |
| `#f2f2f2` | 17 | 11 | `app/styles/features/chat/shell.css, app/styles/features/home/desktop.css, app/styles/features/service-map/desktop/base.css` |
| `#8f3d3d` | 10 | 4 | `app/styles/features/documents/ui.css, app/styles/features/service-map/desktop/base.css, app/styles/features/service-map/desktop/popup.css` |
| `#c8c8c8` | 10 | 5 | `app/styles/features/profile/mono.css, app/styles/theme/mono.css, components/chat/WorkspacePanel.module.css` |
| `#10151d` | 9 | 5 | `app/styles/base/core.css, app/styles/features/home/mobile-foundations.css, app/styles/features/service-map/desktop/shell.css` |

### Top `rgba()/hsl()` väärtused

| Väärtus | Kordi | Faile | Näidisfailid |
|---|---:|---:|---|
| `rgba(0, 0, 0, 0.25)` | 62 | 27 | `app/styles/components/workspace-help-listings.css, app/styles/features/chat/help-listings-modal-surfaces.css, app/styles/features/chat/mobile.css` |
| `rgba(0, 0, 0, 0)` | 56 | 9 | `app/styles/features/chat/shell.css, app/styles/features/policy/pages.css, app/styles/features/policy/responsive.css` |
| `rgba(255, 122, 126, 0)` | 42 | 3 | `app/styles/features/chat/shell.css, app/styles/features/service-map/desktop/popup.css, app/styles/shared/ui-glow.css` |
| `rgba(255, 255, 255, 0)` | 41 | 10 | `app/styles/base/backgrounds.css, app/styles/features/policy/pages.css, app/styles/shared/glass-subpage.css` |
| `rgba(0, 0, 0, 0.14)` | 31 | 12 | `app/styles/components/selected-listing.css, app/styles/components/workspace-help-listings.css, app/styles/features/documents/agent.css` |
| `rgba(255, 255, 255, 0.06)` | 30 | 8 | `app/styles/features/documents/workspace.css, app/styles/features/home/themes.css, app/styles/features/service-map/desktop/base.css` |
| `rgba(255, 234, 0, 0.12)` | 29 | 11 | `app/styles/features/chat/shell.css, app/styles/features/documents/ui.css, app/styles/features/documents/workspace.css` |
| `rgba(255, 234, 0, 0.1)` | 28 | 7 | `app/styles/features/documents/ui.css, app/styles/shared/register.css, app/styles/shared/ui-glow.css` |
| `rgba(255, 255, 255, 0.08)` | 27 | 15 | `app/styles/base/backgrounds.css, app/styles/components/workspace-help-listings.css, app/styles/features/chat/help-listings-modal-surfaces.css` |
| `rgba(255, 234, 0, 0.14)` | 26 | 8 | `app/styles/features/chat/shell.css, app/styles/features/documents/ui.css, app/styles/features/service-map/desktop/popup.css` |
| `rgba(0, 0, 0, 0.22)` | 22 | 14 | `app/styles/base/layout.css, app/styles/features/chat/shell.css, app/styles/features/documents/workspace.css` |
| `rgba(222, 236, 255, 0)` | 22 | 4 | `app/styles/features/chat/hc.css, app/styles/features/chat/shell.css, app/styles/theme/hc.css` |

### Top `color-mix()` / moodsad värvifunktsioonid

| Väärtus | Kordi | Faile | Näidisfailid |
|---|---:|---:|---|
| `color-mix(in srgb, var(--glass-ring-surface-bg, rgba(0, 0, 0, 0.25))` | 18 | 7 | `app/styles/features/documents/agent.css, app/styles/features/documents/workspace.css, app/styles/features/service-map/desktop/base.css` |
| `color-mix(in srgb, var(--documents-glass-surface) 88%, transparent)` | 10 | 1 | `app/styles/features/documents/workspace.css` |
| `color-mix(in srgb, var(--workspace-feature-text) 14%, transparent)` | 8 | 2 | `app/styles/features/service-map/desktop/base.css, app/styles/features/service-map/mobile.css` |
| `color-mix(in srgb, var(--documents-glass-surface) 92%, transparent)` | 7 | 1 | `app/styles/features/documents/workspace.css` |
| `color-mix(in srgb, var(--documents-glass-surface) 90%, transparent)` | 6 | 1 | `app/styles/features/documents/workspace.css` |
| `color-mix(in srgb, var(--documents-glass-surface) 86%, transparent)` | 5 | 1 | `app/styles/features/documents/workspace.css` |
| `color-mix(in srgb, var(--documents-glass-surface) 80%, transparent)` | 5 | 1 | `app/styles/features/documents/workspace.css` |
| `color-mix(in srgb, var(--documents-glass-surface) 84%, transparent)` | 5 | 1 | `app/styles/features/documents/workspace.css` |
| `color-mix(in srgb, var(--documents-glass-surface) 96%, transparent)` | 4 | 1 | `app/styles/features/documents/workspace.css` |
| `color-mix(in srgb, var(--documents-glass-surface) 98%, transparent)` | 3 | 1 | `app/styles/features/documents/workspace.css` |

### Järeldus värvidest

- `#c57171` on tegelik brändituum, kuid seda kasutatakse endiselt mitmes failis otse, mitte alati `--brand-primary` kaudu.
- `#ffea00` ehk kollane high-contrast rõhk on väga laialt levinud ja peaks olema selgelt HC-token, mitte juhuslik literaal.
- Musta/valge läbipaistvusega `rgba(...)` väärtusi on liiga palju eri tugevustes. Neid tuleks koondada surface/overlay/shadow tokeniteks.
- Documents kasutab palju `color-mix()` variatsioone, eriti `--documents-glass-surface` 80–100% vahel. See on hea kandidaat lokaalseks documents opacity skaalaks.

---

## Radius

| Väärtus | Kordi | Faile | Näidisfailid |
|---|---:|---:|---|
| `999px` | 31 | 18 | `app/styles/components/journey.css, app/styles/features/chat/hc.css, app/styles/features/documents/ui.css` |
| `inherit` | 27 | 18 | `app/styles/features/chat/mono.css, app/styles/features/chat/themes.css, app/styles/features/home/desktop.css` |
| `0` | 16 | 13 | `app/styles/components/journey.css, app/styles/features/chat/hc.css, app/styles/features/documents/library.css` |
| `0.72rem` | 12 | 5 | `app/styles/features/documents/ui.css, app/styles/features/service-map/desktop/base.css, app/styles/features/service-map/desktop/popup.css` |
| `clamp(1.6rem, 3.5vw, 2.4rem)` | 11 | 3 | `app/styles/components/invite-modal.css, app/styles/features/chat/shell.css, app/styles/features/policy/pages.css` |
| `1rem` | 11 | 7 | `app/styles/components/journey.css, app/styles/features/chat/help-listings-modal-surfaces.css, app/styles/features/documents/agent.css` |
| `0.86rem` | 6 | 3 | `app/styles/features/service-map/desktop/base.css, app/styles/features/service-map/desktop/leaflet.css, components/wellbeing/WellbeingPage.module.css` |
| `var(--service-map-map-radius)` | 5 | 3 | `app/styles/features/service-map/desktop/leaflet.css, app/styles/features/service-map/desktop/shell.css, app/styles/features/service-map/mobile.css` |
| `0.9rem` | 4 | 3 | `app/styles/features/service-map/desktop/base.css, app/styles/features/service-map/desktop/popup.css, app/styles/features/service-map/desktop/toolbar.css` |
| `var(--mobile-glass-card-radius)` | 4 | 3 | `app/styles/mobile/scroll-panels/glass-card.css, app/styles/mobile/scroll-panels/workspace-layout.css, app/styles/shared/mobile-workspace-scroll-adapters.css` |
| `clamp(1.6rem, 3.5vw, 2.4rem) !important` | 3 | 3 | `app/styles/components/workspace-help-listings.css, app/styles/shared/glass-subpage.css, app/styles/shared/workspace-guide.css` |
| `0 !important` | 3 | 2 | `app/styles/features/invite/mobile.css, components/chat/WorkspacePanel.module.css` |

### Järeldus radius’est

Radius-väärtusi on 57. See ei ole katastroofiline, aga praegu on süsteem killustunud. Soovituslik skaala:

```css
--radius-pill: 999px;
--radius-xs: 0.5rem;
--radius-sm: 0.72rem;
--radius-md: 0.95rem;
--radius-lg: 1.2rem;
--radius-xl: 1.5rem;
--radius-panel: clamp(1.6rem, 3.5vw, 2.4rem);
```

Kõiki olemasolevaid väärtusi ei pea kohe asendama. Esimene samm on ainult tokeniskaala dokumenteerimine.

---

## Shadow

| Väärtus | Kordi | Faile | Näidisfailid |
|---|---:|---:|---|
| `none` | 168 | 32 | `app/styles/features/chat/hc.css, app/styles/features/chat/help-listings-modal-surfaces.css, app/styles/features/chat/mono.css` |
| `none !important` | 88 | 40 | `app/styles/components/journey.css, app/styles/features/chat/hc.css, app/styles/features/chat/mobile-topnav.css` |
| `var(--glass-shell-shadow, none) !important` | 7 | 7 | `app/styles/features/chat/shell.css, app/styles/features/documents/library.css, app/styles/features/documents/mobile.css` |
| `var(--documents-elevated-shadow)` | 7 | 3 | `app/styles/features/documents/agent.css, app/styles/features/documents/library.css, app/styles/features/documents/ui.css` |
| `var(--btn-primary-shadow)` | 6 | 5 | `app/styles/features/chat/mono.css, app/styles/features/chat/themes.css, app/styles/theme/light.css` |
| `0 10px 22px rgba(7, 7, 7, 0.3)` | 6 | 3 | `app/styles/features/chat/mono.css, app/styles/theme/mono.css, components/chat/rail.module.css` |
| `var(--workspace-feature-shadow)` | 6 | 2 | `app/styles/features/service-map/desktop/base.css, app/styles/features/service-map/desktop/toolbar.css` |
| `var(--seg-card-shadow) !important` | 5 | 5 | `app/styles/features/accessibility/touch-controls.css, app/styles/features/invite/touch-controls.css, app/styles/features/register/touch-controls.css` |
| `var(--chat-inputbar-shadow-hover)` | 5 | 1 | `app/styles/features/chat/themes.css` |
| `var(--glass-shell-shadow, none)` | 5 | 4 | `app/styles/features/documents/library.css, app/styles/features/documents/ui.css, app/styles/features/service-map/mobile.css` |
| `var(--service-map-mobile-toggle-shadow)` | 5 | 1 | `app/styles/features/service-map/mobile.css` |
| `var(--seg-card-shadow-selected, var(--seg-card-shadow)) !important` | 4 | 4 | `app/styles/features/accessibility/touch-controls.css, app/styles/features/chat/analysis-touch-controls.css, app/styles/features/invite/touch-controls.css` |

### Järeldus shadow’dest

Shadow on üks suuremaid segaduse allikaid:

- unikaalseid shadow-väärtusi on 308;
- shadow deklaratsioone on 690;
- `none !important` esineb väga palju, mis tähendab, et varjud on sageli hiljem maha surutud;
- `--btn-primary-shadow`, `--subpage-card-shadow`, `--input-shadow` ja documents shadow-tokenid juba eksisteerivad, aga süsteem ei ole ühtlustatud.

Soovituslik süsteem:

```css
--shadow-none: none;
--shadow-field: ...;
--shadow-card: ...;
--shadow-panel: ...;
--shadow-floating: ...;
--shadow-modal: ...;
--shadow-glow-soft: ...;
```

`none !important` massilist kasutust ei tasu enne tokenite korrastust vähendada.

---

## Blur

| Väärtus | Kordi | Faile | Näidisfailid |
|---|---:|---:|---|
| `var(--glass-blur-radius, 1rem` | 20 | 12 | `app/styles/features/chat/mobile.css, app/styles/features/chat/themes.css, app/styles/features/documents/library.css` |
| `26px` | 7 | 1 | `app/styles/features/service-map/mobile.css` |
| `var(--service-map-glass-blur` | 5 | 3 | `app/styles/features/service-map/desktop/shell.css, app/styles/features/service-map/desktop/toolbar.css, app/styles/features/service-map/mobile.css` |
| `0.9rem` | 4 | 2 | `app/styles/features/profile/hc.css, components/effects/Components/OrbitalMenu/OrbitalMenu.css` |
| `18px` | 3 | 2 | `app/styles/features/service-map/desktop/base.css, app/styles/features/service-map/desktop/toolbar.css` |
| `var(--service-map-glass-blur, var(--glass-blur-radius, 1rem` | 3 | 1 | `app/styles/features/service-map/desktop/popup.css` |
| `0` | 2 | 2 | `app/styles/base/animations.css, app/styles/components/journey.css` |
| `var(--glass-ring-edge-stroke-blur, 0px` | 2 | 2 | `app/styles/shared/glass-subpage.css, app/styles/shared/login-a11y.css` |
| `var(--glass-modal-blur, var(--glass-blur-radius, 1rem` | 2 | 2 | `app/styles/shared/glass-subpage.css, components/covision/CovisionPage.module.css` |
| `0.625rem` | 1 | 1 | `app/styles/base/animations.css` |
| `2px` | 1 | 1 | `app/styles/base/animations.css` |
| `0.35rem` | 1 | 1 | `app/styles/components/journey.css` |

### Järeldus blur’idest

Blur-väärtusi on 28. Klaasdisaini puhul on see otseselt jõudlusrisk, eriti mobiilis. Soovituslikult peaks olema väike skaala:

```css
--blur-none: 0;
--blur-soft: 0.5rem;
--blur-glass: 1rem;
--blur-modal: 1.25rem;
--blur-heavy: 1.6rem;
```

Kõik `backdrop-filter` reeglid peaksid tulevikus kasutama neid alias-tokenid.

---

## Z-index

| Väärtus | Kordi | Faile | Näidisfailid |
|---|---:|---:|---|
| `0` | 27 | 14 | `app/styles/base/backgrounds.css, app/styles/features/chat/themes.css, app/styles/features/documents/agent.css` |
| `1` | 25 | 15 | `app/styles/features/chat/mono.css, app/styles/features/chat/themes.css, app/styles/features/documents/ui.css` |
| `2` | 15 | 13 | `app/styles/base/backgrounds.css, app/styles/base/core.css, app/styles/features/chat/hc.css` |
| `3` | 8 | 7 | `app/styles/base/backgrounds.css, app/styles/features/documents/workspace.css, app/styles/features/home/mobile.css` |
| `92` | 4 | 4 | `app/styles/features/documents/ui.css, app/styles/features/register/coarse-pointer.css, app/styles/features/service-map/desktop/base.css` |
| `4` | 4 | 3 | `app/styles/features/profile/mobile.css, app/styles/features/service-map/mobile.css, app/styles/shared/login-a11y.css` |
| `240` | 4 | 3 | `app/styles/features/service-map/desktop/base.css, app/styles/theme/mono.css, components/chat/LeftRail.module.css` |
| `40` | 3 | 2 | `app/styles/features/documents/agent.css, app/styles/features/documents/ui.css` |
| `35` | 3 | 3 | `app/styles/features/service-map/mobile-header.css, app/styles/mobile/subpage-header/layout.css, components/ui/PageInfoButton.module.css` |
| `20` | 2 | 2 | `app/styles/base/layout.css, components/chat/rail.module.css` |
| `120` | 2 | 2 | `app/styles/features/documents/ui.css, components/wellbeing/WellbeingPage.module.css` |
| `95 !important` | 2 | 1 | `app/styles/features/profile/android-mobile.css` |
| `6` | 2 | 2 | `app/styles/features/profile/mobile.css, components/CenteredScrollPicker.css` |
| `80` | 2 | 2 | `app/styles/features/service-map/desktop/base.css, components/chat/rail.module.css` |
| `500` | 2 | 1 | `app/styles/features/service-map/desktop/leaflet.css` |

### Järeldus z-index’ist

Unikaalseid `z-index` väärtusi on 48. See on liiga palju. Praegu on eri maailmad:

- väikesed komponendisisese kihistuse väärtused;
- route’i sticky/header väärtused;
- modal/overlay väärtused;
- väga kõrged väärtused nagu 2400.

Soovituslik skaala:

```css
--z-base: 0;
--z-raised: 10;
--z-sticky: 100;
--z-dropdown: 300;
--z-overlay: 500;
--z-modal: 700;
--z-toast: 900;
--z-debug: 2400;
```

---

## Breakpoint’id

| Väärtus | Kordi | Faile | Näidisfailid |
|---|---:|---:|---|
| `768px` | 102 | 73 | `app/styles/components/invite-modal.css, app/styles/components/workspace-help-listings.css, app/styles/features/accessibility/fields.css` |
| `769px` | 24 | 15 | `app/styles/base/core.css, app/styles/features/documents/ui.css, app/styles/features/invite/mobile.css` |
| `48.001em` | 8 | 6 | `app/styles/features/home/desktop.css, app/styles/features/profile/hc.css, app/styles/theme/light.css` |
| `48em` | 3 | 3 | `app/styles/components/journey.css, app/styles/theme/mono.css, components/effects/Components/OrbitalMenu/OrbitalMenu.css` |
| `1440px` | 3 | 2 | `app/styles/features/policy/responsive.css, app/styles/tokens.css` |
| `560px` | 2 | 1 | `app/styles/features/service-map/mobile.css` |
| `1280px` | 2 | 1 | `app/styles/tokens.css` |
| `1760px` | 2 | 1 | `app/styles/tokens.css` |
| `44rem` | 1 | 1 | `app/styles/features/documents/agent.css` |
| `62rem` | 1 | 1 | `app/styles/features/documents/agent.css` |
| `480px` | 1 | 1 | `app/styles/features/home/mobile-foundations.css` |
| `640px` | 1 | 1 | `app/styles/features/profile/mobile.css` |

### Järeldus breakpoint’idest

Peamine piir on `768px`, kuid kõrval on ka `769px`, `48em` ja `48.001em`. See viitab, et desktop/mobile piiri on parandatud mitmel eri ajal. Soovitus:

```css
--bp-mobile-max: 768px;
--bp-desktop-min: 769px;
```

CSS custom property’t ei saa otse media query’s kasutada tavalises CSS-is ilma build-lahenduseta, seega tuleb need vähemalt dokumenteerida ja kontrollida lint-skriptiga.

---

## Animatsiooni kestused

| Väärtus | Kordi | Faile | Näidisfailid |
|---|---:|---:|---|
| `560ms` | 47 | 10 | `app/styles/base/backgrounds.css, app/styles/features/chat/analysis-touch-controls.css, app/styles/features/chat/themes.css` |
| `160ms` | 36 | 8 | `app/styles/features/documents/agent.css, app/styles/features/documents/ui.css, app/styles/features/home/mobile.css` |
| `180ms` | 26 | 8 | `app/styles/features/documents/ui.css, app/styles/features/home/desktop.css, app/styles/features/home/mobile.css` |
| `680ms` | 24 | 2 | `app/styles/features/chat/shell.css, app/styles/features/policy/pages.css` |
| `220ms` | 19 | 6 | `app/styles/features/chat/themes.css, app/styles/features/home/desktop.css, app/styles/features/service-map/desktop/popup.css` |
| `150ms` | 16 | 4 | `app/styles/features/documents/agent.css, app/styles/features/documents/library.css, app/styles/features/documents/ui.css` |
| `520ms` | 14 | 6 | `app/styles/base/core.css, app/styles/components/journey.css, app/styles/features/chat/shell.css` |
| `0s` | 11 | 3 | `app/styles/base/backgrounds.css, app/styles/mobile/background-layer.css, app/styles/shared/login-a11y.css` |
| `120ms` | 9 | 5 | `app/styles/features/profile/mobile.css, app/styles/features/service-map/desktop/shell.css, app/styles/features/service-map/desktop/toolbar.css` |
| `420ms` | 7 | 3 | `app/styles/features/chat/shell.css, app/styles/features/service-map/desktop/base.css, app/styles/shared/ui-glow.css` |
| `0.55s` | 6 | 2 | `app/styles/features/profile/hc.css, components/effects/Components/OrbitalMenu/OrbitalMenu.css` |
| `260ms` | 5 | 4 | `app/styles/features/home/desktop.css, app/styles/shared/login-a11y.css, components/chat/LeftRail.module.css` |

### Järeldus kestustest

Kestusi on 43. Kõige sagedasemad on 560ms, 160ms, 180ms, 680ms, 220ms. Siin võiks olla disainiskaala:

```css
--motion-fast: 160ms;
--motion-base: 220ms;
--motion-slow: 420ms;
--motion-orbit: 560ms;
--motion-panel: 680ms;
```

---

# Soovitatud järgmine töö

## Etapp 13b — tokenite omandimudel

Enne väärtuste muutmist tuleks lisada dokument või failikommentaar, mis määrab tokenite tüübid:

```text
Foundation tokenid
  --brand-primary
  --pt-*
  --surface-*
  --text-*
  --radius-*
  --shadow-*
  --blur-*
  --z-*

Semantic component tokenid
  --btn-primary-*
  --input-*
  --subpage-card-*
  --glass-modal-*

Feature alias-tokenid
  --documents-*
  --chat-*
  --workspace-*
  --service-map-*
  --wellbeing-*
  --covision-*

Theme override’id
  theme/light.css
  theme/dark.css
  theme/mid.css
  theme/mono.css
  theme/hc.css
```

## Etapp 13c — esimene madala riskiga token patch

Esimene päris patch võiks olla väike ja ohutu:

1. lisada `app/styles/tokens/README.md` või täiendada olemasolevat CSS-arhitektuuri README-d;
2. dokumenteerida radius, z-index, blur ja motion skaalad;
3. mitte veel asendada olemasolevaid väärtusi;
4. lisada hiljem lint-skript, mis raporteerib uued mittestandardväärtused.

## Etapp 13d — hardcoded brändivärvi patch

Alles pärast seda võiks teha esimese väärtuseasenduse:

- `#c57171` → `var(--brand-primary)` seal, kus see ei ole fallback’i osa;
- `#ffea00` → `var(--hc-accent)` ainult HC kontekstis;
- hoida fallback’id alles kujul `var(--brand-primary, #c57171)`.

---

# Riskid

- `undefined_custom_prop_refs` ei tähenda automaatselt viga. Osa väärtusi võib tulla JS-ist, inline style’ist või runtime mõõtmisest.
- `unused_custom_props` ei tähenda automaatselt kustutatavat koodi. Osa tokenitest võib olla teemaoverride, fallback või tulevikuvaru.
- Tokeni kollisioon ei tähenda automaatselt valet. Light/dark/HC override’id ongi mitme definitsiooniga. Probleem on siis, kui sama üldnimi tähendab eri feature’ites eri asja.
- Automaatsed väärtuseasendused võivad muuta kaskaadi, fallback’e ja teemarežiime. Seetõttu tuleb esimesed tokenipatch’id teha väikeste sammudena.

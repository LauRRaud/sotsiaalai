# SotsiaalAI CSS/testide audit, 2026-06-19

Eesmärk: vaadata üle Claude'i tehtud CSS/UI contract testid enne CSS-korrastuse etapp 1 käivitamist.

## Kokkuvõte

Praegune testibaas ei ole puhas lähtepunkt CSS-refaktoriks. Suur osa kukkumistest on vale testikoodi või vale auditiskripti tulemus:

- mitu testi loeb compatibility aggregator CSS-faile otse ega lahenda `@import`-e;
- mõned visual-contract testid kinnistavad täpse lähtekoodi kuju, mitte käitumist ega computed style'i;
- `css-page-report.mjs` ei uuenda teema cookie't, kuigi `css-snapshot.mjs` teeb seda;
- `mid` teema kasutab korraga `theme-light` ja `theme-mid` klasse, seega lihtne esimese `theme-*` klassi lugemine annab vale raporti.

## Kriitilised leiud

### 1. `css-page-report.mjs` rakendab teemat poolikult

Fail: `scripts/css-page-report.mjs`, read 108-126.

`applyTheme()` kirjutab `theme` ja `a11y_prefs` ainult `localStorage`-isse. Seejärel reloaditakse leht ja oodatakse ainult root klassi. Rakenduses loevad server/layout ja AccessibilityProvider ka `a11y_prefs` cookie't. `scripts/css-snapshot.mjs` read 111-121 sisaldavad sama probleemi kohta kommentaari ja kirjutavad cookie õigesti.

Mõju: page-report võib näidata `mid` teemat osaliselt vana cookie-põhise React/taustateemaga. See sobib tähelepanekuga, et `mid` ei renderdanud raportis õigesti.

Soovitus: kopeerida cookie kirjutamine `css-snapshot.mjs` `applyTheme()` loogikast `css-page-report.mjs` sisse.

### 2. `browser-inspect.js` raporteerib `mid` teema valesti

Fail: `scripts/browser-inspect.js`, rida 97.

Raport kasutab:

```js
document.documentElement.className.match(/theme-\w+/)
```

Rakendus ise paneb `mid` korral rootile korraga `theme-light` ja `theme-mid` klassid (`app/layout.js` read 136-137 ja 344; `AccessibilityProvider.jsx` read 252-270). Kui klassijärjekorras tuleb `theme-light` esimesena, saab raport teemaks `theme-light`, mitte `mid`.

Mõju: isegi kui renderdus on õige, raportis võib `mid` olla valesti sildistatud.

Soovitus: lugeda esmalt `data-theme-mode`, või eelistada `theme-mid` kontrolli enne `theme-light` kontrolli.

### 3. Paljud CSS testid loevad aggregator-faile otse

Näited:

- `tests/ui/documentsWorkspaceLayout.test.js` read 12-13 loeb `helpers.css` ja `documents-mode.css`;
- `tests/ui/hcSurfaceContracts.test.js` read 11, 42, 89, 123, 211, 251 loeb `chat-focus.css`, `documents-mode.css`, `glass.css`;
- `tests/ui/subpageSurfaceGlow.test.js` read 20-21 loeb `helpers.css` ja `glass.css`;
- `tests/ui/scrollSurfaceHeader.test.js` rida 20 loeb `helpers.css`;
- `tests/ui/serviceMapLeafletVisualContracts.test.js` rida 161 loeb `glass.css`.

Need failid on kas compatibility aggregatorid või importide kogumid:

- `app/styles/components/documents-mode.css` sisaldab ainult kommentaari;
- `app/styles/components/chat-focus.css` impordib splititud chat faile;
- `app/styles/components/glass.css` impordib `shared/glass-core.css`, `shared/ui-glow.css`, `shared/register.css`;
- `app/styles/utilities/helpers.css` impordib `helpers-core.css`, `glass-ring-stable.shared.css`, `helpers-invite-scrollbar.css`.

Mõju: test kukub läbi, sest otsitav CSS on olemas teises failis, aga test ei loe importi.

Tõend: `tests/ui/lightMidGlowControls.test.js` kukkus enne 5 kontrolliga läbi. Pärast importide lahendamise helperit jäi 10 testist läbi 9 ja ainult üks regex-kuju probleem jäi alles.

Soovitus: kõik source-level CSS contract testid peaksid kasutama rekursiivset `@import` resolverit või lugema tegelikku owner-faili.

### 4. Osa teste kinnistab lähtekoodi kuju, mitte käitumist

Näited:

- `tests/serviceMap/entryTypeFilters.test.js` rida 27 nõuab täpset array/readText lähtekoodi kuju `WorkspaceFeaturePage.jsx` sees;
- `tests/workspace/adminRolePropagation.test.js` read 12-20 ja 26-32 kontrollivad portaali/markup'i täpset tekstilist paigutust;
- `tests/workspace/serviceMapIconInline.test.js` read 13-17 kontrollivad SVG path fragmentide täpset stringi;
- `tests/workspace/workspaceDashboardBadges.test.js` read 83-101 kontrollivad täpseid icon stroke väärtusi source-regexiga;
- `tests/ui/chatMobileTopNavHighContrast.test.js` read 27-43 kontrollivad täpset inline style'i ja CSS tokeni kuju.

Mõju: turvaline refaktor, komponendi väljatõstmine või CSS-i ümberjagamine võib testi murda ilma kasutajale nähtava regressioonita.

Soovitus: päris loogika testida imporditud funktsioonidega; UI/visual kontraktid testida DOM/computed-style või snapshot-runneriga. Source-regex jätta ainult kitsastele architecture guardidele.

### 5. Helperid ise võivad driftida

Failid:

- `tests/helpers/mobileCssBundle.mjs`;
- `tests/helpers/serviceMapCssBundle.mjs`.

Need sisaldavad käsitsi nimekirju CSS-failidest, mitte ei alusta tegelikust entrypointist ja ei lahenda importgraafi.

Mõju: test võib jätta uue owner-faili vahele või jätkata vana faili testimist ka pärast CSS ümberstruktureerimist.

Soovitus: asendada käsitsi bundle-listid sama import-resolveriga või genereerida nimekiri tegelikust importgraafist.

## Konkreetne proof-of-fix

Lisatud on `tests/helpers/cssSourceBundle.mjs`, mis loeb CSS `@import` graafi rekursiivselt. `tests/ui/lightMidGlowControls.test.js` kasutab seda nüüd `glass.css` puhul.

Kontroll:

```txt
node --test tests\ui\lightMidGlowControls.test.js
pass: 9
fail: 1
```

Allesjäänud failure on testis endas: regex ootab `:root.theme-light .ui-glow-button-frame` ja `:root.theme-mid .ui-glow-button-frame` täpset selector-kuju, kuid päris CSS-is on selectorid täpsemad:

- `app/styles/shared/ui-glow.css` read 147-148 kasutavad `:not(.profile-orbit-menu__center):not(.profile-orbit-edge-glow)`;
- sama plokk sisaldab otsitud transparent shadow väärtusi ridadel 153-154.

See on testikoodi kuju-probleem, mitte ilmne renderdusdefekt.

## Soovitatud järjekord enne etapp 1

1. Parandada `css-page-report.mjs` cookie kirjutamine ja `browser-inspect.js` teema tuvastus.
2. Ühtlustada CSS testid `readCssSourceBundle()` peale või suunata need tegelikele owner-failidele.
3. Asendada kõige hapramad source-regexid kas imporditud funktsioonide testidega või Playwright/computed-style testidega.
4. Alles seejärel võtta CSS baas uuesti: `css:audit:check`, `css:budget`, targeted UI tests, vajadusel page-report.


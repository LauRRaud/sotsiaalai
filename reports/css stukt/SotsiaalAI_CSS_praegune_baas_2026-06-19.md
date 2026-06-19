# SotsiaalAI CSS praegune baas

Kuupaev: 2026-06-19 08:29 Europe/Tallinn  
Haru: `main`  
HEAD: `95791c96c92c95c6ed91469d5dc4b77fe96fa624`

## Eesmärk

See fail fikseerib praeguse tööpuu seisu enne `reports/css stukt` all olevate CSS-etappide rakendamist.

Oluline: selle baseline'i järgi **etapp 1 ei ole veel rakendatud**. See fail ei rakenda ühtegi patchi ega muuda rakenduse CSS-i.

## Git-seis

`git status --short` näitab ainult uusi raporteid/auditifaile `reports/css stukt` kaustas.

Rakenduse lähtekoodis ei tuvastatud selle baseline'i koostamise ajal tracked muudatusi.

Näited untracked failidest:

- `reports/css stukt/SotsiaalAI_CSS_etapp_11*.md`
- `reports/css stukt/SotsiaalAI_CSS_etapp_13*.md`
- `reports/css stukt/patch*-static-checks.txt`
- `reports/css stukt/sotsiaalai_css_token_audit_after*.json`
- `reports/css stukt/sotsiaalai_css_token_family_*.csv`

## Etapp 1 seis

Kontrollid:

- `tests/helpers/cssSourceBundle.mjs`: puudub
- `app/styles/tokens/base.css`: olemas
- `app/styles/globals.css` impordib endiselt `./tokens/base.css`
- `app/styles/globals.css` impordib endiselt `./components/journey.css`
- `app/styles/globals.css` impordib endiselt `./mobile/index.css` media tingimusega

Järeldus: patch 01 kirjeldatud muudatused ei ole praeguses tööpuus tehtud.

## Patch 01 rakendatavus

Käsk:

```powershell
git apply --check --verbose -- 'reports\css stukt\sotsiaalai-css-cleanup-01.patch'
```

Tulemus: OK. Patch kontrollis järgmisi sihtfaile ja konflikti ei tuvastanud:

- `app/styles/components/documents-mode.css`
- `app/styles/globals.css`
- `app/styles/tokens/base.css`
- `tests/helpers/cssSourceBundle.mjs`
- mitu `tests/ui/*` ja `tests/workspace/*` faili

See tähendab ainult, et patch rakenduks tehniliselt praegusele harule. See ei kinnita veel buildi ega visuaali.

## CSS baasnumbrid

Staatiline hetkeseis:

| Mõõdik | Väärtus |
|---|---:|
| `app/styles` CSS-faile | 82 |
| `app/styles` CSS toorbaidid | 830787 B |
| `components` CSS/CSS module faile | 13 |
| `components` CSS/CSS module toorbaidid | 234949 B |
| `app/styles` `!important` esinemisi lihtsa otsinguga | 1196 |

Märkus: `npm run css:budget` kasutab oma täpsemat loendurit ja raporteerib eraldi väärtuse 1992/1992. Need kaks arvu ei ole sama metoodikaga mõõdetud.

## Verifikatsioon

### `git diff --check`

Tulemus: OK.

### `npm run css:audit:check`

Tulemus: OK.

Kokkuvõte:

```text
CSS files: 82
Source files scanned: 643
Raw CSS bytes: 811.3 KB
Class selectors: 1898
Not seen in source: 23 (1.2%)
css:audit guard: notSeen 23 <= 30 OK
```

Suurimad CSS-failid auditi järgi:

| Fail | Maht | Klasse | Leidmata |
|---|---:|---:|---:|
| `app/styles/features/service-map/desktop.css` | 99.8 KB | 213 | 13 |
| `app/styles/theme/hc.css` | 66 KB | 185 | 1 |
| `app/styles/features/chat/shell.css` | 37.4 KB | 38 | 0 |
| `app/styles/features/documents/workspace.css` | 36.5 KB | 34 | 0 |
| `app/styles/theme/mono.css` | 32.6 KB | 75 | 0 |
| `app/styles/features/chat/themes.css` | 27.3 KB | 32 | 0 |
| `app/styles/features/documents/ui.css` | 25.1 KB | 72 | 3 |
| `app/styles/shared/ui-glow.css` | 23.8 KB | 23 | 0 |
| `app/styles/theme/mid.css` | 22.9 KB | 45 | 0 |
| `app/styles/features/chat/hc.css` | 22.4 KB | 45 | 0 |

### `npm run css:budget`

Tulemus: OK.

```text
!important within budget: 1992 / 1992
```

### `npm test`

Tulemus: FAIL praegusel baasil.

Ebaõnnestunud testid:

- `tests/serviceMap/entryTypeFilters.test.js`
- `tests/ui/chatMobileTopNavHighContrast.test.js`
- `tests/ui/dashboardInfoOverlayContracts.test.js`
- `tests/ui/documentsWorkspaceLayout.test.js`
- `tests/ui/hcSurfaceContracts.test.js`
- `tests/ui/lightMidGlowControls.test.js`
- `tests/ui/mobileChatKeyboardOffset.test.js`
- `tests/ui/scrollSurfaceHeader.test.js`
- `tests/ui/serviceMapLeafletVisualContracts.test.js`
- `tests/ui/subpageSurfaceGlow.test.js`
- `tests/workspace/adminRolePropagation.test.js`
- `tests/workspace/serviceMapIconInline.test.js`
- `tests/workspace/workspaceDashboardBadges.test.js`
- `tests/workspace/workspaceHeaderAlignment.test.js`

Märkus: mõnes failis on mitu failing assertionit. Need ebaõnnestumised olid olemas enne CSS etappide rakendamist ja baseline peab neid arvestama. Patch 01 rakendamise järel ei tohi failure-list kasvada ilma eraldi põhjenduseta.

Näited assertionitest:

- `service map toolbar names the KOV social welfare department tab`
- `workspace dashboard header starts at the same desktop top edge as embedded subpages`
- mobiilse topnav/HC ja glass surface lepingud

## Otsus enne etapp 1 rakendamist

Praegune baas ei ole täiesti roheline, sest `npm test` kukub läbi olemasolevate lepingutestide tõttu. Samas CSS-spetsiifilised väravad `css:audit:check`, `css:budget` ja `git diff --check` on rohelised.

Etapp 1 võib olla järgmine samm ainult siis, kui seda käsitleda testitaristu paranduse ja madala riskiga cleanup'ina, mitte visuaalse CSS-refaktorina.

Soovituslik etapp 1 kontrolljärjekord:

1. Rakenda ainult `sotsiaalai-css-cleanup-01.patch`.
2. Käivita `git diff --check`.
3. Käivita `npm run css:audit:check`.
4. Käivita `npm run css:budget`.
5. Käivita `npm test` ja võrdle failure-listi selle baseline'iga.
6. Kui failure-list kasvab, rollbacki patch 01 või eralda testitaristu osa väiksemaks patchiks.

## Mitte teha selles seisus

- Ära alusta etappi 2 enne patch 01 tulemuste võrdlust selle failiga.
- Ära rakenda patch 03 eraldi. Varasem kontroll ütleb, et patch 03 ja 04 tuleb käsitleda koos.
- Ära alusta etappi 14 ega suurte failide uut jagamist.
- Ära võta `reports/css stukt` hilisemaid 11/13 seeria faile praeguse repo seisuna. Need on raportid/arhiiv ja paljud neist on Gitile veel untracked.

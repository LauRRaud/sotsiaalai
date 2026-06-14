# Kava: nupu- ja klaaspaneeli-võla likvideerimine kõigis kihtides

**Koostas Opus 2026-06-14.** See on **iseseisev täitmiskava Sonnetile** — kogu vajalik kontekst on siin.
Eesmärk: platvormil kasutab sama primitiiv sama kujundust **igal pool**, ja divergentne nupu-/paneeli-kood
kaob **mõlemast kihist** (JSX Tailwind-stringid + `app/styles/` CSS).

**Loe ka:** `reports/css-restructure-plan.md` (üldraamistik), `reports/css-btn-consolidation-brief.md`,
`reports/css-button-system.md` (archetype-reeglid), `reports/css-cleanup-runbook.md` (snapshot-värav),
audit `reports/css-important-audit/2026-06-14/`, skann `reports/css-page-report/2026-06-14/consistency.md`.

---

## 0. Mõõdetud lähtekoht (2026-06-14)

Sama nupp on platvormil maalitud paljude eri implementatsioonidega. Kahes kihis korraga:

| Kiht | Kogus | Kus |
|---|---|---|
| **JSX / Tailwind** | **49 `*ButtonClassName =` definitsiooni / 23 failis** | admin-RAG raskeim; analüütika; mujal enamasti OK (paigutus) |
| **`app/styles/` CSS** | **39 nupu-override selektorit / 9 failis** | `hc.css` 19 (!), `mono.css` 5, `chat/shell.css` 4, `chat/mono.css` 3, `register.css` 2, `light.css` 2, `service-map/desktop.css` 2, `dark.css` 1, `chat/themes.css` 1 |

Lisaks **3 toore-`<button>` paneeli** admin-RAG landing-lehel, igaüks oma `buttonClassName`/`primaryButtonClassName`-iga,
ja **`--admin-button-*` süsteem** (`ragAdminShared.js`), mis kaardistab `--documents-*` peale ja värvib platvormi `<Button>`-i
lamedaks `!important`-iga.

**Põhiidee:** ÄRA paranda nuppu-haaval. Vii kõik kasutuskohad ÜHELE kanoonilisele primitiivile, **kustuta** divergentsed
klassid/CSS, lase värvil tulla **tokenist**. `!important`/scattered klassid kaovad kõrvalsaadusena.

---

## 1. Sihtmudel — LUKUS (kasutaja kinnitas)

### Nupud = ainult 4 archetüüpi
| Archetüüp | Kanooniline | Variandid / kasutus |
|---|---|---|
| **Põhinupp** | `components/ui/Button.jsx` | **ainult `variant="primary"` ja `variant="danger"`**. Üks glass-stiil kõikjal. |
| **Valiku nupp** | `components/ui/OptionCard.jsx` + `components/ui/primarySegmentedButtonClassName.js` (`--seg-*`) | filtri-kiibid, segment-tabid, valikukaardid |
| **Linnukese nupp** | checkbox/toggle archetüüp (`--seg-*` põhine; tuvasta täpne komponent — nt „Tasun tema eest" toggle) | märkeruut-nupud |
| **Link** | `variant="linkBrand"` (`components/ui/linkStyles.js`) | ERAND, harv, oma klass |

> **`secondary` ja `ghost` KAOVAD.** Praegu on Button.jsx-s `secondary === ghost === ghostStyles` (identsed).
> Iga tegevus-nupp = `primary`. Madala-rõhu / „Tühista" / „Sulge" = `primary` (hierarhia tuleb asukohast) VÕI harv `linkBrand`.
> **Mitte kunagi `secondary`/`ghost`.** (Visuaalselt tõestatud: heledal paneelil on `ghost`-nupp peaaegu nähtamatu — katki välimus.)

### Klaaspaneel = ainult üks
`components/ui/Panel.jsx` `variant="glass"` — teema-teadlik blur (light=valge, dark=klaas, hc=hc). **Sama element igal pool**
(töölaud, dokumendid, kasutusjuhend kasutavad seda juba). Admin-paneelid (RAG/analüütika/monitor) kõvakodeerivad oma
`--documents-*` color-mix tausta → **vii `<Panel variant="glass">`-ile**.

### Paigutus = lubatud
Suurus/asukoht/margin Tailwind-stringina kutsumiskohas on OK. **Ainult värv/taust/ääris/vari/raadius** üle-värvimine on võlg.

---

## 2. Teisendusreeglid (rakenda mehaaniliselt)

| Leiad | Teed |
|---|---|
| toore `<button>` + lokaalne `buttonClassName`/`primaryButtonClassName` | `<Button variant="primary">` (või `danger`) + ainult suurus-className; **kustuta** lokaalsed klassi-consts |
| `<Button>` + admin `buttonPrimary/Secondary/Ghost/Danger/RefreshClassName` | `<Button variant="primary\|danger">`; **kustuta** need admin-color-consts |
| `variant="secondary"` või `variant="ghost"` (KÕIKJAL, ka väljaspool admin) | `variant="primary"` (tegevus) või `variant="linkBrand"` (puhas Tühista/Sulge) — otsusta konteksti järgi |
| className-const mis seab **värv/bg/border/shadow/radius** | kustuta värvi-osa; jäta ainult suurus/spacing kui vaja |
| className-const mis seab **ainult suurust/spacing/position** | **JÄTA** — see on legaalne paigutus |
| kõvakodeeritud `--documents-*` paneeli-klass (`panelClassName` color-mix bg + shadow) | `<Panel variant="glass">` + paigutus-className; kustuta lokaalne klass |
| CSS `:root.theme-X .invite-primary-btn { surface-prop: V !important }` / `:is(.button,.btn,…){…!important}` | vii **`--btn-*` token** teemafaili (`:root.theme-X { --btn-primary-*: V }`); kui väärtus = juba tokenist → **kustuta redundantne** (vt `css-restructure-plan.md` §5 näidisviil) |

**Variant-korrektsuse kontroll (KOHUSTUSLIK):** pärast iga migratsiooni veendu, et `data-variant` annab ÕIGE archetüübi
välimuse (3D glass primary vs lapik), MITTE ainult et vana klass kadus. (Õppetund: alias võib peita vale variandi.)

---

## 3. Kiht 1 — JSX / Tailwind (49 consti, triaaž)

**Triaaž-reegel:** ava iga `*ButtonClassName` const → seab värv/bg/border/shadow? = **VÕLG, kustuta**. Ainult suurus? = **JÄTA**.

### 3a. Admin-RAG (raskeim, alusta siit)
| Fail | Tegevus |
|---|---|
| `components/admin/rag/RagAdminContactRegistryPanel.jsx` | **JUBA TEHTUD** (Opuse pilot, committimata) — toore `<button>` → `<Button variant="primary">`, kõik 4 primary. **See on MALL.** |
| `components/admin/rag/RagAdminKovSourceMonitorPanel.jsx` | toore `<button>` (read 19,24,164,167,170) → `<Button variant="primary">`; kustuta `buttonClassName`/`primaryButtonClassName` |
| `components/admin/rag/RagAdminRtRegistryPanel.jsx` | sama muster (read 19,24,…) → `<Button variant="primary">`; kustuta lokaalsed consts |
| `components/admin/rag/ragAdminShared.js` | **kustuta** `buttonPrimaryClassName`, `buttonSecondaryClassName`, `buttonGhostClassName`, `buttonDangerClassName`, `buttonRefreshClassName` + `--admin-button-*` token-blokk `buttonBaseClassName`-st. **Jäta** suurus-consts (`buttonCompactClassName`, `buttonTinyClassName`, ja `buttonBaseClassName`-st AINULT suurus-osa: `!min-h`/`!rounded`/`!px`/`!py`/`!text`). Route kõik kasutajad: primary→`variant="primary"`, secondary/ghost→`variant="primary"`, danger→`variant="danger"`. |
| admin-RAG `<Button>` kasutajad (~76): `RagAdminDetailModal`, `RagAdminDocumentsView`, `RagAdminIngestView`, `RagAdminOrganizationsView`, `kov/KovDetailPanel`, `kov/KovTable` | eemalda `${buttonBaseClassName} ${buttonPrimary/Secondary/Ghost/Danger}` color-classid; jäta ainult `${buttonCompactClassName}`/`${buttonTinyClassName}` (suurus). Variant: primary/secondary/ghost→`primary`, danger→`danger`. |
| `components/admin/rag/RagAdminDocumentsView.jsx` | `sectionButtonClassName` (98), `sourceRegistryButtonClassName` (117) — triaaž (kui värv → kustuta) |

> **NB:** varasem commit `49e8afea` muutis admin-nupud `variant="ghost"`-iks — see oli **vale vahesamm**. Siht on `primary`/`danger`, MITTE ghost. Supersede see.

### 3b. Admin muu
| Fail | Tegevus |
|---|---|
| `components/admin/AnalyticsDashboard.jsx` | `refreshButtonClassName`/`actionButtonClassName`/`resetActionButtonClassName` ehitatud `ragAdminRefreshButtonClassName`-st → triaaž; nupud `variant="ghost"`→`primary` (commit `49e8afea` muutis ghostiks, supersede). `backButtonClassName = glassPageBackTopLeftClassName` = OK (jäta). |
| `components/admin/FrameworkAcceptancesAdmin.jsx` | `actionButtonClassName` (31) — triaaž |
| `components/materials/MaterialsAdminSubmissionsPanel.jsx` | kontrolli (1 const) |

### 3c. Kogu platvor — `secondary`/`ghost` migratsioon
`grep -rn 'variant="secondary"\|variant="ghost"' components/` → iga kasutus: `primary` (tegevus) või `linkBrand` (Tühista/Sulge).
Kui pärast seda `grep 'variant="ghost"\|variant="secondary"'` = 0 mitte-admin kohas → **eemalda `secondary`+`ghost` Button.jsx-st**
(`variantStyles`-st), et neid ei saaks enam kasutada.

> Enamik ülejäänud 23 failist (CovisionPage 5, RegistreerimineBody 3, ProfiilBody 4, RoomsPage 2, UuendaPinBody 1 jne)
> on **paigutus-consts** (suurus/position) `<Button>` peal — need on OK, JÄTA. Triaaž igaüht, aga ära puutu legaalseid.

---

## 4. Kiht 2 — `app/styles/` CSS (39 override selektorit → tokenid)

See on `css-restructure-plan.md` **Rada B**. Iga `.invite-primary-btn`/`:is(.button,.btn,…)` teema-override:
1. leia `:root.theme-X … { surface-prop: V !important }`
2. lisa `:root.theme-X { --btn-primary-*: V }` (teemafaili)
3. Button.jsx loeb juba `var(--btn-primary-*)` → `!important` KAOB
4. kui V = juba tokenist (redundantne) → lihtsalt kustuta

**Järjekord = RISK, mitte arv:**
1. `register.css` (2), `light.css` (2), `dark.css` (1), `chat/themes.css` (1) — väike, ohutu
2. `mono.css` (5), `chat/mono.css` (3), `chat/shell.css` (4), `service-map/desktop.css` (2)
3. **`hc.css` (19) VIIMASENA** — suurim, AGA a11y-kontrast ei tohi katki; eskaleeri Opusele, lai snapshot + kontrasti-kontroll

**Testiloader:** kui muudad `hc.css`/`mono.css` bundle'eid, vt `scripts/register-node-test-loader.mjs` `legacyCssBundles` (need failid bundle'itakse testides).

---

## 5. Paneelid → `<Panel variant="glass">`

Vii kõik admin/divergentsed kõvakodeeritud paneelid kanoonilisele:
- `RagAdminContactRegistryPanel` / `RagAdminKovSourceMonitorPanel` / `RagAdminRtRegistryPanel` lokaalne `panelClassName` → `<Panel variant="glass">` + paigutus
- `ragAdminShellStyles.js` `ragAdminShellCardClassName` (kõvakodeeritud `--admin-surface` color-mix + blur) → `<Panel variant="glass">` muster
- analüütika paneelid sama

`<Panel variant="glass">` on teema-teadlik (ei sõltu `documents-workspace`-ist), nii et klaas ühtlustub teemaga nagu mujal.

---

## 6. Valvurid (IGA viil, kohustuslik)

- **Snapshot-värav:** `node scripts/css-snapshot.mjs` before/after → `✓ identical` (VÕI tahtlik muutus seletatud) enne commiti
- **`npm test` = 968/12 baseline** (null UUT kukkumist; baseline `reports/test-failures-baseline-2026-06-11.txt`)
- **jscpd ≤ 109** (ei tõuse)
- **`node scripts/css-important-audit.mjs`** → `!important` arv peab Kiht-2 viilul **langema** (3769-st)
- **Visuaal (NB headless ei tööta):** `preview_screenshot` **timeout'ib** (BorderGlow-canvas). Kasuta selle asemel
  `preview_eval` computed-stiili kontrolli: `data-variant`, `ui-glow-button-frame` (glow), `borderRadius` (999px primary),
  `background` (radial valge primary). Lõpliku visuaalse heakskiidu teeb Opus/kasutaja päris-brauseris (computer-use screenshot),
  MITTE Sonnet öösel.
- **Variant-korrektsus:** kontrolli renderdatud archetüüpi (3D glass vs lapik), mitte ainult „klass kadus"

---

## 7. Esimesed viilud (alusta täpselt nii)

1. **Viil 1 — landing raw-button paneelid:** `RagAdminKovSourceMonitorPanel` + `RagAdminRtRegistryPanel` → `<Button variant="primary">` (mall = juba tehtud `RagAdminContactRegistryPanel`). Snapshot, test, commit. *(Sisaldab Opuse committimata pilodi commitimist.)*
2. **Viil 2 — admin-nupusüsteem:** `ragAdminShared.js` color-consts kustuta + route 6 admin-RAG faili `<Button variant>`-ile (supersede ghost-commit `49e8afea`). Snapshot, test, commit.
3. **Viil 3 — analüütika:** `AnalyticsDashboard.jsx` nupud → primary/danger. Commit.
4. **Viil 4 — admin paneelid → `<Panel variant="glass">`.** Commit.
5. **Viil 5 — platvor `secondary`/`ghost` → primary/linkBrand**, siis eemalda variandid Button.jsx-st. Commit.
6. **Viil 6+ — Kiht 2 CSS tokenid** (§4 järjekord, hc.css viimasena/Opus).

Üks viil = üks commit. `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`.

---

## 8. Keelud + õppetunnid (ÄRA korda)

- **ÄRA `rm -rf .next` jooksva dev-serveri alt** → manifest-mismatch, CSS 400, stale render. Tapa+restart server.
- **ÄRA jäta `secondary`/`ghost`** — alati `primary` või `linkBrand`.
- **CSS-failides LF, mitte CRLF.** ÄRA kasuta PowerShell `Set-Content` CSS-il (katkised täpitähed). Kasuta Edit/node.
- **ÄRA puutu `lib/rag/*`** (teise konto WIP, lõhub 2 testi).
- **ÄRA kustuta `safety_snapshots/`.**
- **Efekti-spec puutumata:** dark/night/mono/HC = 2 edge-glow; light/mid = 3 (2 glow + idle vari). Ühtlusta identiteet, ÄRA kustuta efekte.
- **Glass primary puhkeasendis = valge pill** (radial-gradient), glow tuleb hoveril — see on ÕIGE, mitte „lame".

## 9. Tööriistad

- `scripts/css-snapshot.mjs` (+`css-snapshot.targets.json`) — before/after värav
- `scripts/css-matched-rules.mjs` — võitev stiil per teema element-tasandil
- `scripts/css-important-audit.mjs` → `reports/css-important-audit/<kuupäev>/` — `!important` + orphan audit
- `scripts/css-page-report.mjs` (HEADED) → `consistency.md` — sama primitiiv >1 kujundus = viga
- Test-login: `node scripts/tmp-create-login-token.mjs` (e2e-kasutaja, isAdmin=true)

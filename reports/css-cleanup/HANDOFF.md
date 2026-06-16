# CSS `!important`-koristuse HANDOFF (uuele kontole/sessioonile)

**Miks see fail:** sessiooni-mälu on konto-lokaalne ega kandu kontovahetust üle.
See dokument elab repos → iga konto/mudel jätkab siit. Loe see + seotud dokud
ENNE tööd. Kirjutatud 2026-06-15, **uuendatud 2026-06-16 (sessioon 6 — Opus). HEAD: `40a7892c` (main).**
Tööpuu puhas.

> **🔑 SESSIOON 6 LÄBIMURRE — MÜRA-PÕRANDA TEHNIKA kummutab valed "lukus"-otsused.**
> "GATE-1 RED" EI tähenda alati päris-regressiooni. Asünkroonselt-settivad JS-komponendid
> (Leaflet kaart, kerimis-konteinerid, toolbar mis renderdab tulemusi) annavad **müra-põranda**:
> needsamad selektorid "muutuvad" ka ILMA ühegi koodimuutuseta. Prior sessioonid lugesid
> selle müra päris-regressiooniks → märkisid failid "täielikult lukus" EKSLIKULT. **Tõestatud:
> service-map/desktop.css oli "fully locked" — tegelikult 14 markerit ohutult eemaldatavad
> (118→104, commit `40a7892c`).** Vt §4a allpool meetodi jaoks. JÄRGMINE konto: rakenda sama
> tehnika kõigile "GATE-1 RED"-failidele (policy/responsive, chat/shell jt).

## 0. Lugemisjärjekord (3 faili)
1. **SEE FAIL** — seis, meetod, infra, järgmine samm.
2. [important-ledger.md](important-ledger.md) — REGISTER: mis tehtud / mis jäänud, feature kaupa. **Uuenda iga commiti järel.**
3. [css-important-reduction-method.md](../css-important-reduction-method.md) — meetodi teooria + kaskaadi-reeglid + õppetunnid (kontrakt-lukk, desktop-pimedus).

## 1. Eesmärk
Kasutaja soov: **drastiliselt vähem `!important`** (mitte "tuhat või rohkem") + kustutada
surnud üle-kirjutatud kood, **automaatselt** kus reegel jääb õigeks ilma markerita,
ja **jälg** (register) et poleks segadust mis tehtud. Kõik `main`-il (kasutaja lubas
otse-push). Väikesed gate'itud commitid.

## 2. Seis praegu
- **Platvorm: 3642 → 1215 `!important` (−2427 kampaania jooksul, sessioon 3+4+5+6 kokku −645).**
- **Sessioon 6 (2026-06-16, Opus):**
  - ✅ **service-map/desktop.css 118→104 (−14), commit `40a7892c`.** Prior "fully locked" oli VALE.
    Müra-põranda tehnika (§4a) tõestas: GATE-1 RED oli AINULT Leaflet/map async-müra
    (`.service-map-leaflet` position/inset, `.service-map-workspace__map` top/inset flipivad
    capture'ite vahel ka ilma muutuseta). Müra-vaba gate (page-panel + filters-shell + controls,
    ilma kahe müra-selektorita; HEAD×2 = identical kontrollitud) → 14-strip ✓ identical.
    Oracle blind spot (8 testi loevad CSS-i custom `readServiceMapCssBundle()` readFileSync-iga,
    nähtamatu oraaklile) lahendatud keep-selectors'iga: `service-map-leaflet,service-map-toolbar,
    service-map-workspace,service-profile,workspace-feature-toggle-row`.
  - **Re-rescan kõik STRIP>0 failid (chat/hc 19, chat/shell 38, profile/hc 23):** kõik GATE-1 RED
    PÄRIS põhjustel (chat/hc + chat/shell + profile/hc = nähtavad äär/glow/border muutused, EI müra).
    AGA vt §4a: chat/shell transform-müra (`none`↔`matrix(1,0,0,1,0,0)` = identne!) on osaliselt vale-
    positiivne — kui border-selektorid keep'ida + transform mürast välja, võib jääda strippe.
  - **workspaceHeaderAlignment GATE-2 false-negative tuvastatud:** see test ON 13-baseline'is
    (kukub HEAD-il ilma muutuseta). Sessioon 4 reverdis profile/hc selle "GATE-2 RED" pärast —
    LIIGA ETTEVAATLIK. (profile/hc on siiski GATE-1 RED päris HC-glow tõttu, nii et lukus jääb.)
- **Sessioon 3+4 (2026-06-16, autonoomne) tegid:**
  - Uued failid: home/desktop (52→49), home/themes (15→6), profile/mono (8→2),
    documents/mobile (11→9), documents/workspace (6→3), panel-surfaces (26→23),
    subpage-title-system (22→21), theme/mono (26→24), chat/themes (93→92)
  - Teised passid (kaskaad vabastas): workspace-guide (37→33), service-map/mobile (81→77),
    scroll-panels (71→15, kolm passi!), chat/mobile (33→14), agent.css (20→10), chat/mono (30→20)
  - Sessioon 4: chat/shell.css 85→59 (−26); profile/hc.css 23-STRIP katse GATE-2 RED → reverditud
- **Sessioon 5 (2026-06-16, autonoomne):**
  - platform-android.css gate ehitatud (android-gate.targets.json, eval `data-platform=android`)
  - 94 STRIP → GATE-1 RED (policy-heading geomeetria + profile-action-stack positsioon)
  - keep-selectors järk: policy-section+profile-mobile-action → 65 STRIP → GATE-1 RED
  - keep-selectors järk: +profile-orbit-stack → 21 STRIP → kõik 21 geomeetria (orbit-sizes, logout-wrap, a11y)
  - Järeldus: kõik 98 !important load-bearing Android-layout-overrides — **fail täielikult lukus**
  - 0 uut commiti
- **PEAMISED SKIP-FAILID (kõik uuritud, kõik blokeeritud):**
  - `shared/ui-glow.css` (118) — POLIITIKA-LUKK (canonical-button-look, ÄRA PUUTU)
  - `service-map/desktop.css` (104 — oli 118) — ✅ −14 sessioon 6 (müra-põrand). Ülejäänu = `.service-map-page-panel` full-screen fixed-geomeetria + kontrakt-lukk. NB: page-panel `position:fixed !important` strip oli tegelikult render-redundantne (uncontested), aga ei committinud seda eraldi — keep'is konservatiivselt.
  - `mobile/platform-android.css` (98) — gate ehitatud + testitud (sessioon 5). Kõik 98 on Android-layout geomeetria-overrides. 3 keep-taset (policy-section, profile-mobile-action, profile-orbit-stack) → 21 STRIP jäi → kõik geomeetria. **Täielikult lukus.**
  - `features/chat/shell.css` (85) — Tailwind transform cascade: 64 STRIP kaskaadiga vabastatud, kuid GATE-1 RED: `.chat-listen-btn | transform: none → matrix(1,0,0,1,0,0)` dark/night/mono/hc teemades. Keep-selectors "chat-listen-btn" → 27 STRIP, kuid sama probleem. "chat-inputbar" → 0 STRIP (liiga lai). Kaudne kaskaadikoosmõju (ei ole direct transform-reegel — Tailwind võidab pärast muude `!important` eemaldust)
  - `features/service-map/mobile.css` (77) — kontrakt-lukus (0 STRIP keep-selectors'iga)
  - `mobile/scroll-panels.css` (15) — exhausted (kolm passi: 95→71→60→15); ülejäänu geomeetria-kontrakt
  - `mobile/invite-workspace.css` (63) — 0 STRIP, täielikult kontrakt-lukus
  - `features/policy/responsive.css` (62) — geomeetria load-bearing: 47 STRIP kaskaadiga vabastatud, kuid GATE-1 RED: `.glass-policy-scroll` laius/kõrgus/margin muutub kõikides teemades ja viewport'ides. Keep-selectors geomeetria-selektoritele → 0 STRIP (kõik 62 reeglit on geomeetria-lukus)
  - `features/chat/hc.css` (29) — HC inputbar border + kontrakt-lukus (keep-selectors → 0)
  - `features/chat/mobile.css` (14) — kontrakt-lukus (pärast teist passi)
  - `features/profile/hc.css` (28) — orbit-menu kontrakt + oracle blind spot + HC bundle interferents: 23 STRIP katse GATE-1 ✓ kuid GATE-2 RED (workspaceHeaderAlignment), reverditud
  - `components/workspace-help-listings.css` (29) — 0 STRIP
  - `mobile/touch-controls.css` (25) — 0 STRIP
  - `shared/register.css` (7) — 0 STRIP
- **ODAV ORAAKEL-KORJE AMMENDUNUD.** Kõik 87 faili proovitud ≥1 korda.

## 3. PÕHITÕDE (tõestatud sel sessioonil)
**Teema-failide `!important` on valdavalt RENDER-REDUNDANTNE.** `:root.theme-X .sel`
on baasist `.sel` kõrgema spetsiifikatsusega → võidab ka ILMA `!important`-ita; teemad
on vastastikku välistavad (ei konkureeri runtime'is). hc.css 328 markerit maha →
**0 computed-muutust**. Markerid olid cargo-cult.

**Erandid, mis JÄÄVAD:**
- **Kontrakt-testid** valvavad mõnda markerit source-tekstis (glass-ring muster).
- **box-shadow** = sõja-altis (glass-ring: mid override'ib jagatud `Reegel A`-d).
  mid.css puhul jätsime KÕIK 9 box-shadow `!important` alles.
- **Geomeetria-kontrakt-süsteem** (policy/documents/workspace kerimis-ringid) =
  render-kandev JA kontrakt-lukus. policy 133/140 oli seda → **ei strippitav**.

## 4. MEETOD (kaks gate'i, ALATI mõlemad)
```
1. Vali kandidaadid  (oraakel-tööriist, §5)
2. Strip / muuda     (tööriist või käsitsi)
3. GATE-1 render:    css-snapshot.mjs (before) → muuda → (after) → css-snapshot-diff.mjs
                     → "✓ identical" = ohutu. ✗ = mõni marker render-kandev (taasta need).
4. GATE-2 kontrakt:  npm test → võrdle kukkumiste-hulka baseline'iga (comm -23).
                     Uusi kukkumisi = 0. (NB: 2026-06-16 praegune eeldas-baseline = 13
                     kukkumist: 12 algsest + 1 uus pre-existing "HC selected option cards
                     keep a yellow fill after the generic glow reset". Võrdle NIMESID,
                     mitte arvu.)
5. 🟢 mõlemad → commit main + uuenda ledger.  🔴 → revert (ÄRA committi punasega).
```

## 4a. ⭐ MÜRA-PÕRANDA TEHNIKA (sessioon 6 — kummutab valed "lukus"-otsused)
**Probleem:** `css-snapshot-diff` "✖ N differences" EI tähenda alati päris-regressiooni.
Asünkroonselt-renderduvad komponendid annavad **mittedeterministliku müra-põranda**:
- **Leaflet kaart** (`.service-map-leaflet`): position `relative`↔`static`, inset `0px`↔`auto`
- **Kerimis/sisu-konteinerid** (`.service-map-workspace__map` top/inset): settivad async,
  flipivad nt `88.8px`↔`146.08px` kui toolbar tulemused renderduvad eri ajal
- **Identity-transform**: `transform: none` vs `matrix(1, 0, 0, 1, 0, 0)` = VISUAALSELT IDENTNE
  (mõlemad = pole transformi); diff lipustab string-erinevuse, aga render on sama
- **/vestlus + homepage** teema-batch dropout (~18 diffi, vt MÜRA-REEGEL §6)

**Diagnostika (KOHUSTUSLIK enne "lukus"-otsust):** capture HEAD **kaks korda** samal gate'il →
diff. Kui samad selektorid "muutuvad" ka HEAD-vs-HEAD → see on müra, MITTE sinu muutus.
NB: müra võib igal jooksul ilmuda ERINEVAL teemal (random) — see ongi müra tunnus
(päris-regressioon on JÄRJEPIDEV samal selektor+teema+väärtus).

**Lahendus — müra-vaba gate:**
1. Tuvasta müra-selektorid (HEAD×2 diff näitab neid).
2. Tee uus targets-fail ILMA müra-selektoriteta (jäta load-bearing staatilised sisse).
3. **Kontrolli müra-põrand = 0:** HEAD×2 sellel puhastatud gate'il → peab olema `✓ identical`.
4. Alles SIIS gate'i kandidaat. `✓ identical` = päris-ohutu.

**Tõestatud (`40a7892c`):** service-map/desktop "fully locked" → 14 markerit ohutult eemaldatud.
Müra oli `.service-map-leaflet` + `.service-map-workspace__map`; puhas gate (page-panel +
filters-shell + controls + result-button + leaflet-shell) andis 0 müra-põranda ja 14-strip
✓ identical. **JÄRGMINE: rakenda kõigile prior-"GATE-1 RED" failidele** (policy/responsive
`.glass-policy-scroll` võib olla scroll-settle-müra; chat/shell transform = identity-müra).

## 5. TÖÖRIISTAD (kõik scripts/-is, töötavad)
- **`scripts/css-cleanup/theme-strip-oracle.mjs`** ⭐ — teema-faili strippija. Kasutab
  TESTIDE regex-literaale oraaklina (in-process, ilma brauserita): strip marker kui
  selle eemaldus ei lõhu ühtegi faili-matchivat testi-regexi; repair-loop taastab
  interakteeruvad. **Tegi hc+mid+mono võidu (kõik teema-failid).** Pass 2 = **grupp-
  restore** (taastab katkise oraakli match-regiooni KÕIK markerid korraga) → lahendab
  mitme-markeri-oraaklid, mis greedy üksik-restore'iga jäid kinni (mono oli see juhtum).
  **`--keep-selectors <substring-list>`** (uus): force-keep marker, kui ta reegli selektor
  sisaldab substringi — hoia render-gate-flagitud load-bearing + katmata selektorid (tegi
  feature-failid võimalikuks). NB: keep-by-classname on **leaky** grupeeritud/cross-file
  reeglitele (vt `.chat-mic-glyph` õppetund §6).
  ```bash
  TESTS=$(find tests -name "*.test.js" -o -name "*.test.mjs" | tr '\n' ',' | sed 's/,$//')
  node scripts/css-cleanup/theme-strip-oracle.mjs --file app/styles/theme/mono.css --tests "$TESTS"          # dry-run
  node scripts/css-cleanup/theme-strip-oracle.mjs --apply --file <fail> --tests "$TESTS" --keep-selectors ".x,.y"  # rakenda
  ```
  **RETSEPT feature-failile (tõestatud chat/documents/shared):** (1) ehita deterministlik
  gate (klassi-tokenid failist, jäta interaktsiooni-gated välja); (2) full-strip → render-
  diff näitab JÄRJEPIDEVAD CHANGED = load-bearing; (3) `--keep-selectors` = load-bearing +
  katmata + box-shadow; (4) re-strip → 2-capture gate (CHANGED-lõige tühi) → GATE-2 → commit.
- **`scripts/css-important-overrides.mjs`** — kaskaadi-audit (verdikt per selektor×prop).
  Nüüd viewport-korrektne (390+1920, `--viewports`). Aeglane (brauser). Vt päist.
- **`scripts/css-snapshot.mjs` + `css-snapshot-diff.mjs`** — render-gate (golden-master).
  `--targets <fail>`, `--out`. Diff exit 0 = identne.
- `important-autostrip.mjs`, `theme-strip-keepasserted.mjs` — varasemad katsed (oracle on parem).

## 6. JÄRGMINE SAMM (sessioon 6 uuendus)

**🥇 PRIORITEET 1 — MÜRA-PÕRANDA RE-AUDIT (§4a, uus võit-allikas).** Iga fail, mis prior-
sessioon märkis "GATE-1 RED → lukus", VAJAB üle-kontrolli müra-vaba gate'iga. service-map
tõestas, et "lukus" võis olla AINULT async-müra. Kandidaadid (prior GATE-1 RED, potentsiaalselt müra):
- `policy/responsive.css` (62, 47 STRIP) — `.glass-policy-scroll` laius/kõrgus/margin.
  Gate olemas: `state/policy-responsive-gate.targets.json`. **POOLELI sessioon 6 lõpus** —
  järgmine samm: HEAD×2 diff sellel gate'il, vaata kas glass-policy-scroll on scroll-settle-müra.
  (Hoiatus: handoff väitis "kõikides teemades" mis viitaks PÄRIS-le, aga pole müra-vaba-gate'iga
  kinnitatud — tee seda.)
- `chat/shell.css` (59, 38 STRIP) — `.chat-dictate-btn`/`.chat-listen-btn` `transform: none`
  ↔ `matrix(1,0,0,1,0,0)` = IDENTITY-müra (visuaalselt identne!). Border-muutused (rgba(0,0,0,0)
  → valge) on PÄRIS. Strateegia: keep border-selektorid (send-btn, dictate-btn, listen-btn,
  invite-primary-btn, back-icon), jäta transform mürast välja → võib jääda strippe.
- chat/hc + profile/hc: re-kontrollitud sessioon 6, GATE-1 RED on PÄRIS (HC kollane äär/glow
  muutub valgeks) — needsamad EI ole müra. Lukus jääb.

**🥈 PRIORITEET 2 — raske klass (3 tüüpi):**

1. **INTERAKTSIOONI-GATED pinnad** (suurim) — modal/paneel/drawer/help-listings/invite
   selektorid renderduvad ALLES klikiga. Üks-route ega mitme-route gate ei kata neid
   (tõestatud: workspace-guide 17/29 absent isegi 6 route'iga). **Vaja FLOW-gate'i:**
   css-snapshot `steps:[{click:...}]` et paneel avada, SIIS strip+gate. Failid:
   glass-subpage (ülejäänud), workspace-guide (ülejäänud), mobile/ modal-failid.
   **FLOW-GATE INFRA VALMIS:** `css-snapshot.mjs` `steps` toetab nüüd `{eval:"<js>"}`
   (jooksutab koodi lehe-kontekstis). Drawer avaneb event'iga — flow-gate töötab:
   ```
   steps:[{waitFor:".chat-inputbar"},
          {eval:"window.dispatchEvent(new CustomEvent('sotsiaalai:toggle-conversations',{detail:{open:true}}))"},
          {waitFor:".drawer-panel--chat-glass"}]
   ```
   **chat-drawer UURITUD (16.06) — ROI MADAL, EI TASU:** flow-gate kinnitas, et drawer on
   VALDAVALT load-bearing — `.cs-delete/.cs-open` (hc-kollane border+box-shadow), `.drawer-
   close-btn--chat`, `.chat-sidebar-search-input` (border `var(--input-border)`), `.drawer-
   chat-sidebar` (defineerib `--input-border`) on KÕIK render-kandvad. Taastatav redundantne
   fraktsioon ~15/fail JA **entangled** grupeeritud/cross-file reeglitega (kitsam keep tõi
   `.chat-mic-glyph` mono regressiooni — grupeeritud `:is(.cs-X,.chat-mic-glyph)` reegel).
   **Konservatiivne drawer-keep OLI ÕIGUSTATUD.** Reverditud. Flow-gate `eval` jääb infra
   teiste pindade jaoks (help-listings/invite modal = avatav samuti event/click'iga).
2. **JS-STATE/RUNTIME-gated** — `features/service-map/desktop.css` 276 (~196 service-
   profile JS-oleku-taga + 33 Leaflet runtime, vt css-progress-log). Vajab oleku-
   trigerdust või on dünaamiline (ei strippitav lihtsalt).
3. **TOKEN-MIGRATSIOON** (struktuurne) — pinna-`!important` → `var(--token)` +
   `:root.theme-X{--token}`. Vt `css-important-reduction-method.md` + `css-progress-log.md`
   (paralleelne struktuurne rada). mobile/ 806 + ülejäänud feature-baas.

**KATVUSE-REEGEL (õpitud sel sessioonil):** ENNE feature-faili strippi kontrolli, kui
mitu selektorit gate-route'il tegelikult renderdub (skript: loe before.json, loe non-null
selektorid). Katmata selektorid = hoia konservatiivselt (`--keep-selectors`) VÕI lisa
nende route/flow gate'i. Üks-route ✓ identical tõestab AINULT covered-selektorid.

**MÜRA-REEGEL:** /vestlus + homepage gate'idel on müra-põrand (teema-batch dropout
~18 diffi, transient opacity). Päris signaal = sama selektor+väärtus JÄRJEPIDEVALT
mitmel capture'il; DISAPPEARED/APPEARED + ühe-korra-diff = müra. Tõesta keep-versioon:
capture 2× → CHANGED-lõige tühi.

## 7. INFRA (mida gate'id vajavad)
- **Dev server** port 3000 (peab jooksma). Kontroll: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` → 200.
- **Login-cookie** failis `/tmp/snapcookie` (next-auth.session-token). Snapshot/audit:
  `MSYS_NO_PATHCONV=1 SNAPSHOT_SESSION="$(cat /tmp/snapcookie)" node scripts/...`
  (cookie võib aeguda — vt server-access mälu / `scripts/tmp-create-login-token.mjs`).
- Git Bash: `MSYS_NO_PATHCONV=1` prefiks, et `/route` arg ei mangelduks.
- State-artefaktid: `reports/css-cleanup/state/` on **gitignore'is** (snapshotid, targets).
- **CRLF:** git hoiatab "LF will be replaced by CRLF" — kahjutu.

## 8. SESSIOONI COMMITID (main)
```
# sessioon 6 (16.06, Opus): müra-põranda tehnika
40a7892c service-map/desktop 118->104 (-14) — prior "fully locked" oli VALE, Leaflet/map async-müra
# Leid: GATE-1 RED ≠ alati regressioon; HEAD×2 diff paljastab müra-põranda (§4a)
# Re-rescan: chat/hc(19) chat/shell(38) profile/hc(23) STRIP — kõik GATE-1 RED päris põhjustel

# autonoomne sessioon 5 (16.06): android gate — 0 uut commiti
# platform-android.css 98 !important: gate testitud 3 keep-tasemel → täielikult lukus (kõik geomeetria)
# Docs uuendatud: HANDOFF (3642→1229) + ledger (android rida) + mälu

# autonoomne sessioon 4 (16.06): täisrescan — kõik 87 faili, 1 commit
# chat/shell.css 85→59 (-26) commit b663baa6
# profile/hc 23 STRIP GATE-2 RED (workspaceHeaderAlignment HC bundle) → reverditud
# Dok: 1306→1255 parandus + uued blokeeringu kirjeldused HANDOFF+ledger+mälu

# autonoomne sessioon 3 (16.06): kaskaad-teised-passid + uued failid
67c2799b home/themes 10->6 (-4) + profile/mono 4->2 (-2) kaskaad
f04ec4af scroll-panels kolmas pass 60->15 (-45) kaskaad jätkus
5fd1c1dc chat/mobile 33->14 (-19) kaskaad vabastas
ea5539a5 scroll-panels 71->60 (-11) kaskaad vabastas
c1f1f575 workspace-guide 37->33 (-4) + service-map/mobile 81->77 (-4)
bff0b6b6 documents/workspace 6->3 (-3)
cd03c620 profile/mono 8->4 (-4) + documents/mobile 11->9 (-2)
5fc13ff5 home/themes 15->10 (-5)
12c005df subpage-title-system 22->21 (-1)
f01575ef panel-surfaces 26->23 (-3)
5d016a69 theme/mono 26->24 (-2)
2d40fa47 home/desktop 52->49 (-3)
12546351 chat/themes 93->92 (-1)
baab6342 agent.css 20->10 (-10) + mono.css 30->20 (-10)
# autonoomne sessioon 2 (16.06): feature/shared korje + tooriista-taiendused
a7de2c74 documents/ui teine pass 37->13 (-24)
f7547ddb background-home + theme/mid (-28)
c33564a3 service-map/desktop 276->118 (-158)
0b086b37 workspace-guide 85->37 (-48)
de412c2e policy/mobile 32->15 (-17)
f67b3ffa mobile/foundations 28->11 (-17)
6f178de1 profile/mobile 74->9 (-65)
a33299ac chat/mobile 67->33 (-34) -- kaskaad vabastas uuesti edasi
ae45af23 glass-subpage 52->19 (-33)
d1f8fe36 documents/agent+ui
2225c9dc ledger + HANDOFF      7bc3861b css-snapshot {eval}
53ff7cf3 chat/hc 207->95       6af45bca chat/mono 131->89
076686ce profile/hc 40->28     1c4f6ce7 chat/mobile 169->67
d85881af chat/shell 191->127   a635603e documents/ui 110->58
043ec076 docs agent/library    a31fcd8d register 79->7
96942d2d glass-subpage 66->52
# autonoomne sessioon 1 (15.-16.06): teema-kiht
1d3fc317 mono.css 148->26      fefe80b8 mid.css 65->13
f10a6200 hc.css 328->16        29685773 policy quickstart
```

## 9. KASUTAJA EELISTUSED (sessioonist)
- Räägib eesti keeles. Tahab **tulemust + jälge**, mitte üksikuid mikro-otsuseid.
- **Ära committi punase gate'iga.** Kontrakt-testi muutmine = vajab kasutaja luba.
- Kõik `main`-il (haru ei taha). Git+GitHub = varukoopia (käsitsi-koopiat pole vaja).
- Struktuur (`app/styles/` 87 faili) on HEA, ära paiguta ümber — töö on failide SISUS.

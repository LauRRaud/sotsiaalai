# CSS `!important`-koristuse HANDOFF (uuele kontole/sessioonile)

**Miks see fail:** sessiooni-mälu on konto-lokaalne ega kandu kontovahetust üle.
See dokument elab repos → iga konto/mudel jätkab siit. Loe see + seotud dokud
ENNE tööd. Kirjutatud 2026-06-15, **uuendatud 2026-06-16 (kontovahetus). HEAD: `2225c9dc` (main).**
Tööpuu puhas (ainult `dark.css` + `documents/mono.css` CRLF-müra, `git diff --numstat` tühi — ignoreeri).

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
- **Platvorm: 3642 → 2669 `!important` (−973 kampaania jooksul).** Algus-jaotus: ledger.
- **theme/ failid KÕIK PUHTAD:** hc 16, mid 13, dark 14, light 15, night 7, mono 26.
- **feature/shared teema-laadsed STRIPITUD:** chat/hc 95, chat/mono 89, chat/shell 127,
  chat/mobile 67, profile/hc 28, documents/ui 58, documents/agent 47, documents/library 5,
  shared/register 7. (chat/themes 93 = kontrakt-lukus.)
- **🔄 KONSERVATIIVSELT osaliselt** (vajavad mitme-route/flow gate'i täisvõiduks):
  glass-subpage 52, workspace-guide 85.
- **ODAV PUHAS KORJE LÕPETATUD.** Allesjäänu (§6) on raskem klass.

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
                     Uusi kukkumisi = 0. (NB: 12 vs 13 on FLAKY test, mitte regressioon —
                     võrdle NIMESID, mitte arvu.)
5. 🟢 mõlemad → commit main + uuenda ledger.  🔴 → revert (ÄRA committi punasega).
```

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

## 6. JÄRGMINE SAMM: odav korje LÕPETATUD → raske klass (3 tüüpi)
Teema-failid + teema-laadsed feature/shared failid on harvitud (oraakel + render-gate,
§5). Platvorm 3642 → 2669. **📊 Täpne allesjäänud-failide kaart (STRIP-potentsiaal +
vajalik gate-tüüp per fail) = [important-ledger.md](important-ledger.md) §"ALLESJÄÄNUD
FAILIDE KAART".** Alusta sealt. **Allesjäänu jaguneb 3 raskemaks klassiks:**

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

## 8. SESSIOONI COMMITID (main, 18c8cf36 järel)
```
# autonoomne sessioon 2 (16.06): feature/shared korje + tooriista-taiendused
2225c9dc ledger: allesjaanud failide kaart         7bc3861b css-snapshot {eval} + drawer-uuring
7a94a42d workspace-guide 92->85 + HANDOFF konsolid  f79b077a ledger: proovitud-aga-jaetud
96942d2d glass-subpage 66->52 (konserv)            a31fcd8d register 79->7
043ec076 documents agent/library -10               a635603e documents/ui 110->58
1c4f6ce7 chat/mobile 169->67                        d85881af chat/shell 191->127 +doc-reconcile
076686ce profile/hc 40->28                          6af45bca chat/mono 131->89
53ff7cf3 chat/hc 207->95 + --keep-selectors
# autonoomne sessioon 1 (15.-16.06): teema-kiht
1d3fc317 mono.css 148->26 (-122) + grupp-restore   663893bb HANDOFF doc
2190dd07 mono STRIP 0 = repair-loop piirang        828bb330 guide-rich-text -3 !important
fefe80b8 mid.css 65->13 (-52)                       56ba160c õppetund: render-surnud≠eemaldatav (glass-ring KEEP)
f10a6200 hc.css 328->16 (-312) + oraakel-tööriist   29685773 policy quickstart surnud @media-dup
4e2a1725 teema-strip tööriist + hc-katse            e9da4f40 + 33a4dbc4 audit desktop-pimeduse parandus
ab8903fe LÄBIMURRE: teema render-redundantne        2925fc5a register + autostrip
f2857588 register: policy geomeetria KEEP
```

## 9. KASUTAJA EELISTUSED (sessioonist)
- Räägib eesti keeles. Tahab **tulemust + jälge**, mitte üksikuid mikro-otsuseid.
- **Ära committi punase gate'iga.** Kontrakt-testi muutmine = vajab kasutaja luba.
- Kõik `main`-il (haru ei taha). Git+GitHub = varukoopia (käsitsi-koopiat pole vaja).
- Struktuur (`app/styles/` 87 faili) on HEA, ära paiguta ümber — töö on failide SISUS.

# CSS `!important`-koristuse HANDOFF (uuele kontole/sessioonile)

**Miks see fail:** sessiooni-mälu on konto-lokaalne ega kandu kontovahetust üle.
See dokument elab repos → iga konto/mudel jätkab siit. Loe see + seotud dokud
ENNE tööd. Kirjutatud 2026-06-15. **HEAD selle kirjutamise hetkel: `2190dd07` (main).**

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
- **Platvorm: 3642 → 3278 `!important` (−364 sel sessioonil).** Algus-jaotus: ledger.
- theme/ failid PUHTAD: hc 16, mid 13, dark 14, light 15, night 7. **mono.css 148 = ainus väljapaistev (järgmine samm, §6).**
- Töölaud: `app/styles/theme/{dark,mono}.css` + `features/documents/mono.css` näitavad `M`,
  aga see on **ainult CRLF-müra** (`git diff --numstat` tühi) — EI ole päris muudatus, ignoreeri.

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
  interakteeruvad. **See tegi hc+mid võidu.**
  ```bash
  TESTS=$(find tests -name "*.test.js" -o -name "*.test.mjs" | tr '\n' ',' | sed 's/,$//')
  node scripts/css-cleanup/theme-strip-oracle.mjs --file app/styles/theme/mono.css --tests "$TESTS"          # dry-run
  node scripts/css-cleanup/theme-strip-oracle.mjs --apply --file app/styles/theme/mono.css --tests "$TESTS"  # rakenda
  ```
- **`scripts/css-important-overrides.mjs`** — kaskaadi-audit (verdikt per selektor×prop).
  Nüüd viewport-korrektne (390+1920, `--viewports`). Aeglane (brauser). Vt päist.
- **`scripts/css-snapshot.mjs` + `css-snapshot-diff.mjs`** — render-gate (golden-master).
  `--targets <fail>`, `--out`. Diff exit 0 = identne.
- `important-autostrip.mjs`, `theme-strip-keepasserted.mjs` — varasemad katsed (oracle on parem).

## 6. JÄRGMINE SAMM (hästi-piiritletud): mono.css 148
`theme-strip-oracle.mjs` andis mono peal **STRIP 0** — see EI ole päris-lukk, vaid
**repair-loop'i piirang**: greedy üksik-restore ei vähenda katkiste oraaklite arvu, kui
oraakel vajab MITME markeri samaaegset taastamist → safety-haru taastab kõik → STRIP 0.
**Parandus:** muuda repair-loop batch-restore'iks (taasta korraga markerite GRUPP, nt
oraakli match-regiooni kõik markerid, või binaarne taaste). Siis mono avab ~100+.
Mono testid: `tests/ui/monoThemeContracts.test.js` + `tests/ui/hcSurfaceContracts.test.js`.
**Pärast parandust: jooksuta sama 2-gate protokoll (§4) — box-shadow conservatiivselt keep.**

Edasi pärast mono: features (geomeetria-kontraktiga lukus, vt policy õppetund) +
token-migratsioon ülejäänud override-mustritele. ≪1000 = mitme-sessiooni projekt.

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

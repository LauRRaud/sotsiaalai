# Käsk Sonnetile — nuppude (ja elementide) kujunduse ühtlustamine

> Koostas Opus 2026-06-14. See on **iseseisev** brief: kogu vajalik kontekst on siin.
> Eesmärk: platvormil kasutaks **sama primitiiv sama kujundust igal pool** —
> praegu ei kasuta (mõõdetud, vt allpool). Sina teed redigeerimised.

---

## 0. TL;DR mida teha

1. Jooksuta **täis-skann** (käsk §2) → loe `consistency.md`.
2. Iga `consistency.md` lahknevuse jaoks: too primitiiv ÜHE kujundusse (§4).
3. Ära riku teemapõhist spec'i (§5).
4. Kontrolli uuesti skanniga, et lahknevus kadus.
5. Edasi: `!important`-võlg ja surnud CSS (§6) — eraldi, audit-skriptiga.

---

## 1. Tööriistad (juba olemas, Opus ehitas)

| fail | mida teeb |
|---|---|
| `scripts/css-page-report.mjs` | crawlib iga marsruut × teema HEADED brauseris, jäädvustab iga nupu-primitiivi computed + tokenid + **hover** (CDP `forcePseudoState`) + **flows** (avab portaali-modaalid/orbiidi kliki taga). Väljund: per-route `.md`, `report.json`, `dead-candidates.md`, **`consistency.md`**. |
| `scripts/browser-inspect.js` | brauseris jooksev inspektor (computed/tokenid/matched-reeglid/empiiriline surnud-klass). `css-page-report.mjs` süstib selle. |
| `scripts/css-page-report.targets.json` | mida skannida: `selectors`, `keyProps`, `tokens`, **`flows`** (interaktsiooni-sammud). |
| `scripts/css-effective-audit.routes.json` | 45 marsruuti (sh `/admin/*` — e2e-kasutajal `isAdmin=true`, valve läbib). |
| `scripts/css-important-audit.mjs` | **staatiline** (brauserita) `!important` + surnud-koodi audit. Väljund `reports/css-important-audit/<KUUPÄEV>/`: `important.md` (3769 `!important`: 1686 surface-prop + 1646 theme-override; top-failid/omadused/kategooriad), `important.json`, `orphans.md` (CSS-failid mida keegi ei impordi — 3 kandidaati). Valikuline `--effective <css-effective-audit json>` voldib sisse "selektor ei renderdu" surnud-nimekirja. |
| `scripts/css-effective-audit.mjs` | **struktuurne surnud kood**: crawlib kõik marsruudid × teemad, leiab selektorid mis EI matchi ühtegi elementi kuskil (`deadNoElement`). See on "defineeritud-aga-mitte-renderdatud" allikas. |

**`consistency.md` on peamine väljund.** See grupeerib iga selektor × teema × `data-variant` nähtavad isendid disaini-fingerprint'i järgi (tokenid + värvi-omadused, puhke- JA hover). >1 grupp = sama primitiiv maalib >1 kujundust → viga. Müra on maha surutud (variandi-teadlik grupeerimine, sRGB-värvi normaliseerimine, sub-piksli kvantiseerimine, hover-fingerprint ainult diskreetsetel signaalidel).

## 2. Kuidas skannida

**Eelistatud — PRODUCTION build** (dev renderdab BorderGlow-kanvased ebajärjekindlalt → tühje tabamusi):
```bash
npm run build
npx next start -p 3100          # eraldi port, et dev (3000) ei segaks
# uues terminalis:
node scripts/css-page-report.mjs --base-url http://localhost:3100 --out reports/css-page-report/<KUUPÄEV>
```
Dev-server (kiire, aga lihtsad lehed annavad 0 tabamust — nupu-rohked lehed OK):
```bash
node scripts/css-page-report.mjs --out reports/css-page-report/<KUUPÄEV>
```
Auth: `SNAPSHOT_SESSION` cookie või `--token`, muidu genereerib ise (`scripts/tmp-create-login-token.mjs`, e2e-kasutaja).

## 3. TUVASTATUD lahknevused (Opuse dev-jooks 2026-06-14)

**A. `/admin/rag` primary-nupud — 4 erinevat kujundust teema kohta.** `.button[data-variant="primary"]` `/admin/rag/ingest` + `/admin/rag/kov` peal renderdab 4 varianti:

| variant | nurk | ääris | taust | kus |
|---|---|---|---|---|
| A | 13px | 0.8px | puudub (lapik) | ingest, kov |
| B | 13px | 0.8px värviline | puudub | ingest, kov |
| C | 18px | õhuke | radiaal-gradient | ingest, kov |
| D | 999px (pill) | 0/2px | gradient | konto-modaal (õige app-stiil) |

→ admin "primary" nupud EI kasuta app'i pill-primary kujundust ja **ei kattu omavahel** (13 vs 18px raadius, lapik vs gradient samal lehel). See on põhivõlg. Vt täpsed väärtused: `reports/css-page-report/<KUUPÄEV>/consistency.md`.

**B. Konto-seadete modaali logout-nupud — JUBA PARANDATUD** (Opus). Portaali-modaal (`createPortal(document.body)`) lahkus `glassPrimaryButtonToneClassName` skoobist → nupud pärisid `dark.css` tugeva `inset` varju app'i pehme asemel. Parandus: lisatud `glassPrimaryButtonToneClassName` `accountModalContentClassName`-i (`components/alalehed/ProfiilBody.jsx:158`). Mõlemad logout-nupud nüüd identsed. **Ära katki tee.**

**C. Kuma-lõikamine konto-modaalis — JUBA PARANDATUD** (Opus). `accountModalActionStackClassName` (`ProfiilBody.jsx:180`) `overflow-y-auto` + `pt-0` lõikas ülemise nupu hover-glow'i (~20px ulatus). Parandus: `pt/pb` clamp (~20px). **Ära katki tee.**

**D. Orbitaalmenüü nupud (kesk `.profile-orbit-menu__center` + äär `.profile-orbit-menu__item`)** — lisatud skannerisse uue `profile-orbit-open` flow'ga (avab orbiidi). Kontrolli `consistency.md`-st kas 6 äärenuppu + hub on omavahel järjekindlad ja hover OK. (Need on BorderGlow-nupud — vt §5 efekti-spec.)

## 4. Parandus-strateegia

Põhimõte: **`data-variant="X"` peab renderdama ÜHE kujundust kõikjal.** Lokaalsed override'd (raadius/ääris/taust nupul endal) on lahknevuse allikas.

- Admin RAG nupud: otsusta disainikavatsus. Kas admin kasutab app'i pill-primary't (siis eemalda lokaalsed 13/18px + border override'd) VÕI on admin'il oma teadlik "admin-button" stiil (siis tee SEE üheks jagatud klassiks, mitte 3 juhuslikku varianti). Kõige tõenäolisem õige: üks jagatud admin-nupu primitiiv.
- Otsi override'd: `grep -rn "data-variant" components/admin` ja vaata `rounded-[13px]`/`rounded-[18px]`/`border-[0.8px]` lokaalseid klasse admin-nuppudel.
- Eelista tokeneid (`--btn-primary-*`) ja jagatud klasse lokaalsete Tailwind-override'de asemel.

## 5. PIIRANG — teemapõhine efekti-spec (ÄRA RIKU)

Kasutaja kinnitas õige disaini logout-tüüpi primary-nuppudel:
- **dark / night / mono / HC**: 2 edge-glow efekti
- **light / mid**: 3 efekti (2 edge-glow + idle vari)

Allikas: `app/styles/shared/ui-glow.css` (hover edge-glow kihid `0 0 3px/10px/20px #ff7a7e*`), idle vari `--btn-primary-shadow` (light/mid pehme). Ühtlustamisel SÄILITA see — ühtlusta kujunduse identiteet (kuju/tokenid), mitte ära kustuta efekte.

## 6. Edasised tööd (eraldi PR-id)

- **Kogu-platvormi element-skann** (mitte ainult nupud): laienda `targets.json` `selectors` paneelide/kaartide/inputite/pillide/modaalidega VÕI kasuta laiemat targets-faili. Sama `consistency.md` loogika leiab lahknevused.
- **`!important`-võlg** (JOOKSUTATUD 2026-06-14): `reports/css-important-audit/2026-06-14/important.md`. **3769** `!important` → **1686 surface-prop** (background/box-shadow/color/border/backdrop/opacity = Juur B teema-sõda) + **1646 theme-override** selektori all (`:not(.theme-)`/`:root.theme-`/`[data-contrast]`). Strateegia (`css-tailwind-cleanup-plan.md §1`): need on SÜMPTOM — kaovad kui teemastamine liigub `:root.theme-X { --token }` peale. Top-failid + "surface+theme-override sama selektor" hot-list on raportis = alusta sealt. Mõõdik: arv peab iga viiluga langema.
- **Surnud CSS**: kolm signaali, ristkasuta: (1) `css-effective-audit.mjs` `deadNoElement` = selektor ei renderdu kuskil (struktuurne); (2) `reports/css-page-report/<KUUPÄEV>/dead-candidates.md` = runtime, klassid mis ei panusta key-props'i; (3) `css-important-audit.mjs` `orphans.md` = importimata CSS-failid (3 kandidaati: `a11y.css`, `chat-focus.css`, `documents-mode.css` — KONTROLLI test-loaderit `register-node-test-loader.mjs legacyCssBundles` enne kustutust). Alati grep enne kustutamist (template-literal/leaflet/runtime-klassid).

## 7. Kontroll-loop

Iga paranduse järel: jooksuta skann uuesti samale `--out`-ile, `consistency.md` parandatud selektor peab kaduma. Negatiivne kontroll töötab (Opus tõestas: süstis algse vea allkirja → `divergences: 1`).

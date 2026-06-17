<!-- Sessioon 8 (2026-06-16). Kaustade restruktuur + !important + Tailwind-juurte plaan. -->
# CSS `app/styles` restruktuuri-plaan (sessioon 8)

**Miks repos:** sessiooni-mälu on konto-lokaalne; see plaan elab repos, et iga sessioon jätkaks.
Seotud: [css-cleanup/important-ledger.md](css-cleanup/important-ledger.md) (REGISTER + sessioon-8 leid),
[css-important-reduction-method.md](css-important-reduction-method.md) (kaskaadi-kihi reegel),
[css-button-system.md](css-button-system.md).

## 0. Lähteseis (mõõdetud 2026-06-16)

**Kaks paralleelset CSS-süsteemi ilma selge piirita:**

| Süsteem | Asukoht | Failid | `!important` |
|---|---|---:|---:|
| Globaalne kaskaad | `app/styles/**` | 87 | 1209 |
| CSS-moodulid (ko-lokeeritud) | `components/**/*.module.css` + paar `.css` | ~13 | 804 |
| **TOTAL** | | ~100 | **2013** |

Sama feature elab kahes kohas (chat = `app/styles/features/chat/*` **ja** `components/chat/*.module.css`;
profiil = `app/styles/features/profile/*` **ja** `OrbitalMenu.css`).

**Kaks `!important`-juurt** (kinnitatud kaskaadi-kihi reegliga, vt method-doc):
- **Root B — CSS-teema-sõda (2013):** kihistamata käsitsi-CSS võidab Tailwindi niikuinii → `!important`
  võitleb TEISTE teema-failide/`:global`-reeglite vastu. **EI ole Tailwindi pärast.**
- **Root A — Tailwind-sõda JSX-is (~480 `!`-modifikaatorit, 42 faili):** `!bg-…`, `!min-h-[…]` jne markup-is.
  **MITTE `.css`-failides.** Eraldi parandus (komponendi-Tailwind normaliseerimine / `@layer`).

## 1. Praeguse struktuuri probleemid

1. **Kaks süsteemi, piir puudub** — globaalne `app/styles` vs ko-lokeeritud `.module.css`. Uus töö läheb
   moodulitesse, vana elab globaalis; pole reeglit kumba kasutada.
2. **`mobile/` = eraldi override-kiht** (18 faili, 277 `!important`) — mobiili-reeglid pole feature'i juures,
   vaid omaette kaskaadi-kihina, mis võitleb desktop-reeglitega `!important`-iga.
3. **Token-failid lõhki teema-failidest** — `theme/light.css` (override'd) + `tokens/theme-light.css` (token-defid)
   on eraldi failid sama teema kohta; sama mustriga ×5 teemat. Topelt-failid, raske jälgida.
4. **Import-järjekord ebajärjekindel** — `light/mid/dark/night` imporditud vara (enne tailwind.css), `mono/hc`
   hilja (pärast `components/glass.css`). Teema-kiht peaks olema üks järjekindel blokk.
5. **`:global()` lekked moodulites** — nt `CovisionPage.module.css` 169 `!important`-ist 72 on `:global(...)`
   selektoritel → moodul taasloob globaalse kaskaadi-sõja, kaotab skoopimise eelise.

## 2. Sihtstruktuur

```
app/styles/
  tokens/          # KÕIK design-tokenid koos (merge: tokens.css + tokens/* + theme token-defid)
    base.css
    theme-{light,mid,dark,night,mono,hc}.css
  base/            # reset, layout, typography, animations, backgrounds (globaalsed element-stiilid)
  themes/          # AINULT teema-override-kihid (kahaneb, kui tokenid neelavad pinnad)
  shared/          # cross-feature primitiivid (glow, glass, register, glass-subpage)
  features/        # per-feature; mobile/ SULATATUD igasse feature'i (features/chat/mobile.css muster olemas)
  globals.css      # üks järjekindel import-järjekord: tokens → base → themes → tailwind → shared → features
  tailwind.css
```
**Süsteemi-piir (reegel edaspidiseks):** leht-/komponendi-spetsiifiline stiil → ko-lokeeritud `.module.css`
(skoobitud, EI vaja `!important`-it); globaalne (tokenid, base-reset, teema-token-defid, cross-cutting glow/glass)
→ `app/styles`. `:global()` moodulis = punane lipp (taasloob sõja) — väldi.

## 3. Faasid (igaüks gate-verifitseeritud: snapshot-diff identical + `npm test` 0 uut)

### Faas A — mehaaniline, madal risk (alusta siit)
- **A1. Token-failide ühendamine: ✅ VALMIS (sessioon 8, `dcc2aac0`).** Tehtud LOADER-OHUTUS suunas:
  `tokens/theme-X.css` token-defid liideti 1:1 → `theme/X.css` (mitte vastupidi), eraldi importid eemaldatud globals'ist,
  6 token-faili kustutatud. Order-preserving (efektiivne bait-järjekord identne) → kaskaad muutumatu. Loaderi
  `legacyCssBundles` `existsSync`-filter + hc/mono token-sisu nüüd bundle-sisenemispunktis (`theme/X.css`) → kontraktid näevad sama.
  Gate: Gate-1 ✓ identical (/registreerimine+/kasutusjuhend+/hinnastus × 6 teemat, **NB staatilised route'id** — homepage müra-põrand pettis esimest gate'i), Gate-2 ✓ 0 uut. **ÕPPETUM: homepage on müra-raske (33 müra-cell'i) — gate'i staatilistel route'idel, mitte homepage'il.**
  *(Plaan ütles algselt theme→tokens suund; loader-coupling (`register-node-test-loader.mjs` kodeerib `theme/hc.css`/`mono.css`/`tokens/theme-hc.css`/`mono` teed) tegi tokens→theme suuna ohutuks.)*
- **A2. Import-järjekorra parandus:** `globals.css` — kõik 6 teemat üas blokk, järjekindel. Gate: identical.
- **A3. `mobile/` → `features/` sulatus:** iga `mobile/X.css` reegel oma feature-kausta (`features/<f>/mobile.css`).
  Kaotab eraldi override-kihi. **NB:** osa mobile-reegleid on `@media`-vabad globaalsed — need lähevad
  `base/`-i või feature'i. Gate per fail: snapshot identical (390+1920) + npm test.

### Faas B — ko-lokeeritud audit (kampaania pime nurk)
- **B1. Auditeeri 804 ko-lokeeritut** sama meetodiga (`css-important-overrides.mjs` + snapshot-gate).
  Eelda kaht alamhulka: (a) skoobitud-lokaalsed `!important` = tõen. cargo-cult (skoop välistab sõja) → drop;
  (b) `:global()` override'd (CovisionPage 72 jt) = load-bearing-laadne kaskaad → sama kui app/styles põhi.
- **B2. `:global()` → lokaalne skoop** kus võimalik (eemaldab `!important` vajaduse struktuurselt).

### Faas C — struktuurne lõppmäng (suurim väärtus, suurim töö)
- Migreeri globaalne feature-CSS → ko-lokeeritud `.module.css` (skoobitud). Kaskaadi-sõjad kaovad
  struktuurselt → `!important` langeb kõrvalsaadusena. Kood juba liigub sinna (Covision/Workspace/Wellbeing/rails).
- **Glow/transitsiooni-kihid jäävad** (load-bearing, vt ui-glow audit ledgeris) — neid ei "parandata".

### Paralleelne rada — Root A (Tailwind-sõda JSX-is)
- ~480 Tailwind-`!` modifikaatorit. Eraldi probleem: kas `@layer` komponentidele või Tailwind-utiliidi
  spetsiifikatsuse fix. EI sega Root B-d. Madal prioriteet kuni Root B struktuur paigas.

## 4. Reeglid (samad mis kogu kampaania)
1. Üks viil = üks commit. Snapshot-värav (computed identical, 390+1920 × 6 teemat) + `npm test` (0 uut) ENNE commiti.
2. Ära committi punase gate-2-ga. LF mitte CRLF. ÄRA puutu committimata `lib/rag/*`. Co-Authored-By rida.
3. Render-surnud ≠ eemaldatav, kui kontrakt-test valvab.

## 5. Soovitatud järjekord
**A1 → A2 → A3** (mehaaniline, kaotab token-lõhe + mobile-override-kihi, kohe nähtav struktuuri-võit) →
**B1** (ko-lokeeritud audit, pime nurk, tõen. kõrgem puhas-saak kui app/styles põhi) → **C** (struktuurne, sihilik).

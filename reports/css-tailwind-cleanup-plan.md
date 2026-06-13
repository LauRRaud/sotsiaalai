# SotsiaalAI — CSS & Tailwindi korrastuse master-plaan

Kuupäev: 13.06.2026. See on **koondav sisenemispunkt** kogu allesjäänud CSS/Tailwind-võla korrastusele. Detailid mujal:
- `reports/css-struktuuriplaan-2026-06-11.md` §9 — võla juured + mõõdetud andmed.
- `reports/css-cleanup-runbook.md` — samm-sammuline snapshot-väravaga töövoog (ka odavale mudelile).
- Mälu: `css-debt-roadmap.md`, `css-restructure-progress.md`.

Struktuurne restruktuur (vertikaalid, shared/, feature-failid, rail-dedup, orbiit) on **valmis**. See plaan katab allesjäänud **kvaliteedivõla**.

---

## 1. Probleem: 2 juurt, 5 sümptomit (mõõdetud)

Mõõdik: **4637 `!important`** CSS-is, **1360 Tailwindi `!`-modifikaatorit** JSX-is, **2/93** CSS-faili kasutab `@layer`.

**Juur A — kaks stiilisüsteemi ilma kihihierarhiata.** Tailwind v4 utiliidid on `@layer utilities` sees; 91/93 käsitsi-CSS-faili on **kihistamata** → võidavad Tailwindi vaikimisi (kihistamata > kihistatud). Seetõttu 1360 Tailwindi `!` (sunnivad Tailwindi võitma). CSS-`!important` enamjaolt EI võitle Tailwindiga.

**Juur B — override-põhine teemamine.** `:not(.theme-X)`-ahelad (vaiketeema "dark jama") + ~1680 `!important` pinna-omadustel (background/box-shadow/color/border/backdrop-filter) + värvi-dubleerimine = **sama probleem**. Teemamine on suuresti juba `var()`-põhine; võlg on `:not()`-ahela STRUKTUUR + pinna-`!important`.

**Sümptom-erijuht — nupud.** Üks loogiline nupp (nt "saada kutse" / `.invite-refresh-btn`) on stiilitud ~20 scattered reegliga (mono/hc/chat/register/dark failides); osa on surnud (täielikult üle kirjutatud), osa legitiimsed teema-override'id, mis peaksid elama komponendis. Kanoonilised nupu-komponendid ON OLEMAS (`components/ui/Button.jsx`, `BackButton`, `CloseButton`, `IconButton`). Lõppseis: nupu disain = komponent + variandid + teema-tokenid; null scattered nupu-CSS.

---

## 2. Skaleeruv arhitektuur: 3 kihti

Mitte per-element käsitsi-skript (ei skaleeru tuhandetele elementidele). Kolm üldist kihti:

| Kiht | Eesmärk | Mehhanism | Tööriist |
|---|---|---|---|
| **Jõua olekuni** | hover/focus/active + avatud modaalid | `CSS.forcePseudoState` (hover/focus/active üle KÕIGI elementide, ilma füüsilise hoverita); füüsiline `click` AINULT DOM-i mountimiseks (käputäis stsenaariume) | css-matched-rules / css-snapshot |
| **Leia surnud/scattered reeglid** | "1 element, N kujundust" | CDP `getMatchedStylesForNode` → kõik sobivad reeglid + mitmes olekus kehtib (`[N/6 states]`) | `scripts/css-matched-rules.mjs` |
| **Verifitseeri ohutus** | null visuaalne regressioon | arvutatud-stiili snapshot enne/pärast → diff | `scripts/css-snapshot.mjs` + `css-snapshot-diff.mjs` |

**Miks see töötab:** verifikatsioon on **objektiivne arvutatud-stiili diff**, mitte silmaga vaatamine (kontraktitestid EI püüa visuaalseid regressioone). Seetõttu saab **odavam mudel (Sonnet 4.6)** etappe ohutult ajada — diff on värav.

---

## 3. Tööriistad (valmis, serveris)

- **`scripts/css-snapshot.mjs`** — Playwright golden-master: `getComputedStyle` × 6 teemat × vaateavad (vaikimisi 1920 Full HD + 390 mobiil, straddle'ivad 640/768) → JSON. Teema läbi rakenduse PÄRIS mehhanismi (localStorage + reload) → püüab ka JS-prop-teemamise (nt rail-ikoonide `isLightTheme`). `steps` (hover/click/focus/fill) tingimuslike olekute jaoks. Liikumise-külmutus (transition:none) → deterministlik hover-lõppolek. Helded-aga-lõplikud timeout'id (surnud server annab vea, ei ripu). `--keep-open` jätab akna sulle.
- **`scripts/css-snapshot-diff.mjs`** — before/after diff; `✓ identical` = ohutu, erinevus = vaata üle.
- **`scripts/css-matched-rules.mjs`** — CDP matched-rules inventuur: per selektor kõik sobivad reeglid + `[N/6 states]` + deklaratsioonid + (kompileeritud) asukoht. Leiab "nupu 10 kujundust" ja eristab teema-tingimuslikke (`[1/6]`) tingimusteta (`[6/6]`) reeglitest.

Auth: testkonto token (`tmp-create-login-token.mjs`) või `SNAPSHOT_SESSION` cookie. NB Git Bash: `MSYS_NO_PATHCONV=1` `/route` argumendi jaoks.

---

## 4. Faasid (järjekord + risk)

1. **Surnud kood (madal risk, alusta siit).** css:audit notSeen + `knip` (surnud komponendid → surnud Tailwind) + orvuks CSS-failid + no-op'iks ülekirjutatud reeglid (matched-rules `[N/6]` + CDP). Iga kandidaat: repo-grep + snapshot-värav enne kustutust. Vt runbook "Dead-code removal".
2. **Nupu-konsolideerimine (keskmine risk).** Per nupu-klass: matched-rules → näe kõik kujundused → vii disain `<Button>` variandiks + teema-tokeniks → nupp kasutab komponenti → eemalda scattered CSS. Snapshot-väravaga (sh hover-olek).
3. **Kihi-arhitektuur (kõrge risk, globaalne).** Käsitsi-CSS `@layer`-isse `utilities` järel → prioriteet tahtlikuks → avab `!important`/`!` eemaldamise. Pilootida ühel komponendil; verifitseerida lai snapshot üle lehtede/teemade.
4. **Teemade muutujastamine (kõrge risk).** `:not()`-ahelad + pinna-`!important` → `var()` + `:root.theme-X`. Feature-kaupa, iga teema × feature snapshot-diff.
5. **styles/ failide ümberjaotus (kosmeetiline, igal ajal).**

---

## 5. Töövoog (iga etapp) — vt runbook detailid
1. Vali siht (stabiilsed selektorid). 2. Baseline snapshot. 3. Muuda. 4. After snapshot. 5. Diff → `✓ identical` = commit; erinevus = vaata üle. 6. `npm test` (12 baseline-kukkumist + 2 RAG-WIP — null UUT). 7. jscpd ei tõuse. 8. LF (mitte CRLF; ära kasuta PowerShell Set-Content't CSS-il). 9. Üks etapp = üks commit.

---

## 6. Hard rules
- Ära tee "suurt pauku" — üks etapp korraga, snapshot-väravaga.
- Ära puuduta committimata `lib/rag/*` ega muud mitte-CSS WIP-i (teise konto pooleli töö; `graphRetrieval.js` lõhub 2 testi).
- Ära kustuta `safety_snapshots/` (tahtlik git-trackimata varukoopia).
- Surnud kood: staatiline tuvastus = kandidaadid; kontrolli grep + snapshot enne kustutust (harva-oleku klass ei pruugi snapshot'is ilmuda).

---

## 7. Mudeli-soovitus
- **Kõrge risk (kiht 3–4, juur A/B):** Opus 4.8 + high reasoning.
- **Snapshot-väravaga mehaanika (kiht 1–2, surnud kood, nupu-konsolideerimine):** Sonnet 4.6 runbook'i järgi — diff on objektiivne värav.
- **Kosmeetiline (faas 5):** ükskõik.

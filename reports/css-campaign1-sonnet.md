# Kampaania 1 — Sonnet 4.6 execution-checklist (teema-override kiht)

**Kellele:** Sonnet 4.6 (high). **Miks see sobib Sonnetile:** safe-loop värav on
**objektiivne** — kui muudatus rikub midagi, golden-master diff püüab selle (🔴 → revert).
Korrektsus ei sõltu mudeli teravusest, vaid väravast. Sina teed mehaanilise töö; värav valvab.

**Loe enne:** [css-styles-cleanup-strategy.md](css-styles-cleanup-strategy.md) (strateegia),
`scripts/css-cleanup/README.md` (tööriist). **Vundament on valmis ja tõestatud.**

## KAKS RAUDSET REEGLIT (riku → vale tulemus)
1. **Commit AINULT rohelisel väraval** (🟢 identical). Punane → loe diff, paranda või jäta
   see `!important` alles. Mitte kunagi committi punasega.
2. **Verify STAATILISTEL route'idel** (`reports/css-cleanup/static-routes.json`).
   Stateful lehed (/vestlus,/teekond,/rooms) annavad valemüra — need on juba välja jäetud.

## EELDUSED
- Dev/prod server `:3000` jookseb.
- `SNAPSHOT_SESSION` cookie käes (küsi kasutajalt; vt [[sotsiaalai-server-access]]).
- Värav-tööriistad commit'itud ja töökorras (targets-from-css, run.mjs, snapshot, diff).

## FAILIDE JÄRJEKORD (teema kaupa)
Iga "pass" = globaalne teemafail + selle teema feature-failid. Tee ühe faili korraga.

| Pass | Failid |
|---|---|
| ~~HC~~ | `theme/hc.css` + `chat/hc.css` + `profile/hc.css` — **OPUSE referents, vt allpool** |
| **mono** | `theme/mono.css` → `chat/mono.css` → `documents/mono.css` → `profile/mono.css` |
| **mid** | `theme/mid.css` |
| **dark** | `theme/dark.css` |
| **light** | `theme/light.css` |
| **night** | `theme/night.css` |
| **multi** | `chat/themes.css`, `home/themes.css` |

## PER-FAIL CHECKLIST (korda iga faili kohta)

```bash
F=app/styles/theme/mono.css           # ← muuda see iga faili kohta
THEME=mono                            # ← selle faili teema (hc/mono/mid/dark/light/night)
KEY=$(basename "$F")

# 1) Genereeri faili-skoobiga targetid (staatilised route'id, teema + light kontroll)
node scripts/css-cleanup/targets-from-css.mjs --css "$F" --themes $THEME,light \
  --routes reports/css-cleanup/static-routes.json \
  --out reports/css-cleanup/state/$KEY.targets.json

# 2) Baseline ENNE muudatust
SNAPSHOT_SESSION='<cookie>' node scripts/css-cleanup/run.mjs before \
  --file "$F" --targets reports/css-cleanup/state/$KEY.targets.json

# 3) TEE MUUDATUS failis (vt "muudatuse muster" allpool)

# 4) Verify
SNAPSHOT_SESSION='<cookie>' node scripts/css-cleanup/run.mjs verify --file "$F" --no-tests

# 5) 🟢 → git add "$F" && commit  ·  🔴 → triage (allpool), paranda, korda 4
```

## MUUDATUSE MUSTER (mida failis teha)
1. **Tokeniseeri hardcoded värvid.** Nt HC-failides `rgba(255, 234, 0, X)` →
   `rgba(var(--hc-accent-rgb), X)`. Iga teema oma aktsendiga — defineeri kanali-token
   ÜKS kord teema-juurel (`html[data-contrast="hc"]` / `:root.theme-mono` jne), siis kasuta.
2. **Eemalda liigne `!important`** — proovi kaupa, värav ütleb kas vajalik.
3. **Koonda** identsete deklaratsioonidega reeglid `A, B { x }`-iks ja lihtsusta
   mega-`:not()`-ahelaid (selektori-list säilitab spetsiifilisuse → ekvivalentne).

**Tee ÜKS muudatuse-tüüp korraga ja verify** (nt esmalt ainult tokeniseerimine → verify →
commit; siis !important-eemaldus → verify → commit). Väiksem samm = lihtsam triage.

## DIFFI TRIAGE (kui 🔴)
- **CHANGED, su muudatusega seotud property** = reaalne mitte-ekvivalentsus. Su muudatus
  polnud value-preserving → paranda (nt see `!important` oli vajalik — pane tagasi).
  Värvi-serialiseerimine on juba kanoniseeritud → kollase tokeniseerimisel CHANGED-värvi
  ei tohiks tekkida; kui tekib, on su token vale.
- **CHANGED, su muudatusega MITTE-seotud property** (nt `opacity`, disabled-nupu värv, kui
  sa muutsid ainult aktsentvärve) = **mittedeterministlik render-olek, MITTE su süü.**
  Otsustav test: **kahesuunaline flip** — kui sama property flipib ühes cellis `1→0.6` ja
  teises `0.6→1`, on tegu nupu disabled/enabled-olekuga (async-data form/admin-lehel), mis
  capture'ite vahel erines. Reaalne regressioon oleks ühesuunaline ja järjekindel. Ignoreeri.
  (HC-passis: 32 sellist CHANGED-i, kõik opacity/disabled-värv, kõik benign.)
- **DISAPPEARED/APPEARED** = element puudub/lisandus. Tavaliselt **stateful-leht** →
  lisa see route `static-routes`-ist välja (exclude) ja re-baseline. Mitte su süü.

> **Kiire kontroll, kui kahtled:** `git diff <fail> | grep -E '^[+-]' | grep -v <oma-muster>`
> — kui väljund on tühi, puudutas su muudatus AINULT oodatud mustrit, seega iga muu
> property CHANGED on definitsiooni järgi render-olek, mitte sinu töö.

## MILLAL ESCALEERIDA OPUSELE
- Fail, kus pärast ausat tokeniseerimist jääb palju CHANGED, mida ei oska seletada.
- Mega-`:not()`-ahel, mille koondamine läheb korduvalt punaseks.
- Kahtlus a11y-kontrastis (kuigi värav katab kontrastvärvid — kui roheline, a11y säilis).

## HC REFERENTS-NÄIDE (Opuse tehtud šabloon — kopeeri muster)
`theme/hc.css`: lisatud `--hc-accent-rgb: 255, 234, 0` juurele, 204× hardcoded
`rgba(255, 234, 0, X)` → `rgba(var(--hc-accent-rgb), X)`. Verifitseeritud staatiliste
route'ide diffiga (hc+light): 0 kollase-värvi muutust, 57 allesjäänud diffi kõik
tokeniseerimisest sõltumatud (vt triage — opacity-flip + dünaamiline sisu).
**Commit:** `e369e995` (tokeniseerimine) + `f10a11d5` (diff whitespace-fix, eeldus).

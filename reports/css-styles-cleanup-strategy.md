# app/styles/ korrastuse strateegia (safe-loop põhine)

**Loodud:** 2026-06-15. **Tööriist:** `scripts/css-cleanup/` ([[README]](../scripts/css-cleanup/README.md)).
**Miks repos:** sessiooni-mälu on konto-lokaalne; see plaan elab repos, et iga sessioon jätkaks. Vt ka [css-progress-log.md](css-progress-log.md).

## Eesmärk
Vähendada CSS-võlga (`!important`, hardcoded väärtused, mega-`:not()`-ahelad) **objektiivselt
turvaliselt** — iga muudatus tõestatud golden-master diffiga (computed-style ei muutu).
Praegu: ~3649 `!important`.

## Võla jaotus (mõõdetud 2026-06-15)
| Kaust | !important | Iseloom |
|---|---|---|
| `features/` | 1777 | chat, service-map, documents, profile, home, policy (sh teema-failid) |
| `mobile/` | 806 | platvormi/touch struktuur |
| `theme/` | 577 | hc(328), mono(148), mid, dark, light, night |
| `shared/` | 384 | ui-glow jne |
| `components/` + `base/` | 104 | väike |

`theme/*.css` üksi = 577. Põhivõlg (1777) on `features/`-is, AGA suur osa sellest on
**samuti teema-override** (feature'idel omad teemafailid: chat/hc.css 207, chat/mono.css 131,
profile/hc.css, documents/mono.css, home/themes.css…).

## Strateegia: kaks kampaaniat

### KAMPAANIA 1 — teema-override KIHT (tee esimesena)
Horisontaalne override-kiht: `theme/*.css` **+** `features/*/{hc,mono,themes}.css`.
**Miks esimesena:** ühtlane muster, teema-skoobitud (kiire verify), ründab otse
"override-teemamise" juurt. Muudatuse muster failis:
1. **Tokeniseeri** hardcoded väärtused (nt hc.css 204× `rgba(255,234,0,X)` → `rgba(var(--hc-accent-rgb),X)`)
2. **Eemalda liigne `!important`** (kus kaskaad ei vaja — golden-master tõestab)
3. **Koonda mega-`:not()`-ahelad** ja identsete deklaratsioonidega reeglid

**"Teema pass" = globaalne teemafail + selle teema feature-failid koos:**

| Pass | Failid | Järjekord |
|---|---|---|
| **HC** | `theme/hc.css` + `features/chat/hc.css` + `features/profile/hc.css` | 1 (loop tõestatud) |
| **mono** | `theme/mono.css` + `features/chat/mono.css` + `features/documents/mono.css` + `features/profile/mono.css` | 2 (suurim järgmine) |
| **mid** | `theme/mid.css` | 3 |
| **dark** | `theme/dark.css` | 4 |
| **light** | `theme/light.css` (5K, kiire) | 5 |
| **night** | `theme/night.css` (2.4K, kiire) | 6 |
| **multi-teema** | `features/chat/themes.css`, `features/home/themes.css` | 7 |

### KAMPAANIA 2 — struktuur/feature kiht (järgmine)
`service-map/desktop.css` (276), `chat/shell.css` (191), `chat/mobile.css` (169),
`documents/*`, `mobile/*`, `shared/ui-glow.css`. Need on **struktuursed**
(layout/width/position `!important`), mitte tokeniseeritavad → vaja page-spetsiifilist
verify't, raskem. Tee pärast teema-kihti.

## KUIDAS TEHA — safe-loop retsept (üks fail korraga)

**Eeldused:** dev/prod server `:3000`, auth `SNAPSHOT_SESSION` cookie (vt
[[sotsiaalai-server-access]] + `scripts/css-snapshot.mjs` päis).

```bash
# 1) Genereeri faili-skoobiga targetid. --themes = see teema + üks kontroll (leket püüdma).
#    --routes: kasuta STAATILISI route'e (vt allpool — stateful lehed annavad valemüra).
node scripts/css-cleanup/targets-from-css.mjs \
  --css app/styles/theme/mono.css --themes mono,light \
  --routes reports/css-cleanup/static-routes.json \
  --out reports/css-cleanup/state/mono.css.targets.json

# 2) Baseline ENNE muudatust (headed, faithful — auto)
SNAPSHOT_SESSION='<cookie>' node scripts/css-cleanup/run.mjs before \
  --file app/styles/theme/mono.css --targets reports/css-cleanup/state/mono.css.targets.json

# 3) Tee muudatus (tokeniseeri / eemalda !important / koonda ahelad)

# 4) Verify (gate1 diff + gate2 testid; --no-tests kiireks iteratsiooniks)
SNAPSHOT_SESSION='<cookie>' node scripts/css-cleanup/run.mjs verify \
  --file app/styles/theme/mono.css

# 5) 🟢 roheline → commit · 🔴 punane → loe diff:
#      CHANGED = reaalne väärtuse muutus (paranda või ära tee)
#      DISAPPEARED/APPEARED = element puudub/lisandus (tihti stateful-leht → exclude route)
```

## KAKS RAUDSET REEGLIT (õpitud empiiriliselt, ära unusta)
1. **Verify STAATILISTEL lehtedel.** Stateful lehtede (`/vestlus`, `/teekond`, `/rooms`)
   DOM erineb laadimiste vahel (glass-ring paneel, hover-olek) → valemüra. Jäta need
   `--routes` nimekirjast välja; laienda exclude-listi kui leiad uut müra.
2. **Värvi-kanoniseerimine on hädavajalik** (juba sees `css-snapshot-diff.mjs`-is).
   Literaal `rgba()` → hex `#ffea00a8`, aga `rgba(var())` jääb rgba — sama värv, erinev
   string. Ilma selleta ei läheks tokeniseerimine KUNAGI roheliseks. (Tehtud.)

## Tööriista olek (valmis, tõestatud 2026-06-15)
- `targets-from-css.mjs` — faili-skoobiga katvus (selektorid + omadused failist)
- `run.mjs` — orkestraator (before/verify, auto-revert)
- `css-snapshot.mjs` — **ALATI headed + a11y_prefs küpsis** (teemad faithful) + `--all` + resilientne
- `css-snapshot-diff.mjs` — värav: ignoreerib läbipaistvaid varje + kanoniseerib värvid
- 4 reaalset viga leitud+parandatud kasutuses (vt progress-log).

## Katvuse tasandid
- **Tier 1** (kohe): route-kättesaadavad selektorid. hc.css baseline kattis 115/187.
- **Tier 2** (hiljem): modal/overlay-gated selektorid (72 hc.css'is — a11y-modal,
  account-settings, chat-analysis-overlay jne). Vajavad `flow`-samme (klikk avab modaali),
  et jäädvustada. Lisa `targets`-faili `steps` (vt `css-page-report.targets.json` flows näide).

## Lõikepunkt / lõppseis
Kampaania 1 lõpuks: teema-override kiht tokeniseeritud + minimaalse `!important`-iga,
iga muudatus golden-master-tõestatud. See lahendab "override-teemamise" juure
([[css-debt-roadmap]]). Kampaania 2 ründab struktuurset/Tailwind juurt.

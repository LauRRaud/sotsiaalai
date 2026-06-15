# `!important` vähendamise REGISTER (jälg: mis tehtud / mis jäänud)

**Miks:** et üheski sessioonis/kontol ei tekiks segadust, mis on tehtud ja mis tegemata.
See fail elab repos (kandub kontovahetust üle). Uuenda iga partii järel.
Meetod + reeglid: [css-important-reduction-method.md](../css-important-reduction-method.md).

## Lähteseis (staatiline, 2026-06-15)

Kokku **3642** `!important` 87 autori-CSS-failis. Jaotus arhitektuuri-rühmade kaupa:

| Rühm | `!important` | % | Iseloom |
|---|---:|---:|---|
| `mobile/` | 806 | 22% | mobiili-kaskaadi override'id |
| `features/chat` | 794 | 22% | suurim üksik-feature |
| `features/` (muu) | 619 | 17% | documents, profile, home, policy, … |
| `theme/` (teema-override) | 577 | 16% | **token-migratsiooni siht** (hc 328, mono 148, mid 65) |
| `shared/` | 384 | 11% | ui-glow, workspace-guide, register, glass-subpage |
| `features/service-map` | 357 | 10% | service-map/desktop 276 + mobile 81 |
| `components/` + `utilities/` | 72 | 2% | |
| `base/` + `tokens/` | 33 | 1% | |

## Edenemine feature/faili kaupa

Legend: ✅ tehtud · 🔄 pooleli · ⬜ tegemata · 🔒 alles-jäetud (load-bearing/kontrakt)

| Sihtala | Algus | Stripitud | Surnud-välja | Alles (+miks) | Praegu | Staatus | Commit |
|---|---:|---:|---:|---|---:|---|---|
| `features/policy` tekstiklaster | — | 7 | 1 reegel | — | — | ✅ | 828bb330, 29685773 |
| `features/policy` geomeetria | ~133 | 0 | 0 | 🔒 render-kandev (strip-all diff: height/margin/padding liiguvad) JA kontrakt-lukus (policyScrollHeader + scrollSurfaceHeader, ~29 assert'i) | ~133 | 🔒 | strip-all reverditud |
| `utilities/glass-ring-stable` | 1 | 0 | 0 | 🔒 Reegel A — kontrakt-test valvab | 1 | 🔒 | 56ba160c (KEEP) |
| `theme/` (hc/mono/mid) | 577 | 0 | 0 | token-migratsiooni siht | 577 | ⬜ | — |
| `features/chat` | 794 | 0 | 0 | — | 794 | ⬜ | — |
| `features/service-map` | 357 | 0 | 0 | — | 357 | ⬜ | — |
| `mobile/` | 806 | 0 | 0 | — | 806 | ⬜ | — |
| `shared/` | 384 | 0 | 0 | — | 384 | ⬜ | — |

## Strateegiline leid (2026-06-15, policy strip-all eksperimendist)

**Kiire masin = strip-all → üks gate → diff klassifitseerib KÕIK korraga.** Baseline +
strip kõik failist + after + npm test (~10 min, mitte 588-nav audit). Diff nimetab
TÄPSELT mis computed-väärtus liikus = render-kandev. Test-fail-count = kontrakt-lukus.
See on edaspidine loop (mitte per-selektor audit).

**Aus reaalsus 3642 kohta:** suur osa `!important`-st on **load-bearing**, mitte vaba:
- **Geomeetria-kontrakt-süsteem** (policy/documents/workspace kerimis-ringid) — render-
  kandev JA source-teksti kontrakt-testidega lukus. policy 133/140 oli seda. Documents,
  service-map tõenäoliselt sarnased.
- **Teema-override** (theme/ 577) — vajab **token-migratsiooni** (struktuurne), ei
  saa lihtsalt strippida.
- **Glow/glass** (shared/ui-glow 118) — kaitstud (canonical-button-look).

**Järeldus:** marker-strip (autostrip) korjab ainult VABA fraktsiooni (policy-s ~11/144 = 8%).
≪1000 jõudmiseks on **token-migratsioon kohustuslik** (theme/ 577 + override-mustriga
feature-reeglid), MITTE ainult märksõna-eemaldus. Strip-all-masin on hea VABA fraktsiooni
kiireks korjeks + load-bearing kaardistuseks per feature.

## Tööriistad

- **Audit (valija):** `scripts/css-important-overrides.mjs` — verdikt per (selektor, prop),
  nüüd viewport-korrektne (390+1920). REDUNDANT/WINS-BY-SPEC = auto-strippitav.
- **Auto-strip:** `scripts/css-cleanup/important-autostrip.mjs` — audit valib → strip
  märksõna autori-failist → (väline gate kinnitab). Konservatiivne: ainult ühene
  tekstivaste; mitmene/kahtlane → skip + logi.
- **Gate (kohtunik):** `scripts/css-snapshot.mjs` + `css-snapshot-diff.mjs` (computed
  identne, 390+1920 × 6 teemat) + `npm test` (kontraktid). 🟢 commit · 🔴 revert.

## Reeglid (et jälg jääks ausaks)
1. Iga partii = audit → strip → **mõlemad gate'id** → commit VÕI revert. Ära committi punasega.
2. Uuenda seda registrit **iga commiti järel** (rida + commit-hash).
3. Render-surnud ≠ eemaldatav, kui kontrakt valvab (vt glass-ring 🔒).
4. Responsiivne baas+@media paar: baas EI ole surnud (viewport-korrektne audit kohustuslik).

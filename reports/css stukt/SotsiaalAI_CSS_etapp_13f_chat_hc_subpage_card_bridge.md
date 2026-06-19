# SotsiaalAI CSS – etapp 13f

## Fookus

Etapp 13f korrastab `features/chat/hc.css` failis olevad `--subpage-card-*` tokenid sama bridge-mudeli järgi, mida kasutati dokumentide vaadetes etappides 13d ja 13e.

Eesmärk oli vähendada `subpage-card` tokenipere otsest feature-võlga ilma visuaalseid väärtusi muutmata.

---

## Tehtud muudatus

Failis `app/styles/features/chat/hc.css` asendati chat high-contrast kontekstis otse defineeritud väärtused:

```css
--subpage-card-bg: rgba(14, 20, 32, 0.98);
--subpage-card-bg-hover: rgba(14, 20, 32, 0.98);
--subpage-card-border: rgba(var(--hc-accent-rgb), 0.56);
--subpage-card-border-hover: rgba(var(--hc-accent-rgb), 0.9);
--subpage-card-shadow: none;
--subpage-card-shadow-hover: none;
```

bridge-mudeliga:

```css
--chat-subpage-card-bg: rgba(14, 20, 32, 0.98);
--chat-subpage-card-bg-hover: rgba(14, 20, 32, 0.98);
--chat-subpage-card-border: rgba(var(--hc-accent-rgb), 0.56);
--chat-subpage-card-border-hover: rgba(var(--hc-accent-rgb), 0.9);
--chat-subpage-card-shadow: none;
--chat-subpage-card-shadow-hover: none;

--subpage-card-bg: var(--chat-subpage-card-bg);
--subpage-card-bg-hover: var(--chat-subpage-card-bg-hover);
--subpage-card-border: var(--chat-subpage-card-border);
--subpage-card-border-hover: var(--chat-subpage-card-border-hover);
--subpage-card-shadow: var(--chat-subpage-card-shadow);
--subpage-card-shadow-hover: var(--chat-subpage-card-shadow-hover);
```

Visuaalne väärtus jäi samaks. Muutus ainult tokeni omand: chat feature’i päris väärtus on nüüd `--chat-subpage-card-*` alias-tokenis ja `--subpage-card-*` toimib bridge-tokenina.

---

## Dokumentatsioon

`app/styles/TOKENS.md` sai täienduse, et aktsepteeritud feature-alias näidete hulgas on nüüd:

- `--documents-subpage-card-*`
- `--chat-subpage-card-*`

---

## Mõju tokeniauditile

| Mõõdik | Enne 13f | Pärast 13f |
|---|---:|---:|
| `subpage-card` definitsioonid kokku | 141 | 141 |
| `feature-direct-definition` | 8 | **2** |
| `feature-bridge` | 15 | **21** |
| `other` | 0 | 0 |
| `chat/hc.css` direct `--subpage-card-*` definitsioonid | 6 | **0** |
| `chat/hc.css` bridge `--subpage-card-*` definitsioonid | 0 | **6** |

Allesjäänud kaks `feature-direct-definition` kirjet on nüüd ainult:

- `app/styles/features/service-map/desktop/base.css` — `--subpage-card-bg`
- `app/styles/features/service-map/desktop/base.css` — `--subpage-card-bg-hover`

Need kuuluvad järgmisesse etappi 13g.

---

## Üldine tokeniauditi seis pärast 13f

| Mõõdik | Väärtus |
|---|---:|
| CSS-faile | 156 |
| Tokenite arv | 1125 |
| Tokenidefinitsioone | 4245 |
| `var(...)` kasutusi | 5935 |
| Mitme väärtusega tokenikonflikte | 620 |
| Defineerimata kasutusi | 95 |
| Defineeritud, aga kasutamata tokeneid | 259 |

Märkus: tokenite arv, definitsioonide arv ja kasutuste arv kasvavad, sest otsesed väärtused asendatakse feature-alias tokenitega. See on teadlik hind selgema omandimudeli eest.

---

## Staatiline kontroll

```text
git apply --check: OK
Missing local CSS imports: 0
CSS import cycles: 0
CSS brace-balance errors: 0
Bad use client directive files: 0
Project CSS !important count: 2025
Subpage-card feature direct definitions: 2
Subpage-card feature bridge definitions: 21
Chat hc direct --subpage-card definitions: 0
Chat hc bridge --subpage-card definitions: 6
```

---

## Rakendamine

Rakendada pärast patch’i 23:

```bash
git apply --check sotsiaalai-css-cleanup-24-chat-hc-subpage-card-bridge.patch
git apply sotsiaalai-css-cleanup-24-chat-hc-subpage-card-bridge.patch

npm run css:tokens
npm run css:tokens:check
```

---

## Järgmine samm

Järgmine etapp on **13g: service-map `desktop/base.css` subpage-card bridge**, mis peaks viima `feature-direct-definition` arvu 2-lt 0-ni.

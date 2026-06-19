# SotsiaalAI CSS – etapp 13e: documents/ui.css ja documents/mono.css subpage-card bridge

## Eesmärk

Etapi 13e eesmärk oli jätkata `--subpage-card-*` tokenipere korrastamist dokumentide feature’is.

Eelmises etapis 13d viidi `documents/workspace.css` otseväärtused `--documents-subpage-card-*` alias-tokenite alla ja `--subpage-card-*` jäeti bridge-kihiks. Etapis 13e rakendati sama mudel kahe järgmise dokumendikihi suhtes:

- `app/styles/features/documents/ui.css`
- `app/styles/features/documents/mono.css`

Visuaalseid väärtusi ei muudetud. Muutus on tokeni omandis: feature’i tegelik väärtus on nüüd `--documents-subpage-card-*`, mitte otse üldises `--subpage-card-*` tokenis.

---

## Muudatused

### 1. `documents/mono.css`

Mono-teema dokumentide workspace ei defineeri enam subpage-card väärtusi otse kujul:

```css
--subpage-card-bg: var(--documents-card-bg);
--subpage-card-border: var(--documents-card-border);
--subpage-card-shadow: var(--glass-shell-shadow);
```

Nüüd kasutatakse bridge-mudelit:

```css
--documents-subpage-card-bg: var(--documents-card-bg);
--documents-subpage-card-border: var(--documents-card-border);
--documents-subpage-card-shadow: var(--glass-shell-shadow);

--subpage-card-bg: var(--documents-subpage-card-bg);
--subpage-card-border: var(--documents-subpage-card-border);
--subpage-card-shadow: var(--documents-subpage-card-shadow);
```

See säilitab arvutatava väärtuse, aga teeb selgeks, et mono-dokumendivaate väärtus kuulub documents feature’ile.

### 2. `documents/ui.css`

HC library-kontekstis olnud otseväärtused:

```css
--subpage-card-bg: var(--documents-surface-panel-bg);
--subpage-card-bg-hover: var(--documents-surface-panel-bg);
```

asendati documents alias + bridge mustriga:

```css
--documents-subpage-card-bg: var(--documents-surface-panel-bg);
--documents-subpage-card-bg-hover: var(--documents-surface-panel-bg);
--subpage-card-bg: var(--documents-subpage-card-bg);
--subpage-card-bg-hover: var(--documents-subpage-card-bg-hover);
```

---

## Tokeniauditi mõju

| Mõõdik | Pärast 13d | Pärast 13e | Muutus |
|---|---:|---:|---:|
| `subpage-card` definitsioone kokku | 141 | 141 | 0 |
| `feature-direct-definition` | 16 | **8** | **−8** |
| `feature-bridge` | 7 | **15** | **+8** |
| `other` | 0 | 0 | 0 |
| tokenite koguarv | 1119 | 1119 | 0 |
| definitsioone kokku | 4231 | 4239 | +8 |
| kasutusi kokku | 5921 | 5929 | +8 |
| multi-value token collision’eid | 619 | 620 | +1 |

Definitsioonide ja kasutuste kasv on oodatud, sest otseväärtuse asemel lisandub alias-token ja bridge. See ei tähenda CSS-i visuaalset kasvu, vaid omandikihi selgemat kirjeldamist.

`feature-direct-definition` võlg vähenes poole võrra: 16 → 8.

---

## Allesjäänud `feature-direct-definition` kandidaadid

Pärast 13e jäävad otsesed `--subpage-card-*` definitsioonid veel kahte kohta:

| Fail | Arv | Märkus |
|---|---:|---|
| `app/styles/features/chat/hc.css` | 6 | Chat HC override’id; võiks liikuda `--chat-subpage-card-*` bridge’i alla. |
| `app/styles/features/service-map/desktop/base.css` | 2 | Service-map kasutab workspace elevated card väärtusi; võiks liikuda `--service-map-subpage-card-*` bridge’i alla. |

Need on järgmised loogilised migratsioonikandidaadid.

---

## Staatiline kontroll

```text
git apply --check: OK
Missing local CSS imports: 0
CSS import cycles: 0
CSS brace-balance errors: 0
Documents ui/mono direct --subpage-card definitions: 0 []
Subpage-card feature direct definitions: 8
Subpage-card feature bridge definitions: 15
Project CSS !important count: 2025
```

`!important` arv ei muutunud.

---

## Rakendamine

Rakendada pärast patch’i 22:

```bash
git apply --check sotsiaalai-css-cleanup-23-documents-ui-mono-subpage-card-bridge.patch
git apply sotsiaalai-css-cleanup-23-documents-ui-mono-subpage-card-bridge.patch

npm run css:tokens
npm run css:tokens:check
```

---

## Järgmine soovitus

Järgmiseks etapiks sobib **13f: chat HC subpage-card bridge**, sest pärast 13e jääb suurim otsene võlg `features/chat/hc.css` faili.

Eesmärk oleks sama mudel:

```css
--chat-subpage-card-bg: ...;
--subpage-card-bg: var(--chat-subpage-card-bg);
```

See vähendaks `feature-direct-definition` arvu 8-lt tõenäoliselt 2-ni.

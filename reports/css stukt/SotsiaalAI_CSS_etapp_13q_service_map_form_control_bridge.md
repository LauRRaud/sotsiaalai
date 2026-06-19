# SotsiaalAI CSS etapp 13q — service-map form-control bridge

## Eesmärk

Etapi 13q eesmärk on lõpetada vormiväljade tokenipere esimene omandivoor: allesolevad service-map vormiväljade `--input-*` otsedefinitsioonid liiguvad `--service-map-input-*` alias-tokenitesse ning üldised `--input-*` tokenid jäävad ainult bridge-kihiks.

Scope ainult:

- `app/styles/features/service-map/desktop/base.css`
- `app/styles/features/service-map/desktop/pre-inquiry-agent.css`

## Alusseis pärast 13p

Pärast etappi 13p jäi form-control direct-võlg ainult service-map failidesse:

| Fail | Direct definitsioone |
|---|---:|
| `app/styles/features/service-map/desktop/base.css` | 7 |
| `app/styles/features/service-map/desktop/pre-inquiry-agent.css` | 1 |

Form-control mõõdikud pärast 13p:

| Mõõdik | Väärtus |
|---|---:|
| `feature-direct-definition` | 8 |
| `feature-bridge` | 47 |
| `other` | 0 |
| Projekti `!important` arv | 2025 |

## Muudatused

### `app/styles/features/service-map/desktop/base.css`

HC service-map vormiväljade väärtused liiguvad `--service-map-input-*` alias-tokenitesse.

Enne:

```css
--input-bg: #000;
--input-bg-hover: #000;
--input-bg-focus: #000;
--input-flat-bg: #000;
--input-flat-bg-hover: #000;
--input-text: var(--hc-accent, #ffea00);
--input-placeholder: rgba(255, 234, 0, 0.92);
```

Pärast:

```css
--service-map-input-bg: #000;
--service-map-input-bg-hover: #000;
--service-map-input-bg-focus: #000;
--service-map-input-flat-bg: #000;
--service-map-input-flat-bg-hover: #000;
--service-map-input-text: var(--hc-accent, #ffea00);
--service-map-input-placeholder: rgba(255, 234, 0, 0.92);

--input-bg: var(--service-map-input-bg);
--input-bg-hover: var(--service-map-input-bg-hover);
--input-bg-focus: var(--service-map-input-bg-focus);
--input-flat-bg: var(--service-map-input-flat-bg);
--input-flat-bg-hover: var(--service-map-input-flat-bg-hover);
--input-text: var(--service-map-input-text);
--input-placeholder: var(--service-map-input-placeholder);
```

### `app/styles/features/service-map/desktop/pre-inquiry-agent.css`

Pre-inquiry agenti vormiväljade väärtused liiguvad samasse service-map alias-mudelisse.

Enne:

```css
--input-text: var(--workspace-feature-field-text, var(--input-text, #243044));
--input-placeholder: var(
  --workspace-feature-field-placeholder,
  var(--input-placeholder, rgba(71, 85, 105, 0.72))
);
```

Pärast:

```css
--service-map-input-text: var(--workspace-feature-field-text, var(--input-text, #243044));
--service-map-input-placeholder: var(
  --workspace-feature-field-placeholder,
  var(--input-placeholder, rgba(71, 85, 105, 0.72))
);
--input-text: var(--service-map-input-text);
--input-placeholder: var(--service-map-input-placeholder);
```

## Eeldatav mõju tokeniauditis

| Mõõdik | Enne 13q | Pärast 13q |
|---|---:|---:|
| Form-control `feature-direct-definition` | 8 | 0 |
| Form-control `feature-bridge` | 47 | 55 |
| Service-map direct definitsioonid | 8 | 0 |
| Service-map bridge definitsioonid | 2 | 10 |
| Form-control `other` | 0 | 0 |
| Projekti `!important` arv | 2025 | 2025 |

## Staatiline kontroll selles keskkonnas

Reaalset `git apply --check`, `npm run css:tokens` ja `npm run css:tokens:check` käivitust ei saanud siin teha, sest aktiivses tööruumis ei ole projekti repot ega 13p-järgset tööpuud. Patch on koostatud 13p raporti ja 13p-järgse tokeniauditi põhjal.

Rakenda päris repos pärast patch’i 34:

```bash
git apply --check sotsiaalai-css-cleanup-35-service-map-form-control-bridge.patch
git apply sotsiaalai-css-cleanup-35-service-map-form-control-bridge.patch

npm run css:tokens
npm run css:tokens:check
```

Oodatav kontrollitulemus:

```text
Form-control feature direct definitions: 0
Form-control feature bridge definitions: 55
Form-control other definitions: 0
Project CSS !important count: 2025
```

## Järgmine samm

Pärast 13q patch’i rakendamist sobib **13r kontroll-etapp**, kus uut refaktorit ei tehta. Kontrollida tuleb:

- form-control direct = 0;
- bridge arv ootuspärane;
- `other` = 0;
- `!important` ei suurenenud;
- CSS tokeniaudit ja CSS bundle ei halvene.

## 2026-06-19 rakendus praeguses repos

Originaalpatch `sotsiaalai-css-cleanup-35-service-map-form-control-bridge.patch`
ei rakendunud otse, sest see eeldas juba splititud service-map faile:

- `app/styles/features/service-map/desktop/base.css`
- `app/styles/features/service-map/desktop/pre-inquiry-agent.css`

Praeguses repos on vastav sisu veel failis:

- `app/styles/features/service-map/desktop.css`

Muudatus kanti seega käsitsi samasse olemasolevasse faili, ilma service-map
CSS-i splitimata. Sisuline muutus vastab patch 35 kavatsusele:

- HC service-map vormiväljade otsesed `--input-*` väärtused viidi
  `--service-map-input-*` alias-tokenitesse.
- `.pre-inquiry-agent-chat` vormiteksti ja placeholderi väärtused viidi sama
  alias-mudeli taha.
- Üldised `--input-*` tokenid jäid alles bridge-kihina, seega olemasolev
  tarbijakood ei muutu.

Kontrollid:

```text
npm test -- --runInBand tests/ui/hcSurfaceContracts.test.js tests/ui/serviceMapLeafletVisualContracts.test.js tests/workspace/serviceMapIconInline.test.js tests/serviceMap/entryTypeFilters.test.js
=> tegelikult jooksis kogu node --test suite: 986 pass, 0 fail

npm run css:audit
=> OK, notSeen 23 (1.2%)

npm run css:audit:check
=> OK, notSeen 23 <= 30

git diff --check
=> OK; ainult olemasolevad LF/CRLF hoiatused
```

Plaanis mainitud `npm run css:tokens` ja `npm run css:tokens:check` ei ole
selles checkoutis olemas. Lähim olemasolev kaitse on `npm run css:audit:check`.

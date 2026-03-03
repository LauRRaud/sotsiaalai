# SotsiaalAI Frontend Design System Spec

## Scope

See dokument pohineb ainult kaesolevas repos leitud implementatsioonil. Kui vaartus voi susteemne token ei olnud selgelt leitav, on see margitud `not found`.

### Auditeeritud allikad

- `app/styles/globals.css`
- `app/styles/tokens.css`
- `app/styles/base/core.css`
- `app/styles/base/layout.css`
- `app/styles/base/typography.css`
- `app/styles/base/backgrounds.css`
- `app/styles/base/a11y.css`
- `app/styles/components/glass.css`
- `app/styles/utilities/helpers.css`
- `app/styles/theme/light.css`
- `app/styles/theme/dark.css`
- `app/styles/theme/mid.css`
- `app/styles/theme/night.css`
- `app/styles/theme/hc.css`
- `components/ui/GlassRing.jsx`
- `components/ui/Button.jsx`
- `components/ui/IconButton.jsx`
- `components/ui/Input.jsx`
- `components/ui/Textarea.jsx`
- `components/ui/Panel.jsx`
- `components/ui/OptionCard.jsx`
- `components/ui/FancyCheckbox.jsx`
- `components/ui/FancyRadio.jsx`
- `components/ui/linkStyles.js`
- `components/ui/glassPageStyles.js`
- `components/ui/glassPolicyPageStyles.js`
- `components/alalehed/RegistreerimineBody.jsx`
- `components/alalehed/ProfiilBody.jsx`
- `components/alalehed/chat/ChatComposer.jsx`
- `components/alalehed/chat/chatLayoutVars.js`
- `components/ui/icons/*`

## 1. Klaasringid / Orb-konteiner

### Current implementation

- Peamine orb/ring shell on dubleeritud kahes kohas:
  - `app/styles/utilities/helpers.css` klass `.glass-ring`
  - `components/ui/GlassRing.jsx` muutujapohine Tailwind-string `baseStyles`
- Molemad defineerivad sama tuumaloogika:
  - kuju: `aspect-ratio: 1 / 1`, `border-radius: var(--glass-ring-radius, 50%)`
  - taust: `var(--glass-ring-surface-bg, var(--glass-surface-bg, rgba(0,0,0,0.25)))`
  - blur: `backdrop-filter: blur(var(--glass-blur-radius, 1rem))`
  - tekstivarv: `var(--glass-surface-text, #f2f2f2)`
  - shadow: `var(--glass-shell-shadow, none)`
  - padding: `--ring-pad-top`, `--ring-pad-x`
- Ringi suurus tuleb tokenitest `app/styles/tokens.css`:
  - `--ring-base-min: 34rem`
  - `--ring-base-max: 50rem`
  - `--ring-desktop-max: 55rem`
  - `--ring-fit-pad: 1.5rem`
  - `--ring-ui-reserve: 2.5rem`
  - `--ring-scale: 1`
- Ringi diameeter arvutatakse `helpers.css` sees:
  - `--ring-fit-w: calc(100vw - (2 * var(--ring-fit-pad, 1.5rem)))`
  - `--ring-fit-h: calc(100dvh - (2 * var(--ring-fit-pad, 1.5rem)) - var(--ring-ui-reserve, 9rem))`
  - `--ring-diameter-default: min(var(--ring-max), max(var(--ring-base-min, 34rem), var(--ring-fit)))`
- Mobiilis muutub ring taisekraani klaaskaardiks:
  - laius: `calc(100vw - safe-area - 2 * --mobile-glass-card-gap)`
  - korgus: `calc(100dvh - safe-area - 2 * --mobile-glass-card-gap)`
  - radius: `--mobile-glass-card-radius: clamp(1.05rem, 3.8vw, 1.45rem)`
- Expandable orb/policy ring elab `helpers.css` klassides:
  - `.glass-ring-expandable`
  - `.glass-ring-expandable--open`
  - `.glass-ring-scroll`
  - `.glass-ring-content`
  - `.glass-policy-scroll...`
- Maskid on lokaalsed, mitte susteemsed:
  - profiili rolli-ava mask: `components/alalehed/ProfiilBody.jsx`, klass `.profile-mask-layer`
  - chat input hole mask: `components/alalehed/chat/ChatBodyView.jsx`, `mask-image: var(--chat-input-hole-mask, none)`
  - scroll fade maskid: `helpers.css`, `.glass-ring-scroll`, `.glass-policy-scroll...`
- Border on ebauhtlane:
  - desktop orb: enamasti border puudub
  - mobile/profiil: `max-[48em]:border max-[48em]:border-[var(--glass-border-color)]` `ProfiilBody.jsx`
  - light theme defineerib `--glass-border-width` ja `--glass-border-color`, aga `.glass-ring` ei kasuta neid susteemselt
- Shadow susteem on teemast soltuv:
  - default/dark: `--glass-ring-glow-dark`
  - light: `--glass-shell-shadow: 0 18px 40px rgba(0, 0, 0, 0.16)`
- Orbital menu enda mullid ei tule samast susteemist:
  - `components/alalehed/ProfiilBody.jsx` seab ainult custom var-id
  - tegelik bubble-visual tuleb `components/effects/Components/OrbitalMenu/*` ja mobiili override'id `app/styles/mobile.css`
  - taielik orb-item visual spec keskse tokenina: `not found`

### Recommended normalization

- Jata uks source of truth ring-shellile. Praktikas:
  - kasuta ainult `GlassRing.jsx` komponendi klassi
  - liiguta `.glass-ring` arvutusloogika tokeniteks/utiliitideks
  - eemalda duplikaat `helpers.css` vs `GlassRing.jsx`
- Tekita uhtne orb tokenite grupp:
  - `--orb-bg`
  - `--orb-border`
  - `--orb-radius`
  - `--orb-blur`
  - `--orb-shadow`
  - `--orb-pad-x`
  - `--orb-pad-top`
  - `--orb-size-min`
  - `--orb-size-max`
- Seo border pariselt tokenitega, mitte ad hoc klassidega:
  - `border: var(--orb-border, 0 solid transparent)`
- Eralda maskide susteem semantilisteks variantideks:
  - `orb-mask-none`
  - `orb-mask-scroll-fade`
  - `orb-mask-hole-profile-role`
  - `orb-mask-hole-chat-input`
- Tee orb-expand kaitumine omaette variandiks, mitte policy-page erandiks:
  - `variant="circular"`
  - `variant="sheet"`
  - `state="expanded"`
- Orbital menu bubble'ite visual tuleb siduda sama klaasmaterjali tokenitega; praegu on see eraldiseisev ja raskesti ennustatav.

## 2. Pealkirjad ja tekstid

### Current implementation

- Font family susteem on olemas:
  - pohifont `--font-aino`
  - display/headline font `--font-aino-headline`
  - defineeritud `app/layout.js`
- Globaalne typography kiht on ohuke:
  - `app/styles/base/typography.css` maarab ainult family/weight
  - `h2` saab `font-family: var(--font-aino)` ja `font-weight: bold`
  - globaalset `h1/H1 scale` ei ole
- H1/H2/body/caption hierarhia on enamasti komponentides inline klassidega, mitte tokenitena.
- H1 naited:
  - lehe pealkiri `components/ui/glassPageStyles.js`
    - `text-[2.15em]`
    - mobile `text-[clamp(1.98rem,7.9vw,2.64rem)]`
    - `leading-[1.12]`
    - `tracking-[0.03em]`
    - `font-family: var(--font-aino-headline)`
    - `font-weight: 400`
  - profiili H1 `components/alalehed/ProfiilBody.jsx`
    - `text-[clamp(1.9rem,1.5rem+1.7vw,2.5rem)]`
    - mobile `text-[clamp(2.3rem,9.1vw,3rem)]`
    - `leading-[1.15]`
    - `tracking-[0.03em]`
- H2 naited:
  - policy section heading `components/alalehed/policySectionStyles.js`
    - `text-[clamp(1.32rem,1.75vw,1.5rem)]`
    - mobile `text-[clamp(1.62rem,5.7vw,1.9rem)]`
    - `font-semibold`
    - `tracking-[0.013em]`
  - conversation drawer title `components/alalehed/ConversationDrawer.jsx`
    - `text-[clamp(1.62rem,1.28rem+1.2vw,2.08rem)]`
    - mobile `text-[clamp(2rem,8.1vw,2.45rem)]`
    - `leading-[1.1]`
    - `tracking-[0.018em]`
- Body/prose naited:
  - `app/styles/components/glass.css` `.glass-box p`
    - `font-size: 1.05em`
    - `line-height: 1.56`
    - `letter-spacing: 0.03em`
    - `font-weight: 300`
  - policy body `components/alalehed/policySectionStyles.js`
    - `text-[clamp(1.06rem,1.45vw,1.18rem)]`
    - mobile `text-[clamp(1.22rem,4.55vw,1.38rem)]`
    - `line-height: 1.74`
    - `tracking-[0.013em]`
  - register body `components/alalehed/RegistreerimineBody.jsx`
    - `text-[1.25rem]`
    - `leading-[1.45]`
- Caption / microcopy:
  - susteemse `caption` tokenina `not found`
  - kasutus on lokaalne, nt `ChatSourcesPanel.jsx`, `ChatMessageItem.jsx`, `ChatSidebar.jsx`
  - suurused jaavad umbes `0.8rem` kuni `0.95rem`
- Letter-spacing on ebajarjekindel:
  - pealkirjad `0.03em`, `0.018em`, `0.013em`, `0.008em`
  - body `0.03em`, `0.02em`, `0.013em`
- Font-weight on samuti lokaalne:
  - pealkirjad 400, 500, 600
  - body 300, 400, 500
  - globaalne typographic token map: `not found`

### Recommended normalization

- Loo selge tupograafiaskaala tokenite voi utiliitklassidena:
  - `--type-h1-size`
  - `--type-h1-line`
  - `--type-h1-track`
  - `--type-h2-*`
  - `--type-body-*`
  - `--type-caption-*`
- Seo koik glass-page pealkirjad uhe komponendi kulge:
  - `PageTitle`
  - variandid: `default`, `prominent`, `compact`, `policy`
- Eemalda inline `text-[clamp(...)]` duplikaadid lehtedest `RegistreerimineBody.jsx`, `ProfiilBody.jsx`, `ConversationDrawer.jsx`.
- Pane kirja ametlik hierarhia:
  - `H1`: headline font, 400, tracking 0.02em voi 0.03em
  - `H2`: body/headline soltuvalt kontekstist
  - `Body`: uks pohiteksti moot
  - `Caption`: uks secondary moot
- Praegu on `h2` globaalne HTML-selektor eksitav, sest paris H2 suurused ei tule sealt. Kas eemalda see voi vii kogu H2 susteem toesti globaalseks.

## 3. Ikoonid

### Current implementation

- Ikoonid on segu:
  - eraldi React SVG komponendid `components/ui/icons/*`
  - inline SVG-d otse feature-komponentides, eriti `ChatComposer.jsx` ja `ProfiilBody.jsx`
- Varvid on enamasti hardcoded:
  - dark `#c57171`
  - light `#7A3A38`
  - moned success/error varvid `#16a34a`, `#dc2626`
- Uhtset ikoonivarvi tokenit ei kasutata kogu susteemis.
  - `--chat-icon-color` eksisteerib
  - `--icon-btn-close-color` eksisteerib
  - uldine `--icon-color-primary`/`--icon-color-muted`: `not found`
- Stroke weight varieerub tugevalt:
  - `0.71` `LockErrorIcon`
  - `1`, `1.2`, `1.4`, `1.5`, `1.6`, `1.8`, `2`, `2.8`, `3.1`, `3.5`
  - suurtes viewBoxides isegi `10` ja `64`
- Ikoonide suurused on lokaalsed:
  - chat action ikoonid `1.6rem`, `1.9rem`
  - close `2.05rem` glyph, nupp `2.65rem`
  - back icon `5.7rem` kuni `6.4rem`
  - expand icon `64px`
- Optiline joondus on kasitsi korrigeeritud:
  - `translate-y-[0.06rem]` chat speaker icon
  - `transform="translate(0 -1.3)"` mitmes `ChatIcons.jsx` ikoonis
  - `BackIcon.jsx` kasutab `<g transform="translate(...) scale(...)">`
  - `PinDockIcon` kasutab lisatouget `translate(0 0.35)`
- Close icon pole SVG, vaid `x` pseudo-element:
  - `app/styles/utilities/helpers.css` `.modal-close-btn::before`
  - `components/ui/IconButton.jsx` renderdab samuti `&times;`
- Uhtne ikooni API suuruse/stroke jaoks: `not found`

### Recommended normalization

- Loo ikoonisusteem kolmele tasemele:
  - `sm` 16
  - `md` 20
  - `lg` 24
- Loo ametlikud stroke tokenid:
  - `--icon-stroke-thin: 1.25`
  - `--icon-stroke-regular: 1.5`
  - `--icon-stroke-bold: 1.8`
- Vii varvid tokeniteks:
  - `--icon-color-primary`
  - `--icon-color-muted`
  - `--icon-color-success`
  - `--icon-color-danger`
- Asenda inline SVG-d voimalusel kesksete ikoonikomponentidega.
- Asenda `x`-pohine close control SVG-ikooniga; praegu on close-nupu visuaal ja moodistus ulejaanud ikoonisusteemist eraldi.
- Dokumenteeri optilised nudge'id. Praegu need eksisteerivad, aga on laiali transformide sees.

## 4. Nupud

### Current implementation

- Keskne nupukomponent on `components/ui/Button.jsx`.
- Variandid:
  - `primary`
  - `ghost`
  - `danger`
  - `linkBrand`
- Susteemne `secondary` nimeline variant: `not found`
- `primary` kasutab tokeneid `app/styles/tokens.css` ja teema override'e:
  - taust `--btn-primary-bg`
  - border `--btn-primary-border`
  - shadow `--btn-primary-shadow`
  - hover/active/focus variandid olemas
- Baasgeomeetria `Button.jsx`:
  - `rounded-full`
  - `px-[1.35rem]`
  - `py-[0.8rem]`
  - `text-[1.2rem]`
  - `font-[500]`
  - `tracking-[0.02em]`
  - `min-h-[2.85rem]`
- Suurused:
  - `sm`: `text-[0.98rem]`, `px-[0.7rem]`, `py-[0.35rem]`, `min-h-[2.25rem]`
  - `md`: baas
  - `lg`: praktiliselt sama mis baas
- Tahtis ebakola:
  - token `--btn-primary-radius: 0.95rem` on olemas
  - `Button.jsx` kasutab siiski `rounded-full`
  - seega radius-token ei juhi paris nuppu
- Focus-state primary nupul on shadow-pohine ring:
  - `--btn-primary-shadow-focus`
  - sisaldab `0 0 0 3px var(--btn-primary-focus-ring-color)`
- Disabled-state:
  - ainult opacity + cursor
  - disabled background/border/text tokens eraldi: `not found`
- Icon buttons ei ole standardiseeritud:
  - `components/ui/IconButton.jsx` toetab ainult `close` varianti
  - enamik ikonupud on inline klassidega feature-komponentides

### Recommended normalization

- Tee ametlik variantide komplekt:
  - `primary`
  - `secondary`
  - `danger`
  - `ghost`
  - `icon`
  - `link`
- Pane radius pariselt tokeni alla:
  - asenda `rounded-full` -> `rounded-[var(--btn-radius)]`
  - lisa variant `pill` kui ummargune kuju on pariselt taotluslik
- Loo disabled tokenid:
  - `--btn-disabled-bg`
  - `--btn-disabled-border`
  - `--btn-disabled-text`
- Tosta `IconButton` samasse susteemi; praegu on close-nupp erand.
- Vahenda feature-tasemel override'e (`!px`, `!py`, `!text`) ja kata need nupu size/variant API-ga.

## 5. Tekstikastid ja inputid

### Current implementation

- Keskne input-komponent on `components/ui/Input.jsx`.
- Keskne textarea-komponent on `components/ui/Textarea.jsx`.
- Input base:
  - kuju: `rounded-full`
  - padding: `px-[1rem]`, `py-[0.78rem]`
  - suurus: `text-[1.05rem]`
  - korgus: `min-h-[3.05rem]`
  - taust: `var(--input-bg)`
  - border: `var(--input-border)`
  - placeholder: `var(--input-placeholder)` ja `placeholder:[font-size:1.02em]`
  - focus: `background -> --input-bg-focus`, shadow -> `--input-shadow-hover`
- Textarea base:
  - kasutab `rounded-[var(--input-radius)]`
  - muus osas vaga sarnane Input'iga
- Teine oluline ebakola:
  - `--input-radius` on olemas
  - `Textarea` kasutab seda
  - `Input` kasutab `rounded-full`
- Theme tokenid:
  - dark: `--input-border: 2px solid transparent`
  - light: `--input-border: 1px solid transparent`
  - placeholder dark `#f8f8f7`
  - placeholder light `#374151`
- Focus ring klassikalise outline'ina puudub:
  - tavaline focus on shadow-pohine
  - HC reziimis tuleb outline `app/styles/base/a11y.css`
- Error-state globaalsel input-komponendil puudub:
  - `aria-invalid` stiil: `not found`
  - `Input.jsx`/`Textarea.jsx` error variant: `not found`
  - error kastid on lokaalsed feature-implementatsioonid, nt `RegistreerimineBody.jsx`
- Placeholder, hover ja disabled on susteemsed.
- Autofill override on ainult login modalile `helpers.css`.

### Recommended normalization

- Uhenda `Input` ja `Textarea` sama valjasusteemi alla:
  - `Field`
  - `FieldTextarea`
  - uhised tokenid radius/border/focus/error jaoks
- Paranda radius vastuolu:
  - molemad kasutagu `--input-radius`
- Lisa ametlikud state tokenid:
  - `--input-border-hover`
  - `--input-border-focus`
  - `--input-ring-focus`
  - `--input-border-error`
  - `--input-bg-error`
  - `--input-text-error`
- Lisa `aria-invalid="true"` ja `data-invalid` pohised stiilid otse kesksetesse komponentidesse.
- Standardiseeri field height scale:
  - `sm`
  - `md`
  - `lg`
  - `multiline`

## 6. Vahed ja grid

### Current implementation

- Globaalne 4/8 spacing scale: `not found`
- Spacing tuleb peamiselt:
  - `app/styles/tokens.css` ring tokenitest
  - komponentide inline Tailwind vaartustest
  - `components/alalehed/chat/chatLayoutVars.js` chat paigutusmuutujatest
- Pohilised container mustrid:
  - `.glass-box` `width: min(100%, 86vw)` `max-width: clamp(32rem, 70vw, 50rem)`
  - `InvitePageShell.jsx` kasutab sama mustrit
  - `.site-footer-inner` `width: min(92vw, 58rem)`
  - registration scroll `max-w-[clamp(18rem,39vw,25.2rem)]`
- Chat-layout on tugevalt tokeniseeritud, aga lokaalne:
  - `--chat-window-inline-gap`
  - `--chat-window-max-w`
  - `--chat-hpad`
  - `--hud-edge`
  - `--chat-mobile-*`
- Vahed kasutavad palju `clamp(... rem, vw/vh ...)`.
- Alignment rules:
  - peamised glass page'd keskjoondatud
  - chat kasutab oma sisemist vasak/parem padding susteemi
  - policy page'd kasutavad eraldi scroll-width arvutusi `helpers.css`
- Uhtne grid tokenite susteem `container-sm/md/lg`, `space-1..n`: `not found`

### Recommended normalization

- Loo ametlik spacing scale:
  - `--space-1: 0.25rem`
  - `--space-2: 0.5rem`
  - `--space-3: 0.75rem`
  - `--space-4: 1rem`
  - jne
- Loo container tokenid:
  - `--container-narrow`
  - `--container-default`
  - `--container-wide`
  - `--container-orb-content`
- Vahenda component-level `clamp()` kordusi seal, kus tegelikult kasutatakse sama mustrit.
- Chat layout tokenid voiks jaada eraldi domeeniks, kuid nimed peaksid jargima sama skeemi nagu uldine susteem.

## 7. Varvisusteem

### Current implementation

- Pohivarvitokenid on `app/styles/tokens.css`.
- Olulised base tokenid:
  - brand `--brand-primary: #c57171`
  - tekstiramp `--pt-50` ... `--pt-600`
  - glass/modal/input/button tokenid
- Aktiivsed teemad:
  - light `app/styles/theme/light.css`
  - mid `app/styles/theme/mid.css`
  - dark `app/styles/theme/dark.css`
  - night `app/styles/theme/night.css`
  - hc `app/styles/theme/hc.css`
- High-contrast eriparad on reaalselt implementeeritud:
  - `html[data-contrast="hc"]` annab outline'id, kontrastsed pinnad ja chat override'id `base/a11y.css`
  - `hc.css` defineerib `--hc-bg`, `--hc-surface`, `--hc-text`, `--hc-accent`
- Light/dark/mid/night teemad override'ivad:
  - glass surface
  - input surface
  - button surface
  - chat surface
  - drawer surface
- Opacity-pohine palette on vaga tugev:
  - paljud taustad on `rgba(...)`
  - glass pinnad kasutavad layered gradients + alpha
- Oluline leid:
  - `app/styles/theme/color-themes.css` eksisteerib
  - `app/layout.js` seab `data-color-theme`
  - `app/styles/globals.css` EI impordi `color-themes.css`
  - jarelikult varviteema variandid `green/blue/neutral/gold/red/purple` ei ole aktiivses stylesheet tree's
- Sama lugu `app/styles/theme/monochrome.css` failiga:
  - fail eksisteerib
  - `globals.css` ei impordi seda
  - monochrome/light-mono/dark-mono runtime-tugi on seega osaline voi inactive

### Recommended normalization

- Defineeri ametlik semantic color layer:
  - `--color-bg-page`
  - `--color-surface-glass`
  - `--color-surface-elevated`
  - `--color-text-primary`
  - `--color-text-secondary`
  - `--color-border-subtle`
  - `--color-accent`
  - `--color-danger`
  - `--color-success`
- Jata rgba/gradient retseptid semantiliste tokenite taha, mitte komponentidesse.
- Kui `data-color-theme` peab tootama, impordi `color-themes.css` tegelikult `globals.css` kaudu.
- Kui monochrome peab tootama, impordi `monochrome.css` voi eemalda surnud teemaolekud `layout.js`/prefs loogikast.
- Pane kirja, millised teemad on ametlikud:
  - `light`
  - `mid`
  - `dark`
  - `night`
  - `hc`
  - koik ulejaanud on praegu kas katki voi pooleli

## 8. Px vs rem vs vw/vh kaardistus

### Current implementation

| Unit | Kus kasutatakse | Tuupilised naited | Markus |
| --- | --- | --- | --- |
| `px` | peened kontrollid, stroke'id, borderid, maski- ja viewport-korrektsioonid | `20px`, `24px`, `64px`, `1px`, `2px`, `320px` | kasutatakse peamiselt fikseeritud detailides |
| `rem` | komponentide baasdimensioonid ja tupograafia | `2.85rem`, `3.05rem`, `1.2rem`, `34rem`, `50rem` | domineeriv mootuhik susteemis |
| `vw` | responsiivne laius, padding, teksti clampid | `5vw`, `4.5vw`, `39vw`, `70vw` | peamiselt orb ja glass layout |
| `vh` | vertikaalne spacing, orb sizing, fade offsetid | `2.4vh`, `4.2vh`, `9.5vh` | peamiselt orb/chat/policy layout |
| `dvh` | mobiili viewport korgused | `100dvh`, `4.5dvh`, `3.2dvh` | kasutatakse oigesti mobile-safe layout'is |
| `svh` | tausta overscan | `18svh` | uksik kasutus `--bg-overscan` |
| `vmin` | ring/chat diameeter | `94vmin`, `82vmin` | kasutatakse suure ummarguse konteineri sobitamiseks |

- `px` parisnaited:
  - `OptionCard.jsx` `20px` control size fallback
  - `FancyCheckbox.jsx` `28px` box
  - `base/backgrounds.css` particles overscan `-320px`
  - ikooni stroke'id `0.71` kuni `64`
- `rem` parisnaited:
  - `Button.jsx` `min-h-[2.85rem]`
  - `Input.jsx` `min-h-[3.05rem]`
  - `helpers.css` ring min/max `34rem`, `50rem`, `55rem`
- `vw/vh` parisnaited:
  - `--ring-pad-x: clamp(1.8rem, 5vw, 3.2rem)`
  - `--ring-gap: clamp(0.9rem, 2.4vh, 1.4rem)`
  - `glassPageTitleClassName` mobile `7.9vw`
- Jareldus:
  - susteem on sisuliselt `rem-first`, aga detailides on palju lokaalseid `px` erandeid
  - `vw/vh/dvh` kasutatakse peamiselt layouti ja orb skaleerimiseks, mitte elementide pusisuuruseks

### Recommended normalization

- Hoia reegel:
  - `rem` = koik baasdimensioonid, typography, radius, padding, spacing
  - `px` = ainult hairline border, 1:1 icon stroke, safe-area/maski tehnilised erandid
  - `vw/vh/dvh` = ainult layout-level responsive formula'd
- Keela feature-komponentides suvalised `px` suurused, kui sama asi saab olla `rem`.
- Dokumenteeri ametlikult, et `clamp(rem, vw/vh, rem)` on lubatud ainult container/layout tokenites.

## 9. Puuduvad voi poolikud susteemiosad

### Current implementation

- Global H1/H2/body/caption token map: `not found`
- Global icon token map: `not found`
- Global input error state token map: `not found`
- Global button secondary variant: `not found`
- Global spacing scale: `not found`
- Active color-theme variants (`data-color-theme`): fail olemas, kuid aktiivses CSS-puus `not found`
- Active monochrome theme: fail olemas, kuid aktiivses CSS-puus `not found`

### Recommended normalization

- Otsi ja standardiseeri esmalt jargmised kohad:
  - `components/ui/glassPageStyles.js`
  - `components/alalehed/ProfiilBody.jsx`
  - `components/alalehed/RegistreerimineBody.jsx`
  - `components/alalehed/chat/ChatComposer.jsx`
  - `components/ui/icons/*`
  - `app/styles/globals.css`

## Checklist

- Kasuta uht orb shelli source of truth'i, mitte paralleelselt `.glass-ring` ja `GlassRing.jsx`.
- Seo koik button radius'ed tokeni kulge; ara hoia `rounded-full` vaikimisi.
- Kasuta `--input-radius` nii `Input` kui `Textarea` peal.
- Defineeri ametlik `H1/H2/body/caption` skaala.
- Too inline `text-[clamp(...)]` pealkirjad kesksetesse utiliitidesse voi komponentidesse.
- Standardiseeri ikooni suurused ja stroke'i kaalud.
- Vii hardcoded ikoonivarvid semantilisteks tokeniteks.
- Lisa globaalne input error-state (`aria-invalid`, `data-invalid`).
- Lisa button disabled-state tokenid, mitte ainult opacity.
- Loo ametlik spacing scale ja container tokenid.
- Hoia `vw/vh/dvh` ainult layout-taseme valemites.
- Impordi `color-themes.css`, kui `data-color-theme` peab pariselt tootama.
- Impordi `monochrome.css` voi eemalda vastavad pseudo-teemad prefs-loogikast.
- Dokumenteeri koik maski variandid eraldi susteemiosana.
- Vahenda feature-komponentide `!important` ja `!px/!py/!text` override'e.



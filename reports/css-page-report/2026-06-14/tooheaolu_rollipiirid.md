# /tooheaolu/rollipiirid — primitive CSS report

## light

### `.button[data-variant="primary"]` ×1

- **<button>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control` · modules: BorderGlow-module
  - tailwind (57): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% 16… · color=rgb(36, 50, 68) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=11.52px · minHeight=37.6px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(36, 50, 68) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% 16… · boxShadow=rgba(0, 0, 0, 0.11) 0px 6px 13px …
  - dead@state: `ui-glow-button-control`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame, :root.theme-mi… → [box-shadow!]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__page .button[data-varian… → [color!]
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckActions .button → [border-top-left-radius!,border-top-right-radius!,border-bottom-right-radius!,border-bottom-left-radius!]
  - hover:
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame:hover:not(.ui-g… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.documents-dropdown-trigger` ×9

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(255, 255, 255, 0.5) · color=rgba(0, 0, 0, 0.94) · borderTopColor=rgba(122, 58, 56, 0.28) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(0, 0, 0, 0.94) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.66) · boxShadow=rgba(197, 113, 113, 0.24) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(255, 255, 255, 0.5) · color=rgba(0, 0, 0, 0.94) · borderTopColor=rgba(122, 58, 56, 0.28) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(0, 0, 0, 0.94) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.66) · boxShadow=rgba(197, 113, 113, 0.24) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(255, 255, 255, 0.5) · color=rgba(0, 0, 0, 0.94) · borderTopColor=rgba(122, 58, 56, 0.28) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(0, 0, 0, 0.94) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.66) · boxShadow=rgba(197, 113, 113, 0.24) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(255, 255, 255, 0.5) · color=rgba(0, 0, 0, 0.94) · borderTopColor=rgba(122, 58, 56, 0.28) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(0, 0, 0, 0.94) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.66) · boxShadow=rgba(197, 113, 113, 0.24) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.dashboard-info-trigger-corner` ×1

- **<button>** [visible] semantic: `bg-transparent p-0 shadow-none outline-none transform-gpu dashboard-info-trigger-corner` · modules: PageInfoButton-module
  - tailwind (19): `inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-cent…`
  - computed: color=rgb(122, 58, 56) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(122, 58, 56) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 outline-none dashboard-info-trigger-corner`
  - resting:
    - components_0b3d-an._.css | .PageInfoButton-module__sZW3Ea__trigger → [--page-info-icon-bg,--page-info-ring-color,--page-info-dot-color]
    - components_0b3d-an._.css | .PageInfoButton-module__sZW3Ea__cornerTrigger → [opacity]
    - components_0b3d-an._.css | :is(:root.theme-light:not(.theme-mid) .PageInfoButton-m… → [--page-info-ring-color,--page-info-dot-color]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.back-button` ×1

- **<button>** [visible] semantic: `back-button bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - tailwind (36): `inline-flex h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] items-center justify-center b…`
  - computed: color=rgb(255, 255, 255) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · borderTopLeftRadius=999px · opacity=1 · outlineColor=rgb(255, 255, 255) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - resting:
    - _0blu2ae._.css | .back-button → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

## mid

### `.button[data-variant="primary"]` ×1

- **<button>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control` · modules: BorderGlow-module
  - tailwind (57): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(92% 88% at 50% 16… · color=rgb(36, 50, 68) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=11.52px · minHeight=37.6px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(36, 50, 68) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: boxShadow=rgba(38, 24, 22, 0.1) 0px 7px 16p…
  - resting:
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"] → [--btn-primary-bg-hover,--btn-primary-bg-active,--btn-primary-border-hover,--btn-primary-shadow-hover,backdrop-filter!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]::before → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame, :root.theme-mi… → [box-shadow!]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__page .button[data-varian… → [color!]
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckActions .button → [border-top-left-radius!,border-top-right-radius!,border-bottom-right-radius!,border-bottom-left-radius!]
  - hover:
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame:hover:not(.ui-g… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]:active → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]:active:… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,opacity!]

### `.documents-dropdown-trigger` ×9

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(255, 255, 255, 0.16) · color=rgba(0, 0, 0, 0.94) · borderTopColor=rgba(255, 255, 255, 0.66) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(0, 0, 0, 0.94) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.23) · boxShadow=rgba(147, 111, 105, 0.22) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(255, 255, 255, 0.16) · color=rgba(0, 0, 0, 0.94) · borderTopColor=rgba(255, 255, 255, 0.66) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(0, 0, 0, 0.94) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.23) · boxShadow=rgba(147, 111, 105, 0.22) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(255, 255, 255, 0.16) · color=rgba(0, 0, 0, 0.94) · borderTopColor=rgba(255, 255, 255, 0.66) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(0, 0, 0, 0.94) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.23) · boxShadow=rgba(147, 111, 105, 0.22) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(255, 255, 255, 0.16) · color=rgba(0, 0, 0, 0.94) · borderTopColor=rgba(255, 255, 255, 0.66) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(0, 0, 0, 0.94) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.23) · boxShadow=rgba(147, 111, 105, 0.22) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.dashboard-info-trigger-corner` ×1

- **<button>** [visible] semantic: `bg-transparent p-0 shadow-none outline-none transform-gpu dashboard-info-trigger-corner` · modules: PageInfoButton-module
  - tailwind (19): `inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-cent…`
  - computed: color=rgb(122, 58, 56) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(122, 58, 56) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 outline-none dashboard-info-trigger-corner`
  - resting:
    - components_0b3d-an._.css | .PageInfoButton-module__sZW3Ea__trigger → [--page-info-icon-bg,--page-info-ring-color,--page-info-dot-color]
    - components_0b3d-an._.css | .PageInfoButton-module__sZW3Ea__cornerTrigger → [opacity]
    - components_0b3d-an._.css | :is(:root.theme-light:not(.theme-mid) .PageInfoButton-m… → [--page-info-ring-color,--page-info-dot-color]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.back-button` ×1

- **<button>** [visible] semantic: `back-button bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - tailwind (36): `inline-flex h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] items-center justify-center b…`
  - computed: color=rgb(255, 255, 255) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · borderTopLeftRadius=999px · opacity=1 · outlineColor=rgb(255, 255, 255) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - resting:
    - _0blu2ae._.css | .back-button → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

## dark

### `.button[data-variant="primary"]` ×1

- **<button>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control` · modules: BorderGlow-module
  - tailwind (57): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgb(36, 50, 68) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=11.52px · minHeight=37.6px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(36, 50, 68) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% -1… · boxShadow=rgba(0, 0, 0, 0.11) 0px 6px 13px …
  - dead@state: `ui-glow-button-control`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__page .button[data-varian… → [color!]
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckActions .button → [border-top-left-radius!,border-top-right-radius!,border-bottom-right-radius!,border-bottom-left-radius!]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.documents-dropdown-trigger` ×9

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(12, 14, 18, 0.48) · color=rgba(255, 255, 255, 0.95) · borderTopColor=rgba(205, 133, 133, 0.26) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(255, 255, 255, 0.95) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(18, 21, 28, 0.58) · boxShadow=rgba(197, 113, 113, 0.28) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(12, 14, 18, 0.48) · color=rgba(255, 255, 255, 0.95) · borderTopColor=rgba(205, 133, 133, 0.26) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(255, 255, 255, 0.95) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(18, 21, 28, 0.58) · boxShadow=rgba(197, 113, 113, 0.28) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(12, 14, 18, 0.48) · color=rgba(255, 255, 255, 0.95) · borderTopColor=rgba(205, 133, 133, 0.26) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(255, 255, 255, 0.95) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(18, 21, 28, 0.58) · boxShadow=rgba(197, 113, 113, 0.28) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(12, 14, 18, 0.48) · color=rgba(255, 255, 255, 0.95) · borderTopColor=rgba(205, 133, 133, 0.26) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(255, 255, 255, 0.95) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(18, 21, 28, 0.58) · boxShadow=rgba(197, 113, 113, 0.28) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.dashboard-info-trigger-corner` ×1

- **<button>** [visible] semantic: `bg-transparent p-0 shadow-none outline-none transform-gpu dashboard-info-trigger-corner` · modules: PageInfoButton-module
  - tailwind (19): `inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-cent…`
  - computed: color=rgb(197, 113, 113) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(197, 113, 113) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 outline-none dashboard-info-trigger-corner`
  - resting:
    - components_0b3d-an._.css | .PageInfoButton-module__sZW3Ea__trigger → [--page-info-icon-bg,--page-info-ring-color,--page-info-dot-color]
    - components_0b3d-an._.css | .PageInfoButton-module__sZW3Ea__cornerTrigger → [opacity]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.back-button` ×1

- **<button>** [visible] semantic: `back-button bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - tailwind (36): `inline-flex h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] items-center justify-center b…`
  - computed: color=rgb(255, 255, 255) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · borderTopLeftRadius=999px · opacity=0.85 · outlineColor=rgb(255, 255, 255) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - resting:
    - _0blu2ae._.css | .back-button → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

## night

### `.button[data-variant="primary"]` ×1

- **<button>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control` · modules: BorderGlow-module
  - tailwind (57): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgb(36, 50, 68) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=11.52px · minHeight=37.6px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(36, 50, 68) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% -1… · boxShadow=rgba(0, 0, 0, 0.11) 0px 6px 13px …
  - dead@state: `ui-glow-button-control`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__page .button[data-varian… → [color!]
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckActions .button → [border-top-left-radius!,border-top-right-radius!,border-bottom-right-radius!,border-bottom-left-radius!]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.documents-dropdown-trigger` ×9

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(12, 14, 18, 0.48) · color=rgba(255, 255, 255, 0.95) · borderTopColor=rgba(205, 133, 133, 0.32) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(255, 255, 255, 0.95) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(18, 21, 28, 0.58) · boxShadow=rgba(140, 180, 235, 0.35) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(12, 14, 18, 0.48) · color=rgba(255, 255, 255, 0.95) · borderTopColor=rgba(205, 133, 133, 0.32) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(255, 255, 255, 0.95) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(18, 21, 28, 0.58) · boxShadow=rgba(140, 180, 235, 0.35) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(12, 14, 18, 0.48) · color=rgba(255, 255, 255, 0.95) · borderTopColor=rgba(205, 133, 133, 0.32) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(255, 255, 255, 0.95) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(18, 21, 28, 0.58) · boxShadow=rgba(140, 180, 235, 0.35) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(12, 14, 18, 0.48) · color=rgba(255, 255, 255, 0.95) · borderTopColor=rgba(205, 133, 133, 0.32) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(255, 255, 255, 0.95) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(18, 21, 28, 0.58) · boxShadow=rgba(140, 180, 235, 0.35) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.dashboard-info-trigger-corner` ×1

- **<button>** [visible] semantic: `bg-transparent p-0 shadow-none outline-none transform-gpu dashboard-info-trigger-corner` · modules: PageInfoButton-module
  - tailwind (19): `inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-cent…`
  - computed: color=rgb(197, 113, 113) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(197, 113, 113) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 outline-none dashboard-info-trigger-corner`
  - resting:
    - components_0b3d-an._.css | .PageInfoButton-module__sZW3Ea__trigger → [--page-info-icon-bg,--page-info-ring-color,--page-info-dot-color]
    - components_0b3d-an._.css | .PageInfoButton-module__sZW3Ea__cornerTrigger → [opacity]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.back-button` ×1

- **<button>** [visible] semantic: `back-button bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - tailwind (36): `inline-flex h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] items-center justify-center b…`
  - computed: color=rgb(255, 255, 255) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · borderTopLeftRadius=999px · opacity=0.85 · outlineColor=rgb(255, 255, 255) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - resting:
    - _0blu2ae._.css | .back-button → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

## mono

### `.button[data-variant="primary"]` ×1

- **<button>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control` · modules: BorderGlow-module
  - tailwind (57): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(118% 102% at 50% … · color=rgba(230, 230, 230, 0.96) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=11.52px · minHeight=37.6px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgba(230, 230, 230, 0.96) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: color=rgba(215, 162, 162, 0.99) · boxShadow=rgba(0, 0, 0, 0.114) 0px 5.4683px… · outlineColor=rgba(215, 162, 162, 0.99)
  - dead@state: `ui-glow-button-frame ui-glow-button-control`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,opacity,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.ui-glow… → [--glow-color!,--glow-color-60!,--glow-color-50!,--glow-color-40!,--glow-color-30!,--glow-color-20!,--glow-color-10!]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__page .button[data-varian… → [color!]
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckActions .button → [border-top-left-radius!,border-top-right-radius!,border-bottom-right-radius!,border-bottom-left-radius!]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) .ui-glow-but… → [box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.documents-dropdown-trigger` ×9

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(18, 19, 18, 0.58) · color=rgba(255, 255, 255, 0.95) · borderTopColor=rgba(232, 238, 224, 0.34) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(255, 255, 255, 0.95) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(28, 29, 28, 0.64) · boxShadow=rgba(230, 230, 230, 0.24) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(18, 19, 18, 0.58) · color=rgba(255, 255, 255, 0.95) · borderTopColor=rgba(232, 238, 224, 0.34) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(255, 255, 255, 0.95) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(28, 29, 28, 0.64) · boxShadow=rgba(230, 230, 230, 0.24) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(18, 19, 18, 0.58) · color=rgba(255, 255, 255, 0.95) · borderTopColor=rgba(232, 238, 224, 0.34) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(255, 255, 255, 0.95) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(28, 29, 28, 0.64) · boxShadow=rgba(230, 230, 230, 0.24) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=rgba(18, 19, 18, 0.58) · color=rgba(255, 255, 255, 0.95) · borderTopColor=rgba(232, 238, 224, 0.34) · borderTopWidth=0.8px · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgba(255, 255, 255, 0.95) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(28, 29, 28, 0.64) · boxShadow=rgba(230, 230, 230, 0.24) 0px 0px…
  - dead@state: `documents-field`
  - resting:
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.dashboard-info-trigger-corner` ×1

- **<button>** [visible] semantic: `bg-transparent p-0 shadow-none outline-none transform-gpu dashboard-info-trigger-corner` · modules: PageInfoButton-module
  - tailwind (19): `inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-cent…`
  - computed: color=rgb(197, 113, 113) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(197, 113, 113) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 outline-none dashboard-info-trigger-corner`
  - resting:
    - components_0b3d-an._.css | .PageInfoButton-module__sZW3Ea__trigger → [--page-info-icon-bg,--page-info-ring-color,--page-info-dot-color]
    - components_0b3d-an._.css | .PageInfoButton-module__sZW3Ea__cornerTrigger → [opacity]
    - components_0b3d-an._.css | :root.theme-mono:not([data-contrast="hc"]) .PageInfoBut… → [--page-info-ring-color,--page-info-dot-color]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.back-button` ×1

- **<button>** [visible] semantic: `back-button bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - tailwind (36): `inline-flex h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] items-center justify-center b…`
  - computed: color=rgb(197, 113, 113) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · borderTopLeftRadius=999px · opacity=0.85 · outlineColor=rgb(197, 113, 113) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#243244 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - resting:
    - _0blu2ae._.css | .back-button → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.back-bu… → [--back-arrow-color!,--back-dot-color!,color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

## hc

### `.button[data-variant="primary"]` ×1

- **<button>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control` · modules: BorderGlow-module
  - tailwind (57): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=37.6px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(255, 234, 0) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(124% 96% at 50% 6… · --btn-primary-bg-hover=linear-gradient(180deg, #ffea0014… · --btn-primary-text=#ffea00 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `ui-glow-button-frame ui-glow-button-control`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(.ui-glow-field, .ui-glow-b… → [--glow-color!,--glow-color-60!,--glow-color-50!,--glow-color-40!,--glow-color-30!,--glow-color-20!,--glow-color-10!]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_0b3d-an._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_0b3d-an._.css | html[data-contrast="hc"] .BorderGlow-module__FDv2aW__ca… → [--card-bg,--glow-color,--glow-color-60,--glow-color-50,--glow-color-40,--glow-color-30,--glow-color-20,--glow-color-10,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,color!,box-shadow!]
    - components_0b3d-an._.css | html[data-contrast="hc"] .BorderGlow-module__FDv2aW__ed… → [box-shadow!,opacity!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__page .button[data-varian… → [color!]
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckActions .button → [border-top-left-radius!,border-top-right-radius!,border-bottom-right-radius!,border-bottom-left-radius!]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
    - _0blu2ae._.css | html[data-contrast="hc"] .ui-glow-button-frame:hover:no… → [box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

### `.documents-dropdown-trigger` ×9

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgb(255, 234, 0) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(124% 96% at 50% 6… · --btn-primary-bg-hover=linear-gradient(180deg, #ffea0014… · --btn-primary-text=#ffea00 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `documents-field`
  - resting:
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgb(255, 234, 0) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(124% 96% at 50% 6… · --btn-primary-bg-hover=linear-gradient(180deg, #ffea0014… · --btn-primary-text=#ffea00 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `documents-field`
  - resting:
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgb(255, 234, 0) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(124% 96% at 50% 6… · --btn-primary-bg-hover=linear-gradient(180deg, #ffea0014… · --btn-primary-text=#ffea00 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `documents-field`
  - resting:
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=11.52px · minHeight=41.92px · opacity=1 · outlineColor=rgb(255, 234, 0) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(124% 96% at 50% 6… · --btn-primary-bg-hover=linear-gradient(180deg, #ffea0014… · --btn-primary-text=#ffea00 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `documents-field`
  - resting:
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - components_0b3d-an._.css | .WellbeingPage-module__RRRxDq__quickCheckField .wellbei… → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

### `.dashboard-info-trigger-corner` ×1

- **<button>** [visible] semantic: `bg-transparent p-0 shadow-none outline-none transform-gpu dashboard-info-trigger-corner` · modules: PageInfoButton-module
  - tailwind (19): `inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-cent…`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=2.68435e+07px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(255, 234, 0) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(124% 96% at 50% 6… · --btn-primary-bg-hover=linear-gradient(180deg, #ffea0014… · --btn-primary-text=#ffea00 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `bg-transparent p-0 shadow-none outline-none dashboard-info-trigger-corner`
  - resting:
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - components_0b3d-an._.css | .PageInfoButton-module__sZW3Ea__trigger → [--page-info-icon-bg,--page-info-ring-color,--page-info-dot-color]
    - components_0b3d-an._.css | .PageInfoButton-module__sZW3Ea__cornerTrigger → [opacity]
    - components_0b3d-an._.css | html[data-contrast="hc"] .PageInfoButton-module__sZW3Ea… → [--page-info-ring-color,--page-info-dot-color]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

### `.back-button` ×1

- **<button>** [visible] semantic: `back-button bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - tailwind (36): `inline-flex h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] items-center justify-center b…`
  - computed: color=rgb(255, 234, 0) · borderTopColor=rgb(255, 234, 0) · borderTopLeftRadius=999px · opacity=0.85 · outlineColor=rgb(255, 234, 0) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(124% 96% at 50% 6… · --btn-primary-bg-hover=linear-gradient(180deg, #ffea0014… · --btn-primary-text=#ffea00 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - resting:
    - _0blu2ae._.css | .back-button → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(.back-button, .chat-b… → [color!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

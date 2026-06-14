# /teenuseprofiil — primitive CSS report

## light

### `.button[data-variant="primary"]` ×1

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled service-profile-publish-save` · modules: BorderGlow-module
  - tailwind (58): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% 16… · color=rgba(0, 0, 0, 0.88) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=999px · minHeight=45.6px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgba(0, 0, 0, 0.88) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `ui-glow-button-control ui-glow-button-frame--disabled service-profile-publish-save`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame, :root.theme-mi… → [box-shadow!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button) → [color!]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.button[data-variant="secondary"]` ×2

- **<button>** [visible] semantic: `button shadow-none`
  - tailwind (43): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% 16… · color=rgba(0, 0, 0, 0.88) · borderTopColor=rgba(97, 111, 132, 0.38) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(15, 23, 42, 0.1) 0px 4px 10p… · borderTopLeftRadius=2.68435e+07px · minHeight=40.8px · opacity=1 · outlineColor=rgba(0, 0, 0, 0.88) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% 16…
  - dead@state: `shadow-none`
  - resting:
    - _0efahin._.css | .service-profile-form :is(button.button, a.button) → [color!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button)[data… → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
    - _0efahin._.css | .service-profile-subsection > .grid > .button → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `button shadow-none`
  - tailwind (43): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% 16… · color=rgba(0, 0, 0, 0.88) · borderTopColor=rgba(97, 111, 132, 0.38) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(15, 23, 42, 0.1) 0px 4px 10p… · borderTopLeftRadius=2.68435e+07px · minHeight=40.8px · opacity=1 · outlineColor=rgba(0, 0, 0, 0.88) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% 16…
  - dead@state: `shadow-none`
  - resting:
    - _0efahin._.css | .service-profile-form :is(button.button, a.button) → [color!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button)[data… → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.documents-dropdown-trigger` ×2

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: color=rgb(31, 41, 55) · borderTopColor=rgb(31, 41, 55) · borderTopLeftRadius=13.76px · minHeight=48px · opacity=1 · outlineColor=rgb(31, 41, 55) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `documents-field`
  - resting:
    - _0efahin._.css | .service-profile-glow-control, .service-profile-glow-dr… → [color,outline-color,box-shadow!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-width!,border-right-width!,border-bottom-width!,border-left-width!,border-top-style!,border-right-style!,border-bottom-style!,border-left-style!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!]
    - _0efahin._.css | .workspace-feature-dropdown .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0efahin._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: color=rgb(31, 41, 55) · borderTopColor=rgb(31, 41, 55) · borderTopLeftRadius=13.76px · minHeight=48px · opacity=1 · outlineColor=rgb(31, 41, 55) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `documents-field`
  - resting:
    - _0efahin._.css | .service-profile-glow-control, .service-profile-glow-dr… → [color,outline-color,box-shadow!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-width!,border-right-width!,border-bottom-width!,border-left-width!,border-top-style!,border-right-style!,border-bottom-style!,border-left-style!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!]
    - _0efahin._.css | .workspace-feature-dropdown .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0efahin._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.dashboard-info-trigger-corner` ×1

- **<button>** [visible] semantic: `bg-transparent p-0 shadow-none outline-none transform-gpu dashboard-info-trigger-corner` · modules: PageInfoButton-module
  - tailwind (19): `inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-cent…`
  - computed: color=rgb(122, 58, 56) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(122, 58, 56) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 outline-none dashboard-info-trigger-corner`
  - resting:
    - _0efahin._.css | .PageInfoButton-module__sZW3Ea__trigger → [--page-info-icon-bg,--page-info-ring-color,--page-info-dot-color]
    - _0efahin._.css | .PageInfoButton-module__sZW3Ea__cornerTrigger → [opacity]
    - _0efahin._.css | :is(:root.theme-light:not(.theme-mid) .PageInfoButton-m… → [--page-info-ring-color,--page-info-dot-color]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.back-button` ×1

- **<button>** [visible] semantic: `back-button bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - tailwind (36): `inline-flex h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] items-center justify-center b…`
  - computed: color=rgb(255, 255, 255) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · borderTopLeftRadius=999px · opacity=1 · outlineColor=rgb(255, 255, 255) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - resting:
    - _0blu2ae._.css | .back-button → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

## mid

### `.button[data-variant="primary"]` ×1

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled service-profile-publish-save` · modules: BorderGlow-module
  - tailwind (58): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(92% 88% at 50% 16… · color=rgba(0, 0, 0, 0.88) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=999px · minHeight=45.6px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgba(0, 0, 0, 0.88) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: borderTopColor=rgba(126, 95, 88, 0.125) · boxShadow=rgba(38, 24, 22, 0.1) 0px 7px 16p…
  - resting:
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"] → [--btn-primary-bg-hover,--btn-primary-bg-active,--btn-primary-border-hover,--btn-primary-shadow-hover,backdrop-filter!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]::before → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame, :root.theme-mi… → [box-shadow!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button) → [color!]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]:active → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]:active:… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,opacity!]

### `.button[data-variant="secondary"]` ×2

- **<button>** [visible] semantic: `button shadow-none`
  - tailwind (43): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(92% 88% at 50% 16… · color=rgba(0, 0, 0, 0.88) · borderTopColor=rgba(97, 111, 132, 0.38) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(38, 24, 22, 0.1) 0px 6px 14p… · borderTopLeftRadius=2.68435e+07px · minHeight=40.8px · opacity=1 · outlineColor=rgba(0, 0, 0, 0.88) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(92% 88% at 50% 16…
  - dead@state: `shadow-none`
  - resting:
    - _0efahin._.css | .service-profile-form :is(button.button, a.button) → [color!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button)[data… → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
    - _0efahin._.css | .service-profile-subsection > .grid > .button → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `button shadow-none`
  - tailwind (43): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(92% 88% at 50% 16… · color=rgba(0, 0, 0, 0.88) · borderTopColor=rgba(97, 111, 132, 0.38) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(38, 24, 22, 0.1) 0px 6px 14p… · borderTopLeftRadius=2.68435e+07px · minHeight=40.8px · opacity=1 · outlineColor=rgba(0, 0, 0, 0.88) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(92% 88% at 50% 16…
  - dead@state: `shadow-none`
  - resting:
    - _0efahin._.css | .service-profile-form :is(button.button, a.button) → [color!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button)[data… → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.documents-dropdown-trigger` ×2

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: color=rgb(47, 58, 74) · borderTopColor=rgb(47, 58, 74) · borderTopLeftRadius=13.76px · minHeight=48px · opacity=1 · outlineColor=rgb(47, 58, 74) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `documents-field`
  - resting:
    - _0efahin._.css | .service-profile-glow-control, .service-profile-glow-dr… → [color,outline-color,box-shadow!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-width!,border-right-width!,border-bottom-width!,border-left-width!,border-top-style!,border-right-style!,border-bottom-style!,border-left-style!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!]
    - _0efahin._.css | .workspace-feature-dropdown .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0efahin._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: color=rgb(47, 58, 74) · borderTopColor=rgb(47, 58, 74) · borderTopLeftRadius=13.76px · minHeight=48px · opacity=1 · outlineColor=rgb(47, 58, 74) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `documents-field`
  - resting:
    - _0efahin._.css | .service-profile-glow-control, .service-profile-glow-dr… → [color,outline-color,box-shadow!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-width!,border-right-width!,border-bottom-width!,border-left-width!,border-top-style!,border-right-style!,border-bottom-style!,border-left-style!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!]
    - _0efahin._.css | .workspace-feature-dropdown .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0efahin._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.dashboard-info-trigger-corner` ×1

- **<button>** [visible] semantic: `bg-transparent p-0 shadow-none outline-none transform-gpu dashboard-info-trigger-corner` · modules: PageInfoButton-module
  - tailwind (19): `inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-cent…`
  - computed: color=rgb(122, 58, 56) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(122, 58, 56) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 outline-none dashboard-info-trigger-corner`
  - resting:
    - _0efahin._.css | .PageInfoButton-module__sZW3Ea__trigger → [--page-info-icon-bg,--page-info-ring-color,--page-info-dot-color]
    - _0efahin._.css | .PageInfoButton-module__sZW3Ea__cornerTrigger → [opacity]
    - _0efahin._.css | :is(:root.theme-light:not(.theme-mid) .PageInfoButton-m… → [--page-info-ring-color,--page-info-dot-color]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.back-button` ×1

- **<button>** [visible] semantic: `back-button bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - tailwind (36): `inline-flex h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] items-center justify-center b…`
  - computed: color=rgb(255, 255, 255) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · borderTopLeftRadius=999px · opacity=1 · outlineColor=rgb(255, 255, 255) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - resting:
    - _0blu2ae._.css | .back-button → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

## dark

### `.button[data-variant="primary"]` ×1

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled service-profile-publish-save` · modules: BorderGlow-module
  - tailwind (58): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgba(255, 255, 255, 0.92) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=999px · minHeight=45.6px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgba(255, 255, 255, 0.92) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `ui-glow-button-control ui-glow-button-frame--disabled service-profile-publish-save`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button) → [color!]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.button[data-variant="secondary"]` ×2

- **<button>** [visible] semantic: `button shadow-none`
  - tailwind (43): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundColor=color(srgb 0 0 0 / 0.160627) · backgroundImage=linear-gradient(145deg, rgba(255,… · color=rgba(255, 255, 255, 0.92) · borderTopColor=rgba(248, 253, 255, 0.14) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.2) 0px 5px 14px 0… · borderTopLeftRadius=2.68435e+07px · minHeight=40.8px · opacity=1 · outlineColor=rgba(255, 255, 255, 0.92) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `shadow-none`
  - resting:
    - _0efahin._.css | .service-profile-form :is(button.button, a.button) → [color!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button)[data… → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
    - _0efahin._.css | .service-profile-subsection > .grid > .button → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `button shadow-none`
  - tailwind (43): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundColor=color(srgb 0 0 0 / 0.160627) · backgroundImage=linear-gradient(145deg, rgba(255,… · color=rgba(255, 255, 255, 0.92) · borderTopColor=rgba(248, 253, 255, 0.14) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.2) 0px 5px 14px 0… · borderTopLeftRadius=2.68435e+07px · minHeight=40.8px · opacity=1 · outlineColor=rgba(255, 255, 255, 0.92) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `shadow-none`
  - resting:
    - _0efahin._.css | .service-profile-form :is(button.button, a.button) → [color!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button)[data… → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.documents-dropdown-trigger` ×2

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: color=rgb(230, 229, 227) · borderTopColor=rgb(230, 229, 227) · borderTopLeftRadius=13.76px · minHeight=48px · opacity=1 · outlineColor=rgb(230, 229, 227) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `documents-field`
  - resting:
    - _0efahin._.css | .service-profile-glow-control, .service-profile-glow-dr… → [color,outline-color,box-shadow!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-width!,border-right-width!,border-bottom-width!,border-left-width!,border-top-style!,border-right-style!,border-bottom-style!,border-left-style!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!]
    - _0efahin._.css | .workspace-feature-dropdown .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0efahin._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: color=rgb(230, 229, 227) · borderTopColor=rgb(230, 229, 227) · borderTopLeftRadius=13.76px · minHeight=48px · opacity=1 · outlineColor=rgb(230, 229, 227) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `documents-field`
  - resting:
    - _0efahin._.css | .service-profile-glow-control, .service-profile-glow-dr… → [color,outline-color,box-shadow!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-width!,border-right-width!,border-bottom-width!,border-left-width!,border-top-style!,border-right-style!,border-bottom-style!,border-left-style!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!]
    - _0efahin._.css | .workspace-feature-dropdown .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0efahin._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.dashboard-info-trigger-corner` ×1

- **<button>** [visible] semantic: `bg-transparent p-0 shadow-none outline-none transform-gpu dashboard-info-trigger-corner` · modules: PageInfoButton-module
  - tailwind (19): `inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-cent…`
  - computed: color=rgb(197, 113, 113) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(197, 113, 113) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 outline-none dashboard-info-trigger-corner`
  - resting:
    - _0efahin._.css | .PageInfoButton-module__sZW3Ea__trigger → [--page-info-icon-bg,--page-info-ring-color,--page-info-dot-color]
    - _0efahin._.css | .PageInfoButton-module__sZW3Ea__cornerTrigger → [opacity]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.back-button` ×1

- **<button>** [visible] semantic: `back-button bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - tailwind (36): `inline-flex h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] items-center justify-center b…`
  - computed: color=rgb(255, 255, 255) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · borderTopLeftRadius=999px · opacity=0.85 · outlineColor=rgb(255, 255, 255) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - resting:
    - _0blu2ae._.css | .back-button → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

## night

### `.button[data-variant="primary"]` ×1

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled service-profile-publish-save` · modules: BorderGlow-module
  - tailwind (58): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgba(255, 255, 255, 0.92) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=999px · minHeight=45.6px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgba(255, 255, 255, 0.92) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `ui-glow-button-control ui-glow-button-frame--disabled service-profile-publish-save`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button) → [color!]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.button[data-variant="secondary"]` ×2

- **<button>** [visible] semantic: `button shadow-none`
  - tailwind (43): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundColor=color(srgb 0.0509804 0.0666667 0.… · backgroundImage=linear-gradient(145deg, rgba(255,… · color=rgba(255, 255, 255, 0.92) · borderTopColor=rgba(226, 232, 238, 0.18) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(2, 6, 16, 0.2) 0px 5px 14px … · borderTopLeftRadius=2.68435e+07px · minHeight=40.8px · opacity=1 · outlineColor=rgba(255, 255, 255, 0.92) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `shadow-none`
  - resting:
    - _0efahin._.css | .service-profile-form :is(button.button, a.button) → [color!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button)[data… → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
    - _0efahin._.css | .service-profile-subsection > .grid > .button → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `button shadow-none`
  - tailwind (43): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundColor=color(srgb 0.0509804 0.0666667 0.… · backgroundImage=linear-gradient(145deg, rgba(255,… · color=rgba(255, 255, 255, 0.92) · borderTopColor=rgba(226, 232, 238, 0.18) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(2, 6, 16, 0.2) 0px 5px 14px … · borderTopLeftRadius=2.68435e+07px · minHeight=40.8px · opacity=1 · outlineColor=rgba(255, 255, 255, 0.92) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `shadow-none`
  - resting:
    - _0efahin._.css | .service-profile-form :is(button.button, a.button) → [color!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button)[data… → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.documents-dropdown-trigger` ×2

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: color=rgb(230, 229, 227) · borderTopColor=rgb(230, 229, 227) · borderTopLeftRadius=13.76px · minHeight=48px · opacity=1 · outlineColor=rgb(230, 229, 227) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `documents-field`
  - resting:
    - _0efahin._.css | .service-profile-glow-control, .service-profile-glow-dr… → [color,outline-color,box-shadow!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-width!,border-right-width!,border-bottom-width!,border-left-width!,border-top-style!,border-right-style!,border-bottom-style!,border-left-style!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!]
    - _0efahin._.css | .workspace-feature-dropdown .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0efahin._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: color=rgb(230, 229, 227) · borderTopColor=rgb(230, 229, 227) · borderTopLeftRadius=13.76px · minHeight=48px · opacity=1 · outlineColor=rgb(230, 229, 227) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `documents-field`
  - resting:
    - _0efahin._.css | .service-profile-glow-control, .service-profile-glow-dr… → [color,outline-color,box-shadow!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-width!,border-right-width!,border-bottom-width!,border-left-width!,border-top-style!,border-right-style!,border-bottom-style!,border-left-style!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!]
    - _0efahin._.css | .workspace-feature-dropdown .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0efahin._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.dashboard-info-trigger-corner` ×1

- **<button>** [visible] semantic: `bg-transparent p-0 shadow-none outline-none transform-gpu dashboard-info-trigger-corner` · modules: PageInfoButton-module
  - tailwind (19): `inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-cent…`
  - computed: color=rgb(197, 113, 113) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(197, 113, 113) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 outline-none dashboard-info-trigger-corner`
  - resting:
    - _0efahin._.css | .PageInfoButton-module__sZW3Ea__trigger → [--page-info-icon-bg,--page-info-ring-color,--page-info-dot-color]
    - _0efahin._.css | .PageInfoButton-module__sZW3Ea__cornerTrigger → [opacity]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.back-button` ×1

- **<button>** [visible] semantic: `back-button bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - tailwind (36): `inline-flex h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] items-center justify-center b…`
  - computed: color=rgb(255, 255, 255) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · borderTopLeftRadius=999px · opacity=0.85 · outlineColor=rgb(255, 255, 255) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - resting:
    - _0blu2ae._.css | .back-button → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

## mono

### `.button[data-variant="primary"]` ×1

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled service-profile-publish-save` · modules: BorderGlow-module
  - tailwind (58): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(118% 102% at 50% … · color=rgba(230, 230, 230, 0.96) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=999px · minHeight=45.6px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgba(230, 230, 230, 0.96) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: color=rgba(223, 200, 200, 0.973) · boxShadow=rgba(0, 0, 0, 0.12) 0px 4.63776px… · outlineColor=rgba(223, 200, 200, 0.973)
  - dead@state: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled service-profile-publish-save`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,opacity,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.ui-glow… → [--glow-color!,--glow-color-60!,--glow-color-50!,--glow-color-40!,--glow-color-30!,--glow-color-20!,--glow-color-10!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button) → [color!]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.button[data-variant="secondary"]` ×2

- **<button>** [visible] semantic: `button shadow-none`
  - tailwind (43): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(118% 102% at 50% … · color=rgba(230, 230, 230, 0.96) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=2.68435e+07px · minHeight=40.8px · opacity=1 · outlineColor=rgba(230, 230, 230, 0.96) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: color=rgba(225, 208, 206, 0.992) · boxShadow=rgba(0, 0, 0, 0.055) 0px 2.35155p… · outlineColor=rgba(225, 208, 206, 0.992)
  - resting:
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,opacity,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button) → [color!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button)[data… → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
    - _0efahin._.css | .service-profile-subsection > .grid > .button → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `button shadow-none`
  - tailwind (43): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(118% 102% at 50% … · color=rgba(230, 230, 230, 0.96) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=2.68435e+07px · minHeight=40.8px · opacity=1 · outlineColor=rgba(230, 230, 230, 0.96) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: color=rgba(225, 208, 206, 0.992) · boxShadow=rgba(0, 0, 0, 0.055) 0px 2.35155p… · outlineColor=rgba(225, 208, 206, 0.992)
  - resting:
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,opacity,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button) → [color!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button)[data… → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.documents-dropdown-trigger` ×2

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: color=rgb(200, 200, 200) · borderTopColor=rgb(200, 200, 200) · borderTopLeftRadius=13.76px · minHeight=48px · opacity=1 · outlineColor=rgb(200, 200, 200) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `documents-field`
  - resting:
    - _0efahin._.css | .service-profile-glow-control, .service-profile-glow-dr… → [color,outline-color,box-shadow!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-width!,border-right-width!,border-bottom-width!,border-left-width!,border-top-style!,border-right-style!,border-bottom-style!,border-left-style!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!]
    - _0efahin._.css | .workspace-feature-dropdown .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0efahin._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: color=rgb(200, 200, 200) · borderTopColor=rgb(200, 200, 200) · borderTopLeftRadius=13.76px · minHeight=48px · opacity=1 · outlineColor=rgb(200, 200, 200) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `documents-field`
  - resting:
    - _0efahin._.css | .service-profile-glow-control, .service-profile-glow-dr… → [color,outline-color,box-shadow!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-width!,border-right-width!,border-bottom-width!,border-left-width!,border-top-style!,border-right-style!,border-bottom-style!,border-left-style!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!]
    - _0efahin._.css | .workspace-feature-dropdown .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0efahin._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.dashboard-info-trigger-corner` ×1

- **<button>** [visible] semantic: `bg-transparent p-0 shadow-none outline-none transform-gpu dashboard-info-trigger-corner` · modules: PageInfoButton-module
  - tailwind (19): `inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-cent…`
  - computed: color=rgb(197, 113, 113) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(197, 113, 113) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 outline-none dashboard-info-trigger-corner`
  - resting:
    - _0efahin._.css | .PageInfoButton-module__sZW3Ea__trigger → [--page-info-icon-bg,--page-info-ring-color,--page-info-dot-color]
    - _0efahin._.css | .PageInfoButton-module__sZW3Ea__cornerTrigger → [opacity]
    - _0efahin._.css | :root.theme-mono:not([data-contrast="hc"]) .PageInfoBut… → [--page-info-ring-color,--page-info-dot-color]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.back-button` ×1

- **<button>** [visible] semantic: `back-button bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - tailwind (36): `inline-flex h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] items-center justify-center b…`
  - computed: color=rgb(197, 113, 113) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · borderTopLeftRadius=999px · opacity=0.85 · outlineColor=rgb(197, 113, 113) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button`
  - resting:
    - _0blu2ae._.css | .back-button → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.back-bu… → [--back-arrow-color!,--back-dot-color!,color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

## hc

### `.button[data-variant="primary"]` ×1

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled service-profile-publish-save` · modules: BorderGlow-module
  - tailwind (58): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=999px · minHeight=45.6px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(255, 234, 0) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(124% 96% at 50% 6… · --btn-primary-bg-hover=linear-gradient(180deg, #ffea0014… · --btn-primary-text=#ffea00 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled service-profile-publish-save`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(.ui-glow-field, .ui-glow-b… → [--glow-color!,--glow-color-60!,--glow-color-50!,--glow-color-40!,--glow-color-30!,--glow-color-20!,--glow-color-10!]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button) → [color!]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0efahin._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | html[data-contrast="hc"] .BorderGlow-module__FDv2aW__ca… → [--card-bg,--glow-color,--glow-color-60,--glow-color-50,--glow-color-40,--glow-color-30,--glow-color-20,--glow-color-10,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,color!,box-shadow!]
    - _0efahin._.css | html[data-contrast="hc"] .BorderGlow-module__FDv2aW__ed… → [box-shadow!,opacity!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

### `.button[data-variant="secondary"]` ×2

- **<button>** [visible] semantic: `button shadow-none`
  - tailwind (43): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=2.68435e+07px · minHeight=40.8px · opacity=1 · outlineColor=rgb(255, 234, 0) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(124% 96% at 50% 6… · --btn-primary-bg-hover=linear-gradient(180deg, #ffea0014… · --btn-primary-text=#ffea00 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `shadow-none`
  - resting:
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button) → [color!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button)[data… → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
    - _0efahin._.css | .service-profile-subsection > .grid > .button → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

- **<button>** [visible] semantic: `button shadow-none`
  - tailwind (43): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=2.68435e+07px · minHeight=40.8px · opacity=1 · outlineColor=rgb(255, 234, 0) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(124% 96% at 50% 6… · --btn-primary-bg-hover=linear-gradient(180deg, #ffea0014… · --btn-primary-text=#ffea00 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `shadow-none`
  - resting:
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button) → [color!]
    - _0efahin._.css | .service-profile-form :is(button.button, a.button)[data… → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

### `.documents-dropdown-trigger` ×2

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopLeftRadius=13.76px · minHeight=48px · opacity=1 · outlineColor=rgb(255, 234, 0) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(124% 96% at 50% 6… · --btn-primary-bg-hover=linear-gradient(180deg, #ffea0014… · --btn-primary-text=#ffea00 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `documents-field`
  - resting:
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0efahin._.css | .service-profile-glow-control, .service-profile-glow-dr… → [color,outline-color,box-shadow!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-width!,border-right-width!,border-bottom-width!,border-left-width!,border-top-style!,border-right-style!,border-bottom-style!,border-left-style!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!]
    - _0efahin._.css | .workspace-feature-dropdown .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0efahin._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopLeftRadius=13.76px · minHeight=48px · opacity=1 · outlineColor=rgb(255, 234, 0) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(124% 96% at 50% 6… · --btn-primary-bg-hover=linear-gradient(180deg, #ffea0014… · --btn-primary-text=#ffea00 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `documents-field`
  - resting:
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0efahin._.css | .service-profile-glow-control, .service-profile-glow-dr… → [color,outline-color,box-shadow!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-width!,border-right-width!,border-bottom-width!,border-left-width!,border-top-style!,border-right-style!,border-bottom-style!,border-left-style!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!]
    - _0efahin._.css | .workspace-feature-dropdown .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0efahin._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0efahin._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
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
    - _0efahin._.css | .PageInfoButton-module__sZW3Ea__trigger → [--page-info-icon-bg,--page-info-ring-color,--page-info-dot-color]
    - _0efahin._.css | .PageInfoButton-module__sZW3Ea__cornerTrigger → [opacity]
    - _0efahin._.css | html[data-contrast="hc"] .PageInfoButton-module__sZW3Ea… → [--page-info-ring-color,--page-info-dot-color]
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

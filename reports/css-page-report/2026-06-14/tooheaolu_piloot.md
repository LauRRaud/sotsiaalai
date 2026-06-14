# /tooheaolu/piloot — primitive CSS report

## light

### `.button[data-variant="primary"]` ×1

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control` · modules: BorderGlow-module
  - tailwind (57): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% 16… · color=rgb(255, 255, 255) · borderTopColor=rgba(148, 163, 184, 0.08) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(15, 23, 42, 0.1) 0px 4px 10p… · borderTopLeftRadius=999px · minHeight=45.6px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(255, 255, 255) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #0f172a1a · --btn-primary-border=1px solid #94a3b814
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% 16… · borderTopColor=rgba(0, 0, 0, 0) · boxShadow=rgba(15, 23, 42, 0.1) 0px 6px 13p…
  - dead@state: `button ui-glow-button-control`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame, :root.theme-mi… → [box-shadow!]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame:hover:not(.ui-g… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.button[data-variant="secondary"]` ×3

- **<button>** [visible, disabled] semantic: `button shadow-none`
  - tailwind (42): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundColor=rgba(255, 255, 255, 0.04) · color=rgb(230, 229, 227) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · minHeight=45.6px · opacity=0.6 · outlineColor=rgb(230, 229, 227) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #0f172a1a · --btn-primary-border=1px solid #94a3b814
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.08) · borderTopColor=rgba(170, 190, 215, 0.38) · opacity=1
  - dead@state: `button`
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<a>** [visible] semantic: `button shadow-none`
  - tailwind (42): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundColor=rgba(255, 255, 255, 0.04) · color=rgb(230, 229, 227) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · minHeight=45.6px · opacity=1 · outlineColor=rgb(230, 229, 227) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #0f172a1a · --btn-primary-border=1px solid #94a3b814
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.08) · borderTopColor=rgba(170, 190, 215, 0.38)
  - dead@state: `button`
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<a>** [visible] semantic: `button shadow-none`
  - tailwind (42): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundColor=rgba(255, 255, 255, 0.04) · color=rgb(230, 229, 227) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · minHeight=45.6px · opacity=1 · outlineColor=rgb(230, 229, 227) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #0f172a1a · --btn-primary-border=1px solid #94a3b814
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.08) · borderTopColor=rgba(170, 190, 215, 0.38)
  - dead@state: `button`
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

## mid

### `.button[data-variant="primary"]` ×1

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control` · modules: BorderGlow-module
  - tailwind (57): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(92% 88% at 50% 16… · color=rgb(255, 255, 255) · boxShadow=rgba(38, 24, 22, 0.1) 0px 6px 14p… · borderTopLeftRadius=999px · minHeight=45.6px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(255, 255, 255) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 6px 14px #2618161a,
    inset 0… · --btn-primary-border=transparent
  - hover Δ: boxShadow=rgba(38, 24, 22, 0.1) 0px 6.30045…
  - resting:
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"] → [--btn-primary-bg-hover,--btn-primary-bg-active,--btn-primary-border-hover,--btn-primary-shadow-hover,backdrop-filter!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]::before → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame, :root.theme-mi… → [box-shadow!]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame:hover:not(.ui-g… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]:active → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]:active:… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,opacity!]

### `.button[data-variant="secondary"]` ×3

- **<button>** [visible, disabled] semantic: `button shadow-none`
  - tailwind (42): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundColor=rgba(255, 255, 255, 0.04) · color=rgb(230, 229, 227) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · minHeight=45.6px · opacity=0.6 · outlineColor=rgb(230, 229, 227) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 6px 14px #2618161a,
    inset 0… · --btn-primary-border=transparent
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.08) · borderTopColor=rgba(170, 190, 215, 0.38) · opacity=1
  - dead@state: `button`
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<a>** [visible] semantic: `button shadow-none`
  - tailwind (42): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundColor=rgba(255, 255, 255, 0.04) · color=rgb(230, 229, 227) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · minHeight=45.6px · opacity=1 · outlineColor=rgb(230, 229, 227) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 6px 14px #2618161a,
    inset 0… · --btn-primary-border=transparent
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.08) · borderTopColor=rgba(170, 190, 215, 0.38)
  - dead@state: `button`
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<a>** [visible] semantic: `button shadow-none`
  - tailwind (42): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundColor=rgba(255, 255, 255, 0.04) · color=rgb(230, 229, 227) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · minHeight=45.6px · opacity=1 · outlineColor=rgb(230, 229, 227) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 6px 14px #2618161a,
    inset 0… · --btn-primary-border=transparent
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.08) · borderTopColor=rgba(170, 190, 215, 0.38)
  - dead@state: `button`
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

## dark

### `.button[data-variant="primary"]` ×1

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control` · modules: BorderGlow-module
  - tailwind (57): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgb(255, 255, 255) · borderTopStyle=solid · boxShadow=rgba(255, 255, 255, 0.06) 0px 1px… · borderTopLeftRadius=999px · minHeight=45.6px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(255, 255, 255) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=inset 0 1px 0 #ffffff0f,
    0 5p… · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% -1… · boxShadow=rgba(255, 255, 255, 0.08) 0px 1px…
  - dead@state: `button ui-glow-button-control`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.button[data-variant="secondary"]` ×3

- **<button>** [visible, disabled] semantic: `button shadow-none`
  - tailwind (42): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundColor=rgba(255, 255, 255, 0.04) · color=rgb(230, 229, 227) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · minHeight=45.6px · opacity=0.6 · outlineColor=rgb(230, 229, 227) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=inset 0 1px 0 #ffffff0f,
    0 5p… · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.08) · borderTopColor=rgba(170, 190, 215, 0.38) · opacity=1
  - dead@state: `button`
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<a>** [visible] semantic: `button shadow-none`
  - tailwind (42): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundColor=rgba(255, 255, 255, 0.04) · color=rgb(230, 229, 227) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · minHeight=45.6px · opacity=1 · outlineColor=rgb(230, 229, 227) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=inset 0 1px 0 #ffffff0f,
    0 5p… · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.08) · borderTopColor=rgba(170, 190, 215, 0.38)
  - dead@state: `button`
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<a>** [visible] semantic: `button shadow-none`
  - tailwind (42): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundColor=rgba(255, 255, 255, 0.04) · color=rgb(230, 229, 227) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · minHeight=45.6px · opacity=1 · outlineColor=rgb(230, 229, 227) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=inset 0 1px 0 #ffffff0f,
    0 5p… · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.08) · borderTopColor=rgba(170, 190, 215, 0.38)
  - dead@state: `button`
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

## night

### `.button[data-variant="primary"]` ×1

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control` · modules: BorderGlow-module
  - tailwind (57): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgb(255, 255, 255) · borderTopStyle=solid · boxShadow=rgba(220, 236, 255, 0.1) 0px 1px … · borderTopLeftRadius=999px · minHeight=45.6px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(255, 255, 255) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=inset 0 1px 0 #dcecff1a,
    0 5p… · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% -1… · boxShadow=rgba(220, 236, 255, 0.12) 0px 1px…
  - dead@state: `button ui-glow-button-control`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.button[data-variant="secondary"]` ×3

- **<button>** [visible, disabled] semantic: `button shadow-none`
  - tailwind (42): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundColor=rgba(255, 255, 255, 0.04) · color=rgb(230, 229, 227) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · minHeight=45.6px · opacity=0.6 · outlineColor=rgb(230, 229, 227) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=inset 0 1px 0 #dcecff1a,
    0 5p… · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.08) · borderTopColor=rgba(170, 190, 215, 0.38) · opacity=1
  - dead@state: `button`
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<a>** [visible] semantic: `button shadow-none`
  - tailwind (42): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundColor=rgba(255, 255, 255, 0.04) · color=rgb(230, 229, 227) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · minHeight=45.6px · opacity=1 · outlineColor=rgb(230, 229, 227) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=inset 0 1px 0 #dcecff1a,
    0 5p… · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.08) · borderTopColor=rgba(170, 190, 215, 0.38)
  - dead@state: `button`
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<a>** [visible] semantic: `button shadow-none`
  - tailwind (42): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundColor=rgba(255, 255, 255, 0.04) · color=rgb(230, 229, 227) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · minHeight=45.6px · opacity=1 · outlineColor=rgb(230, 229, 227) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=inset 0 1px 0 #dcecff1a,
    0 5p… · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=rgba(255, 255, 255, 0.08) · borderTopColor=rgba(170, 190, 215, 0.38)
  - dead@state: `button`
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

## mono

### `.button[data-variant="primary"]` ×1

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control` · modules: BorderGlow-module
  - tailwind (57): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(118% 102% at 50% … · color=rgba(230, 230, 230, 0.96) · borderTopStyle=solid · boxShadow=rgba(214, 214, 214, 0.08) 0px 1px… · borderTopLeftRadius=999px · minHeight=45.6px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgba(230, 230, 230, 0.96) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=inset 0 1px 0 #d6d6d614,
    0 5p… · --btn-primary-border=0 solid transparent
  - hover Δ: color=rgba(229, 223, 223, 0.965) · boxShadow=rgba(214, 214, 214, 0.08) 0px 1px… · outlineColor=rgba(229, 223, 223, 0.965)
  - dead@state: `button ui-glow-button-frame ui-glow-button-control`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,opacity,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.ui-glow… → [--glow-color!,--glow-color-60!,--glow-color-50!,--glow-color-40!,--glow-color-30!,--glow-color-20!,--glow-color-10!]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) .ui-glow-but… → [box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.button[data-variant="secondary"]` ×3

- **<button>** [visible, disabled] semantic: `button shadow-none`
  - tailwind (42): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(118% 102% at 50% … · color=rgba(230, 230, 230, 0.96) · borderTopStyle=solid · boxShadow=rgba(214, 214, 214, 0.08) 0px 1px… · borderTopLeftRadius=2.68435e+07px · minHeight=45.6px · opacity=0.972602 · outlineColor=rgba(230, 230, 230, 0.96) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=inset 0 1px 0 #d6d6d614,
    0 5p… · --btn-primary-border=0 solid transparent
  - hover Δ: color=rgba(229, 223, 222, 0.99) · boxShadow=rgba(214, 214, 214, 0.08) 0px 1px… · opacity=0.654691 · outlineColor=rgba(229, 223, 222, 0.99)
  - resting:
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,opacity,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<a>** [visible] semantic: `button shadow-none`
  - tailwind (42): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(118% 102% at 50% … · color=rgba(230, 230, 230, 0.96) · borderTopStyle=solid · boxShadow=rgba(214, 214, 214, 0.08) 0px 1px… · borderTopLeftRadius=2.68435e+07px · minHeight=45.6px · opacity=1 · outlineColor=rgba(230, 230, 230, 0.96) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=inset 0 1px 0 #d6d6d614,
    0 5p… · --btn-primary-border=0 solid transparent
  - hover Δ: color=rgba(229, 223, 222, 0.99) · boxShadow=rgba(214, 214, 214, 0.08) 0px 1px… · outlineColor=rgba(229, 223, 222, 0.99)
  - resting:
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,opacity,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<a>** [visible] semantic: `button shadow-none`
  - tailwind (42): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(118% 102% at 50% … · color=rgba(230, 230, 230, 0.96) · borderTopStyle=solid · boxShadow=rgba(214, 214, 214, 0.08) 0px 1px… · borderTopLeftRadius=2.68435e+07px · minHeight=45.6px · opacity=1 · outlineColor=rgba(230, 230, 230, 0.96) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=inset 0 1px 0 #d6d6d614,
    0 5p… · --btn-primary-border=0 solid transparent
  - hover Δ: color=rgba(229, 223, 222, 0.99) · boxShadow=rgba(214, 214, 214, 0.08) 0px 1px… · outlineColor=rgba(229, 223, 222, 0.99)
  - resting:
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,opacity,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

## hc

### `.button[data-variant="primary"]` ×1

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control` · modules: BorderGlow-module
  - tailwind (57): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=999px · minHeight=45.6px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(255, 234, 0) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(124% 96% at 50% 6… · --btn-primary-bg-hover=linear-gradient(180deg, #ffea0014… · --btn-primary-text=#ffea00 · --btn-primary-shadow=none · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `ui-glow-button-frame ui-glow-button-control`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(.ui-glow-field, .ui-glow-b… → [--glow-color!,--glow-color-60!,--glow-color-50!,--glow-color-40!,--glow-color-30!,--glow-color-20!,--glow-color-10!]
    - _0blu2ae._.css | html[data-contrast="hc"] body a → [color,text-decoration-color]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body, html[data-contrast="hc"]… → [color]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - components_ui_BorderGlow_module_0-_ceh5.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - components_ui_BorderGlow_module_0-_ceh5.css | html[data-contrast="hc"] .BorderGlow-module__FDv2aW__ca… → [--card-bg,--glow-color,--glow-color-60,--glow-color-50,--glow-color-40,--glow-color-30,--glow-color-20,--glow-color-10,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,color!,box-shadow!]
    - components_ui_BorderGlow_module_0-_ceh5.css | html[data-contrast="hc"] .BorderGlow-module__FDv2aW__ed… → [box-shadow!,opacity!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
    - _0blu2ae._.css | html[data-contrast="hc"] .ui-glow-button-frame:hover:no… → [box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

### `.button[data-variant="secondary"]` ×3

- **<button>** [visible] semantic: `button shadow-none`
  - tailwind (42): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=2.68435e+07px · minHeight=45.6px · opacity=1 · outlineColor=rgb(255, 234, 0) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(124% 96% at 50% 6… · --btn-primary-bg-hover=linear-gradient(180deg, #ffea0014… · --btn-primary-text=#ffea00 · --btn-primary-shadow=none · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `button shadow-none`
  - resting:
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

- **<a>** [visible] semantic: `button shadow-none`
  - tailwind (42): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=2.68435e+07px · minHeight=45.6px · opacity=1 · outlineColor=rgb(255, 234, 0) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(124% 96% at 50% 6… · --btn-primary-bg-hover=linear-gradient(180deg, #ffea0014… · --btn-primary-text=#ffea00 · --btn-primary-shadow=none · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `shadow-none`
  - resting:
    - _0blu2ae._.css | html[data-contrast="hc"] body a → [color,text-decoration-color]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body, html[data-contrast="hc"]… → [color]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

- **<a>** [visible] semantic: `button shadow-none`
  - tailwind (42): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=2.68435e+07px · minHeight=45.6px · opacity=1 · outlineColor=rgb(255, 234, 0) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(124% 96% at 50% 6… · --btn-primary-bg-hover=linear-gradient(180deg, #ffea0014… · --btn-primary-text=#ffea00 · --btn-primary-shadow=none · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `shadow-none`
  - resting:
    - _0blu2ae._.css | html[data-contrast="hc"] body a → [color,text-decoration-color]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body, html[data-contrast="hc"]… → [color]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

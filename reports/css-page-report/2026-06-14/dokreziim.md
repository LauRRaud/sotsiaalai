# /dokreziim — primitive CSS report

## light

### `.button[data-variant="primary"]` ×2

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% 16… · color=rgb(51, 65, 85) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(51, 65, 85) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `button ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame, :root.theme-mi… → [box-shadow!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% 16… · color=rgb(34, 34, 34) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(34, 34, 34) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% 16… · boxShadow=rgba(0, 0, 0, 0.11) 0px 6px 13px …
  - dead@state: `button ui-glow-button-control drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame, :root.theme-mi… → [box-shadow!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame:hover:not(.ui-g… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.invite-primary-btn` ×3

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% 16… · color=rgb(51, 65, 85) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(51, 65, 85) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `button ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame, :root.theme-mi… → [box-shadow!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% 16… · color=rgb(34, 34, 34) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(34, 34, 34) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% 16… · boxShadow=rgba(0, 0, 0, 0.11) 0px 6px 13px …
  - dead@state: `button ui-glow-button-control drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame, :root.theme-mi… → [box-shadow!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame:hover:not(.ui-g… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible, disabled] semantic: `chat-send-btn invite-primary-btn pointer-events-auto`
  - tailwind (22): `relative z-[2] !h-[calc(var(--inputbar-h)-2px)] !w-[calc(var(--inputbar-h)-2px)] !min-h-[calc(var(--inputbar-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% 16… · color=rgb(31, 41, 55) · borderTopStyle=solid · boxShadow=rgba(15, 23, 42, 0.1) 0px 5px 12p… · borderTopLeftRadius=9999px · minHeight=47.28px · opacity=1 · outlineColor=rgb(31, 41, 55) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `invite-primary-btn pointer-events-auto`
  - resting:
    - _0r-x3me._.css | body .chat-inputbar .chat-listen-btn, body .chat-inputb… → [border-top-left-radius!,border-top-right-radius!,border-bottom-right-radius!,border-bottom-left-radius!]
    - _0r-x3me._.css | :root.theme-light .chat-inputbar, :root.theme-light .ch… → [--chat-action-size,--chat-inputbar-bg,--chat-inputbar-bg-hover,--chat-inputbar-bg-focus,--chat-inputbar-border,--chat-inputbar-border-hover,--chat-inputbar-shadow,--chat-inputbar-shadow-hover,--chat-inputbar-shadow-focus,--chat-action-btn-bg,--chat-action-btn-bg-hover,--chat-action-btn-bg-active,--chat-action-btn-border,--chat-action-btn-border-active,--chat-action-btn-shadow,--chat-action-btn-shadow-hover,--chat-action-btn-shadow-focus,--chat-action-btn-shadow-active,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow,color]
    - _0r-x3me._.css | :root.theme-light .chat-inputbar .chat-send-btn → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0r-x3me._.css | :root.theme-light .documents-workspace-page--library .d… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0r-x3me._.css | :root.theme-light .chat-inputbar .chat-listen-btn:activ… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]

### `.drawer-pill-btn` ×2

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% 16… · color=rgb(51, 65, 85) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(51, 65, 85) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `button ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame, :root.theme-mi… → [box-shadow!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% 16… · color=rgb(34, 34, 34) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(34, 34, 34) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% 16… · boxShadow=rgba(0, 0, 0, 0.11) 0px 6px 13px …
  - dead@state: `button ui-glow-button-control drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame, :root.theme-mi… → [box-shadow!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame:hover:not(.ui-g… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.documents-dropdown-trigger` ×4

- **<button>** [visible, disabled] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% 16… · color=rgb(31, 41, 55) · borderTopColor=rgba(148, 163, 184, 0.08) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(15, 23, 42, 0.1) 0px 4px 10p… · borderTopLeftRadius=999px · minHeight=48px · opacity=0.55 · outlineColor=rgb(31, 41, 55) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% 16… · boxShadow=rgba(15, 23, 42, 0.1) 0px 6px 13p…
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% 16… · color=rgb(31, 41, 55) · borderTopColor=rgba(148, 163, 184, 0.08) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(15, 23, 42, 0.1) 0px 4px 10p… · borderTopLeftRadius=999px · minHeight=48px · opacity=1 · outlineColor=rgb(31, 41, 55) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% 16… · boxShadow=rgba(15, 23, 42, 0.1) 0px 6px 13p…
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% 16… · color=rgb(31, 41, 55) · borderTopColor=rgba(148, 163, 184, 0.08) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(15, 23, 42, 0.1) 0px 4px 10p… · borderTopLeftRadius=999px · minHeight=48px · opacity=1 · outlineColor=rgb(31, 41, 55) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% 16… · boxShadow=rgba(15, 23, 42, 0.1) 0px 6px 13p…
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% 16… · color=rgb(31, 41, 55) · borderTopColor=rgba(148, 163, 184, 0.08) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(15, 23, 42, 0.1) 0px 4px 10p… · borderTopLeftRadius=999px · minHeight=48px · opacity=1 · outlineColor=rgb(31, 41, 55) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% 16… · boxShadow=rgba(15, 23, 42, 0.1) 0px 6px 13p…
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.dashboard-info-trigger-corner` ×1

- **<button>** [visible] semantic: `bg-transparent p-0 shadow-none outline-none transform-gpu dashboard-info-trigger-corner` · modules: PageInfoButton-module
  - tailwind (19): `inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-cent…`
  - computed: color=rgb(122, 58, 56) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(122, 58, 56) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 outline-none dashboard-info-trigger-corner`
  - resting:
    - _0r-x3me._.css | .PageInfoButton-module__sZW3Ea__trigger → [--page-info-icon-bg,--page-info-ring-color,--page-info-dot-color]
    - _0r-x3me._.css | .PageInfoButton-module__sZW3Ea__cornerTrigger → [opacity]
    - _0r-x3me._.css | :is(:root.theme-light:not(.theme-mid) .PageInfoButton-m… → [--page-info-ring-color,--page-info-dot-color]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.back-button` ×1

- **<button>** [visible] semantic: `back-button bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button documents-scroll-back-button`
  - tailwind (36): `inline-flex h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] items-center justify-center b…`
  - computed: color=rgb(255, 255, 255) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · borderTopLeftRadius=999px · opacity=1 · outlineColor=rgb(255, 255, 255) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button documents-scroll-back-button`
  - resting:
    - _0blu2ae._.css | .back-button → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.chat-send-btn` ×1

- **<button>** [visible, disabled] semantic: `chat-send-btn invite-primary-btn pointer-events-auto`
  - tailwind (22): `relative z-[2] !h-[calc(var(--inputbar-h)-2px)] !w-[calc(var(--inputbar-h)-2px)] !min-h-[calc(var(--inputbar-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% 16… · color=rgb(31, 41, 55) · borderTopStyle=solid · boxShadow=rgba(15, 23, 42, 0.1) 0px 5px 12p… · borderTopLeftRadius=9999px · minHeight=47.28px · opacity=1 · outlineColor=rgb(31, 41, 55) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% 16… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% 16… · --btn-primary-text=#1f2937eb · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `invite-primary-btn pointer-events-auto`
  - resting:
    - _0r-x3me._.css | body .chat-inputbar .chat-listen-btn, body .chat-inputb… → [border-top-left-radius!,border-top-right-radius!,border-bottom-right-radius!,border-bottom-left-radius!]
    - _0r-x3me._.css | :root.theme-light .chat-inputbar, :root.theme-light .ch… → [--chat-action-size,--chat-inputbar-bg,--chat-inputbar-bg-hover,--chat-inputbar-bg-focus,--chat-inputbar-border,--chat-inputbar-border-hover,--chat-inputbar-shadow,--chat-inputbar-shadow-hover,--chat-inputbar-shadow-focus,--chat-action-btn-bg,--chat-action-btn-bg-hover,--chat-action-btn-bg-active,--chat-action-btn-border,--chat-action-btn-border-active,--chat-action-btn-shadow,--chat-action-btn-shadow-hover,--chat-action-btn-shadow-focus,--chat-action-btn-shadow-active,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow,color]
    - _0r-x3me._.css | :root.theme-light .chat-inputbar .chat-send-btn → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0r-x3me._.css | :root.theme-light .documents-workspace-page--library .d… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0r-x3me._.css | :root.theme-light .chat-inputbar .chat-listen-btn:activ… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]

## mid

### `.button[data-variant="primary"]` ×2

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(92% 88% at 50% 16… · color=rgb(51, 65, 85) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(51, 65, 85) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: borderTopColor=rgba(126, 95, 88, 0.16) · boxShadow=rgba(38, 24, 22, 0.1) 0px 7px 16p…
  - resting:
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"] → [--btn-primary-bg-hover,--btn-primary-bg-active,--btn-primary-border-hover,--btn-primary-shadow-hover,backdrop-filter!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]::before → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame, :root.theme-mi… → [box-shadow!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]:active → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]:active:… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,opacity!]

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(92% 88% at 50% 16… · color=rgb(44, 51, 64) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(44, 51, 64) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: boxShadow=rgba(38, 24, 22, 0.1) 0px 7px 16p…
  - resting:
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"] → [--btn-primary-bg-hover,--btn-primary-bg-active,--btn-primary-border-hover,--btn-primary-shadow-hover,backdrop-filter!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]::before → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame, :root.theme-mi… → [box-shadow!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame:hover:not(.ui-g… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]:active → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]:active:… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,opacity!]

### `.invite-primary-btn` ×3

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(92% 88% at 50% 16… · color=rgb(51, 65, 85) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(51, 65, 85) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: boxShadow=rgba(38, 24, 22, 0.1) 0px 7px 16p…
  - dead@state: `ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"] → [--btn-primary-bg-hover,--btn-primary-bg-active,--btn-primary-border-hover,--btn-primary-shadow-hover,backdrop-filter!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]::before → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame, :root.theme-mi… → [box-shadow!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]:active → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]:active:… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,opacity!]

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(92% 88% at 50% 16… · color=rgb(44, 51, 64) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(44, 51, 64) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: boxShadow=rgba(38, 24, 22, 0.1) 0px 7px 16p…
  - dead@state: `ui-glow-button-control drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"] → [--btn-primary-bg-hover,--btn-primary-bg-active,--btn-primary-border-hover,--btn-primary-shadow-hover,backdrop-filter!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]::before → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame, :root.theme-mi… → [box-shadow!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame:hover:not(.ui-g… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]:active → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]:active:… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,opacity!]

- **<button>** [visible, disabled] semantic: `chat-send-btn invite-primary-btn pointer-events-auto`
  - tailwind (22): `relative z-[2] !h-[calc(var(--inputbar-h)-2px)] !w-[calc(var(--inputbar-h)-2px)] !min-h-[calc(var(--inputbar-…`
  - computed: backgroundImage=radial-gradient(92% 88% at 50% 16… · color=rgb(47, 58, 74) · borderTopStyle=solid · boxShadow=rgba(15, 23, 42, 0.1) 0px 5px 12p… · borderTopLeftRadius=9999px · minHeight=47.28px · opacity=1 · outlineColor=rgb(47, 58, 74) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `invite-primary-btn pointer-events-auto`
  - resting:
    - _0r-x3me._.css | body .chat-inputbar .chat-listen-btn, body .chat-inputb… → [border-top-left-radius!,border-top-right-radius!,border-bottom-right-radius!,border-bottom-left-radius!]
    - _0r-x3me._.css | :root.theme-light .chat-inputbar, :root.theme-light .ch… → [--chat-action-size,--chat-inputbar-bg,--chat-inputbar-bg-hover,--chat-inputbar-bg-focus,--chat-inputbar-border,--chat-inputbar-border-hover,--chat-inputbar-shadow,--chat-inputbar-shadow-hover,--chat-inputbar-shadow-focus,--chat-action-btn-bg,--chat-action-btn-bg-hover,--chat-action-btn-bg-active,--chat-action-btn-border,--chat-action-btn-border-active,--chat-action-btn-shadow,--chat-action-btn-shadow-hover,--chat-action-btn-shadow-focus,--chat-action-btn-shadow-active,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow,color]
    - _0r-x3me._.css | :root.theme-light .chat-inputbar .chat-send-btn → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0r-x3me._.css | :root.theme-mid .chat-inputbar, :root.theme-mid .chat-i… → [--chat-action-size,color,--chat-inputbar-bg,--chat-inputbar-bg-hover,--chat-inputbar-bg-focus,--chat-inputbar-overlay-bg,--chat-inputbar-shadow,--chat-inputbar-shadow-hover,--chat-inputbar-shadow-focus,--chat-inputbar-btn-bg,--chat-inputbar-btn-bg-hover,--chat-inputbar-btn-bg-focus,--chat-inputbar-btn-overlay-bg,--chat-inputbar-btn-shadow,--chat-inputbar-btn-shadow-hover,--chat-inputbar-btn-shadow-focus]
    - _0r-x3me._.css | :root.theme-mid .chat-inputbar .chat-send-btn → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,backdrop-filter!,border-top-width!,border-right-width!,border-bottom-width!,border-left-width!,border-top-style!,border-right-style!,border-bottom-style!,border-left-style!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!]
    - _0r-x3me._.css | :root.theme-mid .chat-inputbar .chat-send-btn::before → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,opacity,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0r-x3me._.css | :root.theme-light .documents-workspace-page--library .d… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0r-x3me._.css | :root.theme-light .chat-inputbar .chat-listen-btn:activ… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]

### `.drawer-pill-btn` ×2

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(92% 88% at 50% 16… · color=rgb(51, 65, 85) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(51, 65, 85) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: boxShadow=rgba(38, 24, 22, 0.1) 0px 7px 16p…
  - dead@state: `ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"] → [--btn-primary-bg-hover,--btn-primary-bg-active,--btn-primary-border-hover,--btn-primary-shadow-hover,backdrop-filter!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]::before → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame, :root.theme-mi… → [box-shadow!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]:active → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]:active:… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,opacity!]

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(92% 88% at 50% 16… · color=rgb(44, 51, 64) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(44, 51, 64) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: boxShadow=rgba(38, 24, 22, 0.1) 0px 7px 16p…
  - dead@state: `ui-glow-button-control drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"] → [--btn-primary-bg-hover,--btn-primary-bg-active,--btn-primary-border-hover,--btn-primary-shadow-hover,backdrop-filter!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]::before → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame, :root.theme-mi… → [box-shadow!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root.theme-light .ui-glow-button-frame:hover:not(.ui-g… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]:active → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mid .button[data-variant="primary"]:active:… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,opacity!]

### `.documents-dropdown-trigger` ×4

- **<button>** [visible, disabled] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=radial-gradient(92% 88% at 50% 16… · color=rgb(47, 58, 74) · borderTopColor=rgba(126, 95, 88, 0.16) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(38, 24, 22, 0.1) 0px 6px 14p… · borderTopLeftRadius=999px · minHeight=48px · opacity=0.55 · outlineColor=rgb(47, 58, 74) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(92% 88% at 50% 16… · boxShadow=rgba(38, 24, 22, 0.1) 0px 7px 16p…
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=radial-gradient(92% 88% at 50% 16… · color=rgb(47, 58, 74) · borderTopColor=rgba(126, 95, 88, 0.16) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(38, 24, 22, 0.1) 0px 6px 14p… · borderTopLeftRadius=999px · minHeight=48px · opacity=1 · outlineColor=rgb(47, 58, 74) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(92% 88% at 50% 16… · boxShadow=rgba(38, 24, 22, 0.1) 0px 7px 16p…
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=radial-gradient(92% 88% at 50% 16… · color=rgb(47, 58, 74) · borderTopColor=rgba(126, 95, 88, 0.16) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(38, 24, 22, 0.1) 0px 6px 14p… · borderTopLeftRadius=999px · minHeight=48px · opacity=1 · outlineColor=rgb(47, 58, 74) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(92% 88% at 50% 16… · boxShadow=rgba(38, 24, 22, 0.1) 0px 7px 16p…
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=radial-gradient(92% 88% at 50% 16… · color=rgb(47, 58, 74) · borderTopColor=rgba(126, 95, 88, 0.16) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(38, 24, 22, 0.1) 0px 6px 14p… · borderTopLeftRadius=999px · minHeight=48px · opacity=1 · outlineColor=rgb(47, 58, 74) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(92% 88% at 50% 16… · boxShadow=rgba(38, 24, 22, 0.1) 0px 7px 16p…
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.dashboard-info-trigger-corner` ×1

- **<button>** [visible] semantic: `bg-transparent p-0 shadow-none outline-none transform-gpu dashboard-info-trigger-corner` · modules: PageInfoButton-module
  - tailwind (19): `inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-cent…`
  - computed: color=rgb(122, 58, 56) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(122, 58, 56) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 outline-none dashboard-info-trigger-corner`
  - resting:
    - _0r-x3me._.css | .PageInfoButton-module__sZW3Ea__trigger → [--page-info-icon-bg,--page-info-ring-color,--page-info-dot-color]
    - _0r-x3me._.css | .PageInfoButton-module__sZW3Ea__cornerTrigger → [opacity]
    - _0r-x3me._.css | :is(:root.theme-light:not(.theme-mid) .PageInfoButton-m… → [--page-info-ring-color,--page-info-dot-color]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.back-button` ×1

- **<button>** [visible] semantic: `back-button bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button documents-scroll-back-button`
  - tailwind (36): `inline-flex h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] items-center justify-center b…`
  - computed: color=rgb(255, 255, 255) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · borderTopLeftRadius=999px · opacity=1 · outlineColor=rgb(255, 255, 255) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button documents-scroll-back-button`
  - resting:
    - _0blu2ae._.css | .back-button → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.chat-send-btn` ×1

- **<button>** [visible, disabled] semantic: `chat-send-btn invite-primary-btn pointer-events-auto`
  - tailwind (22): `relative z-[2] !h-[calc(var(--inputbar-h)-2px)] !w-[calc(var(--inputbar-h)-2px)] !min-h-[calc(var(--inputbar-…`
  - computed: backgroundImage=radial-gradient(92% 88% at 50% 16… · color=rgb(47, 58, 74) · borderTopStyle=solid · boxShadow=rgba(15, 23, 42, 0.1) 0px 5px 12p… · borderTopLeftRadius=9999px · minHeight=47.28px · opacity=1 · outlineColor=rgb(47, 58, 74) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(92% 88% at 50% 16… · --btn-primary-bg-hover=radial-gradient(92% 88% at 50% 16… · --btn-primary-text=#2f3a4a · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `invite-primary-btn pointer-events-auto`
  - resting:
    - _0r-x3me._.css | body .chat-inputbar .chat-listen-btn, body .chat-inputb… → [border-top-left-radius!,border-top-right-radius!,border-bottom-right-radius!,border-bottom-left-radius!]
    - _0r-x3me._.css | :root.theme-light .chat-inputbar, :root.theme-light .ch… → [--chat-action-size,--chat-inputbar-bg,--chat-inputbar-bg-hover,--chat-inputbar-bg-focus,--chat-inputbar-border,--chat-inputbar-border-hover,--chat-inputbar-shadow,--chat-inputbar-shadow-hover,--chat-inputbar-shadow-focus,--chat-action-btn-bg,--chat-action-btn-bg-hover,--chat-action-btn-bg-active,--chat-action-btn-border,--chat-action-btn-border-active,--chat-action-btn-shadow,--chat-action-btn-shadow-hover,--chat-action-btn-shadow-focus,--chat-action-btn-shadow-active,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow,color]
    - _0r-x3me._.css | :root.theme-light .chat-inputbar .chat-send-btn → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0r-x3me._.css | :root.theme-mid .chat-inputbar, :root.theme-mid .chat-i… → [--chat-action-size,color,--chat-inputbar-bg,--chat-inputbar-bg-hover,--chat-inputbar-bg-focus,--chat-inputbar-overlay-bg,--chat-inputbar-shadow,--chat-inputbar-shadow-hover,--chat-inputbar-shadow-focus,--chat-inputbar-btn-bg,--chat-inputbar-btn-bg-hover,--chat-inputbar-btn-bg-focus,--chat-inputbar-btn-overlay-bg,--chat-inputbar-btn-shadow,--chat-inputbar-btn-shadow-hover,--chat-inputbar-btn-shadow-focus]
    - _0r-x3me._.css | :root.theme-mid .chat-inputbar .chat-send-btn → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,backdrop-filter!,border-top-width!,border-right-width!,border-bottom-width!,border-left-width!,border-top-style!,border-right-style!,border-bottom-style!,border-left-style!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!]
    - _0r-x3me._.css | :root.theme-mid .chat-inputbar .chat-send-btn::before → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,opacity,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0r-x3me._.css | :root.theme-light .documents-workspace-page--library .d… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0r-x3me._.css | :root.theme-light .chat-inputbar .chat-listen-btn:activ… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]

## dark

### `.button[data-variant="primary"]` ×2

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgb(242, 242, 242) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(242, 242, 242) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `button ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgb(242, 242, 242) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(242, 242, 242) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% -1… · boxShadow=rgba(0, 0, 0, 0.11) 0px 6px 13px …
  - dead@state: `button ui-glow-button-control drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

### `.invite-primary-btn` ×3

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgb(242, 242, 242) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(242, 242, 242) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `button ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgb(242, 242, 242) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(242, 242, 242) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% -1… · boxShadow=rgba(0, 0, 0, 0.11) 0px 6px 13px …
  - dead@state: `button ui-glow-button-control drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

- **<button>** [visible, disabled] semantic: `chat-send-btn invite-primary-btn pointer-events-auto`
  - tailwind (22): `relative z-[2] !h-[calc(var(--inputbar-h)-2px)] !w-[calc(var(--inputbar-h)-2px)] !min-h-[calc(var(--inputbar-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgba(255, 255, 255, 0.3) · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=9999px · minHeight=47.28px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgba(255, 255, 255, 0.3) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% -1… · boxShadow=rgba(0, 0, 0, 0.11) 0px 6px 13px …
  - dead@state: `invite-primary-btn pointer-events-auto`
  - resting:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0r-x3me._.css | body .chat-inputbar .chat-listen-btn, body .chat-inputb… → [border-top-left-radius!,border-top-right-radius!,border-bottom-right-radius!,border-bottom-left-radius!]
    - _0r-x3me._.css | :root:not(.theme-light):not(.theme-mid) .chat-inputbar … → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-color,box-shadow,background-origin,background-clip]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

### `.drawer-pill-btn` ×2

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgb(242, 242, 242) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(242, 242, 242) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `button ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgb(242, 242, 242) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(242, 242, 242) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% -1… · boxShadow=rgba(0, 0, 0, 0.11) 0px 6px 13px …
  - dead@state: `button ui-glow-button-control drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

### `.documents-dropdown-trigger` ×4

- **<button>** [visible, disabled] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=color(srgb 0.124908 0.124908 0.12… · color=rgb(230, 229, 227) · borderTopColor=rgba(255, 255, 255, 0.06) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.12) 0px 8px 18px … · borderTopLeftRadius=999px · minHeight=48px · opacity=0.55 · outlineColor=rgb(230, 229, 227) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=color(srgb 0.209302 0.209302 0.20… · boxShadow=rgba(0, 0, 0, 0.16) 0px 10px 22px…
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=color(srgb 0.124908 0.124908 0.12… · color=rgb(230, 229, 227) · borderTopColor=rgba(255, 255, 255, 0.06) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.12) 0px 8px 18px … · borderTopLeftRadius=999px · minHeight=48px · opacity=1 · outlineColor=rgb(230, 229, 227) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=color(srgb 0.209302 0.209302 0.20… · boxShadow=rgba(0, 0, 0, 0.16) 0px 10px 22px…
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=color(srgb 0.124908 0.124908 0.12… · color=rgb(230, 229, 227) · borderTopColor=rgba(255, 255, 255, 0.06) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.12) 0px 8px 18px … · borderTopLeftRadius=999px · minHeight=48px · opacity=1 · outlineColor=rgb(230, 229, 227) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=color(srgb 0.209302 0.209302 0.20… · boxShadow=rgba(0, 0, 0, 0.16) 0px 10px 22px…
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=color(srgb 0.124908 0.124908 0.12… · color=rgb(230, 229, 227) · borderTopColor=rgba(255, 255, 255, 0.06) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.12) 0px 8px 18px … · borderTopLeftRadius=999px · minHeight=48px · opacity=1 · outlineColor=rgb(230, 229, 227) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=color(srgb 0.209302 0.209302 0.20… · boxShadow=rgba(0, 0, 0, 0.16) 0px 10px 22px…
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.dashboard-info-trigger-corner` ×1

- **<button>** [visible] semantic: `bg-transparent p-0 shadow-none outline-none transform-gpu dashboard-info-trigger-corner` · modules: PageInfoButton-module
  - tailwind (19): `inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-cent…`
  - computed: color=rgb(197, 113, 113) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(197, 113, 113) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 outline-none dashboard-info-trigger-corner`
  - resting:
    - _0r-x3me._.css | .PageInfoButton-module__sZW3Ea__trigger → [--page-info-icon-bg,--page-info-ring-color,--page-info-dot-color]
    - _0r-x3me._.css | .PageInfoButton-module__sZW3Ea__cornerTrigger → [opacity]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.back-button` ×1

- **<button>** [visible] semantic: `back-button bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button documents-scroll-back-button`
  - tailwind (36): `inline-flex h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] items-center justify-center b…`
  - computed: color=rgb(255, 255, 255) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · borderTopLeftRadius=999px · opacity=0.85 · outlineColor=rgb(255, 255, 255) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button documents-scroll-back-button`
  - resting:
    - _0blu2ae._.css | .back-button → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.chat-send-btn` ×1

- **<button>** [visible, disabled] semantic: `chat-send-btn invite-primary-btn pointer-events-auto`
  - tailwind (22): `relative z-[2] !h-[calc(var(--inputbar-h)-2px)] !w-[calc(var(--inputbar-h)-2px)] !min-h-[calc(var(--inputbar-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgba(255, 255, 255, 0.3) · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=9999px · minHeight=47.28px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgba(255, 255, 255, 0.3) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% -1… · boxShadow=rgba(0, 0, 0, 0.11) 0px 6px 13px …
  - dead@state: `invite-primary-btn pointer-events-auto`
  - resting:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0r-x3me._.css | body .chat-inputbar .chat-listen-btn, body .chat-inputb… → [border-top-left-radius!,border-top-right-radius!,border-bottom-right-radius!,border-bottom-left-radius!]
    - _0r-x3me._.css | :root:not(.theme-light):not(.theme-mid) .chat-inputbar … → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-color,box-shadow,background-origin,background-clip]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

## night

### `.button[data-variant="primary"]` ×2

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgba(228, 236, 255, 0.94) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgba(228, 236, 255, 0.94) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `button ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgb(230, 229, 227) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(230, 229, 227) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% -1… · boxShadow=rgba(0, 0, 0, 0.11) 0px 6px 13px …
  - dead@state: `button ui-glow-button-control drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

### `.invite-primary-btn` ×3

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgba(228, 236, 255, 0.94) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgba(228, 236, 255, 0.94) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `button ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgb(230, 229, 227) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(230, 229, 227) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% -1… · boxShadow=rgba(0, 0, 0, 0.11) 0px 6px 13px …
  - dead@state: `button ui-glow-button-control drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

- **<button>** [visible, disabled] semantic: `chat-send-btn invite-primary-btn pointer-events-auto`
  - tailwind (22): `relative z-[2] !h-[calc(var(--inputbar-h)-2px)] !w-[calc(var(--inputbar-h)-2px)] !min-h-[calc(var(--inputbar-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgba(255, 255, 255, 0.3) · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=9999px · minHeight=47.28px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgba(255, 255, 255, 0.3) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% -1… · boxShadow=rgba(0, 0, 0, 0.11) 0px 6px 13px …
  - dead@state: `invite-primary-btn pointer-events-auto`
  - resting:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0r-x3me._.css | body .chat-inputbar .chat-listen-btn, body .chat-inputb… → [border-top-left-radius!,border-top-right-radius!,border-bottom-right-radius!,border-bottom-left-radius!]
    - _0r-x3me._.css | :root:not(.theme-light):not(.theme-mid) .chat-inputbar … → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-color,box-shadow,background-origin,background-clip]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

### `.drawer-pill-btn` ×2

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgba(228, 236, 255, 0.94) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgba(228, 236, 255, 0.94) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `button ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgb(230, 229, 227) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(230, 229, 227) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% -1… · boxShadow=rgba(0, 0, 0, 0.11) 0px 6px 13px …
  - dead@state: `button ui-glow-button-control drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

### `.documents-dropdown-trigger` ×4

- **<button>** [visible, disabled] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=color(srgb 0.139322 0.153548 0.17… · color=rgb(230, 229, 227) · borderTopColor=rgba(133, 164, 216, 0.16) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(2, 6, 16, 0.12) 0px 8px 18px… · borderTopLeftRadius=999px · minHeight=48px · opacity=0.55 · outlineColor=rgb(230, 229, 227) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=color(srgb 0.202739 0.215917 0.23… · boxShadow=rgba(2, 6, 16, 0.16) 0px 10px 22p…
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=color(srgb 0.139322 0.153548 0.17… · color=rgb(230, 229, 227) · borderTopColor=rgba(133, 164, 216, 0.16) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(2, 6, 16, 0.12) 0px 8px 18px… · borderTopLeftRadius=999px · minHeight=48px · opacity=1 · outlineColor=rgb(230, 229, 227) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=color(srgb 0.202739 0.215917 0.23… · boxShadow=rgba(2, 6, 16, 0.16) 0px 10px 22p…
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=color(srgb 0.139322 0.153548 0.17… · color=rgb(230, 229, 227) · borderTopColor=rgba(133, 164, 216, 0.16) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(2, 6, 16, 0.12) 0px 8px 18px… · borderTopLeftRadius=999px · minHeight=48px · opacity=1 · outlineColor=rgb(230, 229, 227) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=color(srgb 0.202739 0.215917 0.23… · boxShadow=rgba(2, 6, 16, 0.16) 0px 10px 22p…
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundColor=color(srgb 0.139322 0.153548 0.17… · color=rgb(230, 229, 227) · borderTopColor=rgba(133, 164, 216, 0.16) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(2, 6, 16, 0.12) 0px 8px 18px… · borderTopLeftRadius=999px · minHeight=48px · opacity=1 · outlineColor=rgb(230, 229, 227) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundColor=color(srgb 0.202739 0.215917 0.23… · boxShadow=rgba(2, 6, 16, 0.16) 0px 10px 22p…
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.dashboard-info-trigger-corner` ×1

- **<button>** [visible] semantic: `bg-transparent p-0 shadow-none outline-none transform-gpu dashboard-info-trigger-corner` · modules: PageInfoButton-module
  - tailwind (19): `inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-cent…`
  - computed: color=rgb(197, 113, 113) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(197, 113, 113) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 outline-none dashboard-info-trigger-corner`
  - resting:
    - _0r-x3me._.css | .PageInfoButton-module__sZW3Ea__trigger → [--page-info-icon-bg,--page-info-ring-color,--page-info-dot-color]
    - _0r-x3me._.css | .PageInfoButton-module__sZW3Ea__cornerTrigger → [opacity]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.back-button` ×1

- **<button>** [visible] semantic: `back-button bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button documents-scroll-back-button`
  - tailwind (36): `inline-flex h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] items-center justify-center b…`
  - computed: color=rgb(255, 255, 255) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · borderTopLeftRadius=999px · opacity=0.85 · outlineColor=rgb(255, 255, 255) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button documents-scroll-back-button`
  - resting:
    - _0blu2ae._.css | .back-button → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.chat-send-btn` ×1

- **<button>** [visible, disabled] semantic: `chat-send-btn invite-primary-btn pointer-events-auto`
  - tailwind (22): `relative z-[2] !h-[calc(var(--inputbar-h)-2px)] !w-[calc(var(--inputbar-h)-2px)] !min-h-[calc(var(--inputbar-…`
  - computed: backgroundImage=radial-gradient(82% 66% at 50% -1… · color=rgba(255, 255, 255, 0.3) · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=9999px · minHeight=47.28px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgba(255, 255, 255, 0.3) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(82% 66% at 50% -1… · --btn-primary-bg-hover=radial-gradient(82% 66% at 50% -1… · --btn-primary-text=#f8fcfff5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=radial-gradient(82% 66% at 50% -1… · boxShadow=rgba(0, 0, 0, 0.11) 0px 6px 13px …
  - dead@state: `invite-primary-btn pointer-events-auto`
  - resting:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0r-x3me._.css | body .chat-inputbar .chat-listen-btn, body .chat-inputb… → [border-top-left-radius!,border-top-right-radius!,border-bottom-right-radius!,border-bottom-left-radius!]
    - _0r-x3me._.css | :root:not(.theme-light):not(.theme-mid) .chat-inputbar … → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-color,box-shadow,background-origin,background-clip]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

## mono

### `.button[data-variant="primary"]` ×2

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(118% 102% at 50% … · color=rgba(230, 230, 230, 0.96) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgba(230, 230, 230, 0.96) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: color=rgba(214, 156, 156, 0.992) · boxShadow=rgba(0, 0, 0, 0.114) 0px 5.60131p… · outlineColor=rgba(214, 156, 156, 0.992)
  - dead@state: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,opacity,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.ui-glow… → [--glow-color!,--glow-color-60!,--glow-color-50!,--glow-color-40!,--glow-color-30!,--glow-color-20!,--glow-color-10!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(118% 102% at 50% … · color=rgba(230, 230, 230, 0.96) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgba(230, 230, 230, 0.96) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: color=rgba(214, 156, 156, 0.992) · boxShadow=rgba(0, 0, 0, 0.114) 0px 5.60131p… · outlineColor=rgba(214, 156, 156, 0.992)
  - dead@state: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,opacity,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.ui-glow… → [--glow-color!,--glow-color-60!,--glow-color-50!,--glow-color-40!,--glow-color-30!,--glow-color-20!,--glow-color-10!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) .ui-glow-but… → [box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

### `.invite-primary-btn` ×3

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(118% 102% at 50% … · color=rgba(230, 230, 230, 0.96) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgba(230, 230, 230, 0.96) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: color=rgba(214, 156, 156, 0.992) · boxShadow=rgba(0, 0, 0, 0.114) 0px 5.60131p… · outlineColor=rgba(214, 156, 156, 0.992)
  - dead@state: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,opacity,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.ui-glow… → [--glow-color!,--glow-color-60!,--glow-color-50!,--glow-color-40!,--glow-color-30!,--glow-color-20!,--glow-color-10!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(118% 102% at 50% … · color=rgba(230, 230, 230, 0.96) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgba(230, 230, 230, 0.96) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: color=rgba(214, 156, 156, 0.992) · boxShadow=rgba(0, 0, 0, 0.114) 0px 5.60131p… · outlineColor=rgba(214, 156, 156, 0.992)
  - dead@state: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,opacity,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.ui-glow… → [--glow-color!,--glow-color-60!,--glow-color-50!,--glow-color-40!,--glow-color-30!,--glow-color-20!,--glow-color-10!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) .ui-glow-but… → [box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

- **<button>** [visible, disabled] semantic: `chat-send-btn invite-primary-btn pointer-events-auto`
  - tailwind (22): `relative z-[2] !h-[calc(var(--inputbar-h)-2px)] !w-[calc(var(--inputbar-h)-2px)] !min-h-[calc(var(--inputbar-…`
  - computed: backgroundImage=radial-gradient(118% 102% at 50% … · color=rgba(230, 230, 230, 0.96) · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=9999px · minHeight=47.28px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgba(230, 230, 230, 0.96) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `invite-primary-btn pointer-events-auto`
  - resting:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0r-x3me._.css | body .chat-inputbar .chat-listen-btn, body .chat-inputb… → [border-top-left-radius!,border-top-right-radius!,border-bottom-right-radius!,border-bottom-left-radius!]
    - _0r-x3me._.css | :root:not(.theme-light):not(.theme-mid) .chat-inputbar … → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-color,box-shadow,background-origin,background-clip]
    - _0r-x3me._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.chat-ra… → [color!]
    - _0r-x3me._.css | :root.theme-mono:not([data-contrast="hc"]) body .chat-i… → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

### `.drawer-pill-btn` ×2

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(118% 102% at 50% … · color=rgba(230, 230, 230, 0.96) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgba(230, 230, 230, 0.96) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: color=rgba(214, 156, 156, 0.992) · boxShadow=rgba(0, 0, 0, 0.114) 0px 5.60131p… · outlineColor=rgba(214, 156, 156, 0.992)
  - dead@state: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,opacity,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.ui-glow… → [--glow-color!,--glow-color-60!,--glow-color-50!,--glow-color-40!,--glow-color-30!,--glow-color-20!,--glow-color-10!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(118% 102% at 50% … · color=rgba(230, 230, 230, 0.96) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgba(230, 230, 230, 0.96) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: color=rgba(214, 156, 156, 0.992) · boxShadow=rgba(0, 0, 0, 0.114) 0px 5.60131p… · outlineColor=rgba(214, 156, 156, 0.992)
  - dead@state: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-top-style!,border-top-width!,border-right-color!,border-right-style!,border-right-width!,border-bottom-color!,border-bottom-style!,border-bottom-width!,border-left-color!,border-left-style!,border-left-width!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.button,… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,opacity,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.ui-glow… → [--glow-color!,--glow-color-60!,--glow-color-50!,--glow-color-40!,--glow-color-30!,--glow-color-20!,--glow-color-10!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) .ui-glow-but… → [box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

### `.documents-dropdown-trigger` ×4

- **<button>** [visible, disabled] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=linear-gradient(rgba(42, 42, 42, … · color=rgb(200, 200, 200) · borderTopColor=rgba(214, 214, 214, 0.16) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.26) 0px 6px 16px … · borderTopLeftRadius=999px · minHeight=48px · opacity=0.55 · outlineColor=rgb(200, 200, 200) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(50, 50, 50, … · boxShadow=rgba(0, 0, 0, 0.28) 0px 6px 16px …
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | :root.theme-mono:not([data-contrast="hc"]) .documents-w… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,color!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=linear-gradient(rgba(42, 42, 42, … · color=rgb(200, 200, 200) · borderTopColor=rgba(214, 214, 214, 0.16) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.26) 0px 6px 16px … · borderTopLeftRadius=999px · minHeight=48px · opacity=1 · outlineColor=rgb(200, 200, 200) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(50, 50, 50, … · boxShadow=rgba(0, 0, 0, 0.28) 0px 6px 16px …
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | :root.theme-mono:not([data-contrast="hc"]) .documents-w… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,color!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=linear-gradient(rgba(42, 42, 42, … · color=rgb(200, 200, 200) · borderTopColor=rgba(214, 214, 214, 0.16) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.26) 0px 6px 16px … · borderTopLeftRadius=999px · minHeight=48px · opacity=1 · outlineColor=rgb(200, 200, 200) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(50, 50, 50, … · boxShadow=rgba(0, 0, 0, 0.28) 0px 6px 16px …
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | :root.theme-mono:not([data-contrast="hc"]) .documents-w… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,color!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=linear-gradient(rgba(42, 42, 42, … · color=rgb(200, 200, 200) · borderTopColor=rgba(214, 214, 214, 0.16) · borderTopWidth=0.8px · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0.26) 0px 6px 16px … · borderTopLeftRadius=999px · minHeight=48px · opacity=1 · outlineColor=rgb(200, 200, 200) · position=static · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(50, 50, 50, … · boxShadow=rgba(0, 0, 0, 0.28) 0px 6px 16px …
  - dead@state: `documents-field`
  - resting:
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | :root.theme-mono:not([data-contrast="hc"]) .documents-w… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,color!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.dashboard-info-trigger-corner` ×1

- **<button>** [visible] semantic: `bg-transparent p-0 shadow-none outline-none transform-gpu dashboard-info-trigger-corner` · modules: PageInfoButton-module
  - tailwind (19): `inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-cent…`
  - computed: color=rgb(197, 113, 113) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · boxShadow=rgba(0, 0, 0, 0) 0px 0px 0px 0px,… · borderTopLeftRadius=2.68435e+07px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(197, 113, 113) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 outline-none dashboard-info-trigger-corner`
  - resting:
    - _0r-x3me._.css | .PageInfoButton-module__sZW3Ea__trigger → [--page-info-icon-bg,--page-info-ring-color,--page-info-dot-color]
    - _0r-x3me._.css | .PageInfoButton-module__sZW3Ea__cornerTrigger → [opacity]
    - _0r-x3me._.css | :root.theme-mono:not([data-contrast="hc"]) .PageInfoBut… → [--page-info-ring-color,--page-info-dot-color]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.back-button` ×1

- **<button>** [visible] semantic: `back-button bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button documents-scroll-back-button`
  - tailwind (36): `inline-flex h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] items-center justify-center b…`
  - computed: color=rgb(197, 113, 113) · borderTopColor=rgb(255, 255, 255) · borderTopStyle=solid · borderTopLeftRadius=999px · opacity=0.85 · outlineColor=rgb(197, 113, 113) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button documents-scroll-back-button`
  - resting:
    - _0blu2ae._.css | .back-button → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.back-bu… → [--back-arrow-color!,--back-dot-color!,color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]

### `.chat-send-btn` ×1

- **<button>** [visible, disabled] semantic: `chat-send-btn invite-primary-btn pointer-events-auto`
  - tailwind (22): `relative z-[2] !h-[calc(var(--inputbar-h)-2px)] !w-[calc(var(--inputbar-h)-2px)] !min-h-[calc(var(--inputbar-…`
  - computed: backgroundImage=radial-gradient(118% 102% at 50% … · color=rgba(230, 230, 230, 0.96) · boxShadow=rgba(0, 0, 0, 0.13) 0px 4px 10px … · borderTopLeftRadius=9999px · minHeight=47.28px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgba(230, 230, 230, 0.96) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=radial-gradient(118% 102% at 50% … · --btn-primary-bg-hover=radial-gradient(118% 102% at 50% … · --btn-primary-text=#e6e6e6f5 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - dead@state: `invite-primary-btn pointer-events-auto`
  - resting:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0r-x3me._.css | body .chat-inputbar .chat-listen-btn, body .chat-inputb… → [border-top-left-radius!,border-top-right-radius!,border-bottom-right-radius!,border-bottom-left-radius!]
    - _0r-x3me._.css | :root:not(.theme-light):not(.theme-mid) .chat-inputbar … → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-color,box-shadow,background-origin,background-clip]
    - _0r-x3me._.css | :root.theme-mono:not([data-contrast="hc"]) :is(.chat-ra… → [color!]
    - _0r-x3me._.css | :root.theme-mono:not([data-contrast="hc"]) body .chat-i… → [border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

## hc

### `.button[data-variant="primary"]` ×2

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(255, 234, 0) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=#0e14206b · --btn-primary-bg-hover=#ffea001f · --btn-primary-text=#ffea00 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(.ui-glow-field, .ui-glow-b… → [--glow-color!,--glow-color-60!,--glow-color-50!,--glow-color-40!,--glow-color-30!,--glow-color-20!,--glow-color-10!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | html[data-contrast="hc"] .BorderGlow-module__FDv2aW__ca… → [--card-bg,--glow-color,--glow-color-60,--glow-color-50,--glow-color-40,--glow-color-30,--glow-color-20,--glow-color-10,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,color!,box-shadow!]
    - _0r-x3me._.css | html[data-contrast="hc"] .BorderGlow-module__FDv2aW__ed… → [box-shadow!,opacity!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(255, 234, 0) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=#0e14206b · --btn-primary-bg-hover=#ffea001f · --btn-primary-text=#ffea00 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(.ui-glow-field, .ui-glow-b… → [--glow-color!,--glow-color-60!,--glow-color-50!,--glow-color-40!,--glow-color-30!,--glow-color-20!,--glow-color-10!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0blu2ae._.css | html[data-contrast="hc"] body a → [color,text-decoration-color]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body, html[data-contrast="hc"]… → [color]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0r-x3me._.css | html[data-contrast="hc"] .documents-workspace :is(h1, h… → [color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | html[data-contrast="hc"] .BorderGlow-module__FDv2aW__ca… → [--card-bg,--glow-color,--glow-color-60,--glow-color-50,--glow-color-40,--glow-color-30,--glow-color-20,--glow-color-10,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,color!,box-shadow!]
    - _0r-x3me._.css | html[data-contrast="hc"] .BorderGlow-module__FDv2aW__ed… → [box-shadow!,opacity!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
    - _0blu2ae._.css | html[data-contrast="hc"] .ui-glow-button-frame:hover:no… → [box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

### `.invite-primary-btn` ×3

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(255, 234, 0) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=#0e14206b · --btn-primary-bg-hover=#ffea001f · --btn-primary-text=#ffea00 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(.ui-glow-field, .ui-glow-b… → [--glow-color!,--glow-color-60!,--glow-color-50!,--glow-color-40!,--glow-color-30!,--glow-color-20!,--glow-color-10!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | html[data-contrast="hc"] .BorderGlow-module__FDv2aW__ca… → [--card-bg,--glow-color,--glow-color-60,--glow-color-50,--glow-color-40,--glow-color-30,--glow-color-20,--glow-color-10,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,color!,box-shadow!]
    - _0r-x3me._.css | html[data-contrast="hc"] .BorderGlow-module__FDv2aW__ed… → [box-shadow!,opacity!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(255, 234, 0) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=#0e14206b · --btn-primary-bg-hover=#ffea001f · --btn-primary-text=#ffea00 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(.ui-glow-field, .ui-glow-b… → [--glow-color!,--glow-color-60!,--glow-color-50!,--glow-color-40!,--glow-color-30!,--glow-color-20!,--glow-color-10!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0blu2ae._.css | html[data-contrast="hc"] body a → [color,text-decoration-color]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body, html[data-contrast="hc"]… → [color]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0r-x3me._.css | html[data-contrast="hc"] .documents-workspace :is(h1, h… → [color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | html[data-contrast="hc"] .BorderGlow-module__FDv2aW__ca… → [--card-bg,--glow-color,--glow-color-60,--glow-color-50,--glow-color-40,--glow-color-30,--glow-color-20,--glow-color-10,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,color!,box-shadow!]
    - _0r-x3me._.css | html[data-contrast="hc"] .BorderGlow-module__FDv2aW__ed… → [box-shadow!,opacity!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
    - _0blu2ae._.css | html[data-contrast="hc"] .ui-glow-button-frame:hover:no… → [box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

- **<button>** [visible, disabled] semantic: `chat-send-btn invite-primary-btn pointer-events-auto`
  - tailwind (22): `relative z-[2] !h-[calc(var(--inputbar-h)-2px)] !w-[calc(var(--inputbar-h)-2px)] !min-h-[calc(var(--inputbar-…`
  - computed: color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopWidth=1.6px · borderTopStyle=solid · borderTopLeftRadius=9999px · minHeight=47.28px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(255, 234, 0) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=transparent · --btn-primary-bg-hover=transparent · --btn-primary-text=#ffea00 · --btn-primary-shadow=inset 0 1px 0 #dcecff1a,
    0 5p… · --btn-primary-border=2px solid #ffea00a8
  - hover Δ: borderTopColor=rgba(255, 234, 0, 0.94)
  - dead@state: `pointer-events-auto`
  - resting:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0blu2ae._.css | html[data-contrast="hc"] body .chat-inputbar .chat-send… → [--btn-primary-text!,--btn-primary-bg!,--btn-primary-bg-hover!,--btn-primary-bg-active!,--btn-primary-border!,--btn-primary-border-hover!,--btn-primary-border-active!,color!,box-shadow!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0r-x3me._.css | body .chat-inputbar .chat-listen-btn, body .chat-inputb… → [border-top-left-radius!,border-top-right-radius!,border-bottom-right-radius!,border-bottom-left-radius!]
    - _0r-x3me._.css | html[data-contrast="hc"] body .chat-inputbar .chat-send… → [--btn-primary-bg,--btn-primary-bg-hover,--btn-primary-bg-active,--btn-primary-border,--btn-primary-border-hover,--btn-primary-border-active,--btn-primary-shadow,--btn-primary-shadow-hover,--btn-primary-shadow-active,--btn-primary-shadow-focus,--btn-primary-focus-ring-color,--btn-primary-text,box-shadow!,backdrop-filter!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0r-x3me._.css | :root:not(.theme-light):not(.theme-mid) .chat-inputbar … → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-color,box-shadow,background-origin,background-clip]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]
    - _0r-x3me._.css | html[data-contrast="hc"] body .chat-inputbar .chat-send… → [--btn-primary-bg,--btn-primary-border,--btn-primary-shadow]

### `.drawer-pill-btn` ×2

- **<button>** [visible, disabled] semantic: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=0.6 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(255, 234, 0) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=#0e14206b · --btn-primary-bg-hover=#ffea001f · --btn-primary-text=#ffea00 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `button ui-glow-button-frame ui-glow-button-control ui-glow-button-frame--disabled drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(.ui-glow-field, .ui-glow-b… → [--glow-color!,--glow-color-60!,--glow-color-50!,--glow-color-40!,--glow-color-30!,--glow-color-20!,--glow-color-10!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | html[data-contrast="hc"] .BorderGlow-module__FDv2aW__ca… → [--card-bg,--glow-color,--glow-color-60,--glow-color-50,--glow-color-40,--glow-color-30,--glow-color-20,--glow-color-10,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,color!,box-shadow!]
    - _0r-x3me._.css | html[data-contrast="hc"] .BorderGlow-module__FDv2aW__ed… → [box-shadow!,opacity!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

- **<a>** [visible] semantic: `button ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn` · modules: BorderGlow-module
  - tailwind (85): `inline-flex items-center justify-center gap-[0.45rem] rounded-full border border-solid border-transparent px-…`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopStyle=solid · borderTopLeftRadius=25.6px · minHeight=48.8px · opacity=1 · transform=matrix3d(1, 0, 0, 0, 0, 1, 0, 0, … · outlineColor=rgb(255, 234, 0) · backdropFilter=blur(10px) saturate(1.2) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=#0e14206b · --btn-primary-bg-hover=#ffea001f · --btn-primary-text=#ffea00 · --btn-primary-shadow=0 4px 10px #00000021 · --btn-primary-border=0 solid transparent
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `ui-glow-button-frame ui-glow-button-control drawer-pill-btn invite-primary-btn`
  - resting:
    - _0blu2ae._.css | .ui-glow-button-frame → [color,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(.ui-glow-field, .ui-glow-b… → [--glow-color!,--glow-color-60!,--glow-color-50!,--glow-color-40!,--glow-color-30!,--glow-color-20!,--glow-color-10!]
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0blu2ae._.css | html[data-contrast="hc"] body a → [color,text-decoration-color]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body, html[data-contrast="hc"]… → [color]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0r-x3me._.css | html[data-contrast="hc"] .documents-workspace :is(h1, h… → [color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card → [--edge-proximity,--cursor-angle,--edge-sensitivity,--color-sensitivity,--border-radius,--glow-padding,--cone-spread,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before, .BorderGlow-m… → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::before → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__card::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,opacity,border-top-width,border-right-width,border-bottom-width,border-left-width,border-top-style,border-right-style,border-bottom-style,border-left-style,border-top-color,border-right-color,border-bottom-color,border-left-color,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat]
    - _0r-x3me._.css | .BorderGlow-module__FDv2aW__edgeOnly::after → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,box-shadow,opacity,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | html[data-contrast="hc"] .BorderGlow-module__FDv2aW__ca… → [--card-bg,--glow-color,--glow-color-60,--glow-color-50,--glow-color-40,--glow-color-30,--glow-color-20,--glow-color-10,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,color!,box-shadow!]
    - _0r-x3me._.css | html[data-contrast="hc"] .BorderGlow-module__FDv2aW__ed… → [box-shadow!,opacity!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
  - hover:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!]
    - _0blu2ae._.css | html[data-contrast="hc"] .ui-glow-button-frame:hover:no… → [box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .ui-glow-button… → [box-shadow!]
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]

### `.documents-dropdown-trigger` ×4

- **<button>** [visible, disabled] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopWidth=1.6px · borderTopStyle=solid · borderTopLeftRadius=999px · minHeight=48px · opacity=0.55 · outlineColor=rgb(255, 234, 0) · position=static · visibility=visible
  - tokens: --btn-primary-bg=#0e14206b · --btn-primary-bg-hover=#ffea001f · --btn-primary-text=#ffea00 · --btn-primary-shadow=none · --btn-primary-border=2px solid #ffea00a8
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `documents-field`
  - resting:
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(.ui-glow-field, .materials… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,color!,box-shadow!,caret-color!,border-top-width!,border-right-width!,border-bottom-width!,border-left-width!,border-top-style!,border-right-style!,border-bottom-style!,border-left-style!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(.ui-glow-field, .materials… → [color!,opacity!]
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | html[data-contrast="hc"] .documents-workspace :is(.docu… → [color!,box-shadow!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0r-x3me._.css | html[data-contrast="hc"] .documents-workspace :is(.docu… → [color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopWidth=1.6px · borderTopStyle=solid · borderTopLeftRadius=999px · minHeight=48px · opacity=1 · outlineColor=rgb(255, 234, 0) · position=static · visibility=visible
  - tokens: --btn-primary-bg=#0e14206b · --btn-primary-bg-hover=#ffea001f · --btn-primary-text=#ffea00 · --btn-primary-shadow=none · --btn-primary-border=2px solid #ffea00a8
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `documents-field`
  - resting:
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(.ui-glow-field, .materials… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,color!,box-shadow!,caret-color!,border-top-width!,border-right-width!,border-bottom-width!,border-left-width!,border-top-style!,border-right-style!,border-bottom-style!,border-left-style!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(.ui-glow-field, .materials… → [color!,opacity!]
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | html[data-contrast="hc"] .documents-workspace :is(.docu… → [color!,box-shadow!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0r-x3me._.css | html[data-contrast="hc"] .documents-workspace :is(.docu… → [color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopWidth=1.6px · borderTopStyle=solid · borderTopLeftRadius=999px · minHeight=48px · opacity=1 · outlineColor=rgb(255, 234, 0) · position=static · visibility=visible
  - tokens: --btn-primary-bg=#0e14206b · --btn-primary-bg-hover=#ffea001f · --btn-primary-text=#ffea00 · --btn-primary-shadow=none · --btn-primary-border=2px solid #ffea00a8
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `documents-field`
  - resting:
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(.ui-glow-field, .materials… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,color!,box-shadow!,caret-color!,border-top-width!,border-right-width!,border-bottom-width!,border-left-width!,border-top-style!,border-right-style!,border-bottom-style!,border-left-style!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(.ui-glow-field, .materials… → [color!,opacity!]
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | html[data-contrast="hc"] .documents-workspace :is(.docu… → [color!,box-shadow!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0r-x3me._.css | html[data-contrast="hc"] .documents-workspace :is(.docu… → [color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

- **<button>** [visible] semantic: `documents-field documents-dropdown-trigger`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopWidth=1.6px · borderTopStyle=solid · borderTopLeftRadius=999px · minHeight=48px · opacity=1 · outlineColor=rgb(255, 234, 0) · position=static · visibility=visible
  - tokens: --btn-primary-bg=#0e14206b · --btn-primary-bg-hover=#ffea001f · --btn-primary-text=#ffea00 · --btn-primary-shadow=none · --btn-primary-border=2px solid #ffea00a8
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `documents-field`
  - resting:
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(.ui-glow-field, .materials… → [background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,color!,box-shadow!,caret-color!,border-top-width!,border-right-width!,border-bottom-width!,border-left-width!,border-top-style!,border-right-style!,border-bottom-style!,border-left-style!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,border-image-source!,border-image-slice!,border-image-width!,border-image-outset!,border-image-repeat!]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(.ui-glow-field, .materials… → [color!,opacity!]
    - _0r-x3me._.css | .documents-field → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow]
    - _0r-x3me._.css | .documents-dropdown-trigger → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,box-shadow,border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0r-x3me._.css | html[data-contrast="hc"] .documents-workspace :is(.docu… → [color!,box-shadow!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0r-x3me._.css | html[data-contrast="hc"] .documents-workspace :is(.docu… → [color!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

### `.dashboard-info-trigger-corner` ×1

- **<button>** [visible] semantic: `bg-transparent p-0 shadow-none outline-none transform-gpu dashboard-info-trigger-corner` · modules: PageInfoButton-module
  - tailwind (19): `inline-flex h-[3.45rem] w-[3.45rem] min-[769px]:h-[4.15rem] min-[769px]:w-[4.15rem] items-center justify-cent…`
  - computed: backgroundImage=radial-gradient(124% 96% at 50% 6… · color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopWidth=1.6px · borderTopStyle=solid · borderTopLeftRadius=2.68435e+07px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(255, 234, 0) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=#0e14206b · --btn-primary-bg-hover=#ffea001f · --btn-primary-text=#ffea00 · --btn-primary-shadow=none · --btn-primary-border=2px solid #ffea00a8
  - hover Δ: backgroundImage=linear-gradient(rgba(255, 234, 0,… · borderTopColor=rgba(255, 234, 0, 0.9)
  - dead@state: `bg-transparent p-0 shadow-none outline-none dashboard-info-trigger-corner`
  - resting:
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-origin,background-clip,background-color,color,border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,box-shadow]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(button, [role="button… → [color!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,box-shadow!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0r-x3me._.css | .PageInfoButton-module__sZW3Ea__trigger → [--page-info-icon-bg,--page-info-ring-color,--page-info-dot-color]
    - _0r-x3me._.css | .PageInfoButton-module__sZW3Ea__cornerTrigger → [opacity]
    - _0r-x3me._.css | html[data-contrast="hc"] .PageInfoButton-module__sZW3Ea… → [--page-info-ring-color,--page-info-dot-color]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

### `.back-button` ×1

- **<button>** [visible] semantic: `back-button bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button documents-scroll-back-button`
  - tailwind (36): `inline-flex h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] items-center justify-center b…`
  - computed: color=rgb(255, 234, 0) · borderTopColor=rgb(255, 234, 0) · borderTopLeftRadius=999px · opacity=0.85 · outlineColor=rgb(255, 234, 0) · position=absolute · visibility=visible
  - tokens: --btn-primary-bg=#0e14206b · --btn-primary-bg-hover=#ffea001f · --btn-primary-text=#ffea00 · --btn-primary-shadow=none · --btn-primary-border=2px solid #ffea00a8
  - dead@state: `bg-transparent p-0 group glass-subpage-back-button pointer-events-auto workspace-scroll-back-button documents-scroll-back-button`
  - resting:
    - _0blu2ae._.css | .back-button → [border-top-left-radius,border-top-right-radius,border-bottom-right-radius,border-bottom-left-radius]
    - _0blu2ae._.css | html[data-contrast="hc"] body :is(.back-button, .chat-b… → [color!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!,box-shadow!]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
    - _0blu2ae._.css | html[data-contrast="hc"] :is(a, button, input, select, … → [outline-color]

### `.chat-send-btn` ×1

- **<button>** [visible, disabled] semantic: `chat-send-btn invite-primary-btn pointer-events-auto`
  - tailwind (22): `relative z-[2] !h-[calc(var(--inputbar-h)-2px)] !w-[calc(var(--inputbar-h)-2px)] !min-h-[calc(var(--inputbar-…`
  - computed: color=rgb(255, 234, 0) · borderTopColor=rgba(255, 234, 0, 0.66) · borderTopWidth=1.6px · borderTopStyle=solid · borderTopLeftRadius=9999px · minHeight=47.28px · opacity=1 · transform=matrix(1, 0, 0, 1, 0, 0) · outlineColor=rgb(255, 234, 0) · position=relative · visibility=visible
  - tokens: --btn-primary-bg=transparent · --btn-primary-bg-hover=transparent · --btn-primary-text=#ffea00 · --btn-primary-shadow=inset 0 1px 0 #dcecff1a,
    0 5p… · --btn-primary-border=2px solid #ffea00a8
  - hover Δ: borderTopColor=rgba(255, 234, 0, 0.94)
  - dead@state: `pointer-events-auto`
  - resting:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [--btn-primary-bg-active,--btn-primary-shadow-active,--btn-primary-border-active]
    - _0blu2ae._.css | html[data-contrast="hc"] body .chat-inputbar .chat-send… → [--btn-primary-text!,--btn-primary-bg!,--btn-primary-bg-hover!,--btn-primary-bg-active!,--btn-primary-border!,--btn-primary-border-hover!,--btn-primary-border-active!,color!,box-shadow!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!,border-top-color!,border-right-color!,border-bottom-color!,border-left-color!]
    - _0r-x3me._.css | body .chat-inputbar .chat-listen-btn, body .chat-inputb… → [border-top-left-radius!,border-top-right-radius!,border-bottom-right-radius!,border-bottom-left-radius!]
    - _0r-x3me._.css | html[data-contrast="hc"] body .chat-inputbar .chat-send… → [--btn-primary-bg,--btn-primary-bg-hover,--btn-primary-bg-active,--btn-primary-border,--btn-primary-border-hover,--btn-primary-border-active,--btn-primary-shadow,--btn-primary-shadow-hover,--btn-primary-shadow-active,--btn-primary-shadow-focus,--btn-primary-focus-ring-color,--btn-primary-text,box-shadow!,backdrop-filter!,background-image!,background-position-x!,background-position-y!,background-size!,background-repeat!,background-attachment!,background-origin!,background-clip!,background-color!]
    - _0r-x3me._.css | :root:not(.theme-light):not(.theme-mid) .chat-inputbar … → [border-top-color,border-top-style,border-top-width,border-right-color,border-right-style,border-right-width,border-bottom-color,border-bottom-style,border-bottom-width,border-left-color,border-left-style,border-left-width,border-image-source,border-image-slice,border-image-width,border-image-outset,border-image-repeat,background-image,background-position-x,background-position-y,background-size,background-repeat,background-attachment,background-color,box-shadow,background-origin,background-clip]
  - focus-visible:
    - _0blu2ae._.css | :where(a, button, input, select, textarea, [role], [tab… → [outline-color]
  - active:
    - _0blu2ae._.css | :root:not(.theme-light):not(.theme-mid) .invite-primary… → [opacity!]
    - _0r-x3me._.css | html[data-contrast="hc"] body .chat-inputbar .chat-send… → [--btn-primary-bg,--btn-primary-border,--btn-primary-shadow]

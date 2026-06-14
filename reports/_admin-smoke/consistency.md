# Button consistency — divergences

> For each inspected selector × theme, visible instances are grouped by a
> DESIGN fingerprint: resolved tokens + paint props, RESTING **and** HOVER
> (position/transform/visibility excluded — those legitimately vary). A
> selector showing >1 group should be ONE design but isn't — the same
> primitive paints differently across routes, modals or hover. This is the
> class of bug the per-route crawl is blind to (it never opens modals and
> never resolves hover).

## `.button[data-variant="ghost"] @ghost` @light — 3 variants

- **variant A** (8×): /admin/rag/ingest×3, /admin/rag/kov×3, /admin/rag/organizations×2
    - color = rgb(34, 34, 34)
    - borderTopColor = rgba(190, 196, 208, 0.35)
    - hover backgroundColor = color(srgb 0.9 0.85 0.85 / 0.9)
- **variant B** (1×): /admin/rag/documents
    - color = color(srgb 0.15 0.15 0.15 / 0.95)
    - borderTopColor = color(srgb 0.85 0.85 0.85 / 0.45)
    - hover backgroundColor = color(srgb 0.9 0.85 0.85 / 0.9)
- **variant C** (1×): /admin/rag/kov
    - color = color(srgb 0.15 0.15 0.15 / 0.95)
    - borderTopColor = color(srgb 0.85 0.85 0.85 / 0.45)
    - hover backgroundColor = color(srgb 1 1 0.95 / 0.85)

## `.button[data-variant="ghost"] @ghost` @mid — 2 variants

- **variant A** (5×): /admin/rag/ingest×3, /admin/rag/organizations×2
    - color = rgb(44, 51, 64)
    - borderTopColor = rgba(156, 138, 145, 0.3)
- **variant B** (1×): /admin/rag/documents
    - color = color(srgb 0.15 0.2 0.25 / 0.95)
    - borderTopColor = color(srgb 0.7 0.65 0.65 / 0.4)

## `.button[data-variant="ghost"] @ghost` @dark — 3 variants

- **variant A** (8×): /admin/rag/ingest×3, /admin/rag/kov×3, /admin/rag/organizations×2
    - color = rgb(242, 242, 242)
    - borderTopColor = rgba(255, 255, 255, 0.15)
    - hover backgroundColor = color(srgb 0.3 0.2 0.2 / 0.5)
- **variant B** (1×): /admin/rag/documents
    - color = color(srgb 0.95 0.95 0.95 / 0.95)
    - borderTopColor = color(srgb 0.65 0.65 0.65 / 0.2)
    - hover backgroundColor = color(srgb 0.3 0.2 0.2 / 0.5)
- **variant C** (1×): /admin/rag/kov
    - color = color(srgb 0.95 0.95 0.95 / 0.95)
    - borderTopColor = color(srgb 0.65 0.65 0.65 / 0.2)
    - hover backgroundColor = color(srgb 0.1 0.1 0.1 / 0.4)

## `.button[data-variant="ghost"] @ghost` @night — 2 variants

- **variant A** (5×): /admin/rag/ingest×3, /admin/rag/organizations×2
    - color = rgb(230, 229, 227)
    - borderTopColor = rgba(118, 149, 219, 0.1)
- **variant B** (1×): /admin/rag/documents
    - color = color(srgb 0.9 0.9 0.9 / 0.95)
    - borderTopColor = color(srgb 0.3 0.35 0.5 / 0.15)

## `.button[data-variant="ghost"] @ghost` @mono — 3 variants

- **variant A** (8×): /admin/rag/ingest×3, /admin/rag/kov×3, /admin/rag/organizations×2
    - color = rgb(200, 200, 200)
    - borderTopColor = rgba(214, 214, 214, 0.1)
    - hover backgroundColor = color(srgb 0.25 0.2 0.2 / 0.7)
- **variant B** (1×): /admin/rag/documents
    - color = color(srgb 0.85 0.85 0.85 / 0.85)
    - borderTopColor = color(srgb 0.45 0.45 0.45 / 0.2)
    - hover backgroundColor = color(srgb 0.25 0.2 0.2 / 0.7)
- **variant C** (1×): /admin/rag/kov
    - color = color(srgb 0.85 0.85 0.85 / 0.85)
    - borderTopColor = color(srgb 0.45 0.45 0.45 / 0.2)
    - hover backgroundColor = color(srgb 0.15 0.15 0.15 / 0.6)

## `.button[data-variant="ghost"] @ghost` @hc — 3 variants

- **variant A** (8×): /admin/rag/ingest×3, /admin/rag/kov×3, /admin/rag/organizations×2
    - color = rgb(255, 234, 0)
    - borderTopColor = rgba(255, 234, 0, 0.5)
    - hover backgroundColor = color(srgb 0.25 0.25 0.05 / 0.65)
- **variant B** (1×): /admin/rag/documents
    - color = color(srgb 1 0.9 0 / 0.9)
    - borderTopColor = color(srgb 0.8 0.75 0 / 0.5)
    - hover backgroundColor = color(srgb 0.25 0.25 0.05 / 0.65)
- **variant C** (1×): /admin/rag/kov
    - color = color(srgb 1 0.9 0 / 0.9)
    - borderTopColor = color(srgb 0.8 0.75 0 / 0.5)
    - hover backgroundColor = color(srgb 0.1 0.1 0.1 / 0.6)

## `.button[data-variant="primary"] @primary` @light — 4 variants

- **variant A** (3×): /admin/rag/ingest, /admin/rag/kov×2
    - backgroundImage = none
    - color = rgb(34, 34, 34)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(190, 196, 208, 0.35)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = color(srgb 0.9 0.85 0.85 / 0.9)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,
      #fefdfcfe 0%,
   …
    - --btn-primary-shadow = 0 4px 10px #0f172a1a
    - --btn-primary-border = 1px solid #94a3b814
- **variant B** (3×): /admin/rag/ingest×2, /admin/rag/kov
    - backgroundImage = none
    - color = rgb(34, 34, 34)
    - boxShadow = rgba(15, 23, 42, 0.1) 0px 4px 10px 0px, rgba(122, 58, 56, 0…
    - borderTopColor = color(srgb 0.5 0.3 0.3 / 0.8)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = color(srgb 0.85 0.8 0.8 / 0.9)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,
      #fefdfcfe 0%,
   …
    - --btn-primary-shadow = 0 4px 10px #0f172a1a
    - --btn-primary-border = 1px solid #94a3b814
- **variant C** (2×): /admin/rag/ingest, /admin/rag/kov
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(34, 34, 34)
    - boxShadow = rgba(15, 23, 42, 0.1) 0px 4px 10px 0px, rgba(122, 58, 56, 0…
    - borderTopColor = rgba(148, 163, 184, 0.1)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 18px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(254, 253, 252, 1) …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,
      #fefdfcfe 0%,
   …
    - --btn-primary-shadow = 0 4px 10px #0f172a1a
    - --btn-primary-border = 1px solid #94a3b814
- **variant D** (2×): /profiil#account-settings-modal×2
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(31, 41, 55)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(122, 58, 56, 0) …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent

## `.button[data-variant="primary"] @primary` @mid — 4 variants

- **variant A** (2×): /admin/rag/ingest×2
    - backgroundImage = none
    - color = rgb(44, 51, 64)
    - boxShadow = rgba(38, 24, 22, 0.1) 0px 6px 14px 0px, rgba(255, 255, 255,…
    - borderTopColor = oklab(0.55 0.05 0.05 / 0.75)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = color(srgb 0.8 0.75 0.7 / 0.9)
    - --btn-primary-shadow = 0 6px 14px #2618161a,
    inset 0 1px 0 #ffffff57
    - --btn-primary-border = transparent
- **variant B** (2×): /profiil#account-settings-modal×2
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - color = rgb(63, 71, 86)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant C** (1×): /admin/rag/ingest
    - backgroundImage = none
    - color = rgb(44, 51, 64)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(157, 140, 146, 0.3)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = color(srgb 0.85 0.8 0.75 / 0.9)
    - --btn-primary-shadow = 0 6px 14px #2618161a,
    inset 0 1px 0 #ffffff57
    - --btn-primary-border = transparent
- **variant D** (1×): /admin/rag/ingest
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - color = rgb(44, 51, 64)
    - boxShadow = rgba(38, 24, 22, 0.1) 0px 6px 14px 0px, rgba(255, 255, 255,…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 18px
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-shadow = 0 6px 14px #2618161a,
    inset 0 1px 0 #ffffff57
    - --btn-primary-border = transparent

## `.button[data-variant="primary"] @primary` @dark — 4 variants

- **variant A** (3×): /admin/rag/ingest, /admin/rag/kov×2
    - backgroundImage = none
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(255, 255, 255, 0.15)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = color(srgb 0.3 0.2 0.2 / 0.5)
    - --btn-primary-shadow = inset 0 1px 0 #ffffff0f,
    0 5px 12px #0003
- **variant B** (3×): /admin/rag/ingest×2, /admin/rag/kov
    - backgroundImage = none
    - boxShadow = rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(0, 0,…
    - borderTopColor = color(srgb 0.8 0.5 0.5 / 0.7)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = color(srgb 0.35 0.2 0.25 / 0.55)
    - --btn-primary-shadow = inset 0 1px 0 #ffffff0f,
    0 5px 12px #0003
- **variant C** (2×): /admin/rag/ingest, /admin/rag/kov
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - boxShadow = rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(0, 0,…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 18px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-shadow = inset 0 1px 0 #ffffff0f,
    0 5px 12px #0003
- **variant D** (2×): /profiil#account-settings-modal×2
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-shadow = 0 4px 10px #00000021

## `.button[data-variant="primary"] @primary` @night — 4 variants

- **variant A** (2×): /admin/rag/ingest×2
    - backgroundImage = none
    - color = rgb(230, 229, 227)
    - boxShadow = rgba(220, 236, 255, 0.1) 0px 1px 0px 0px inset, rgba(2, 6, …
    - borderTopColor = color(srgb 0.8 0.5 0.55 / 0.7)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = color(srgb 0.4 0.25 0.3 / 0.5)
    - --btn-primary-shadow = inset 0 1px 0 #dcecff1a,
    0 5px 12px #0206103d
- **variant B** (2×): /profiil#account-settings-modal×2
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - color = rgb(242, 242, 242)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant C** (1×): /admin/rag/ingest
    - backgroundImage = none
    - color = rgb(230, 229, 227)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(118, 149, 219, 0.1)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = color(srgb 0.3 0.25 0.25 / 0.5)
    - --btn-primary-shadow = inset 0 1px 0 #dcecff1a,
    0 5px 12px #0206103d
- **variant D** (1×): /admin/rag/ingest
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - color = rgb(230, 229, 227)
    - boxShadow = rgba(220, 236, 255, 0.1) 0px 1px 0px 0px inset, rgba(2, 6, …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 18px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-shadow = inset 0 1px 0 #dcecff1a,
    0 5px 12px #0206103d

## `.button[data-variant="primary"] @primary` @mono — 4 variants

- **variant A** (3×): /admin/rag/ingest, /admin/rag/kov×2
    - backgroundImage = none
    - color = rgb(200, 200, 200)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(214, 214, 214, 0.1)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = color(srgb 0.25 0.2 0.2 / 0.7)
    - --btn-primary-shadow = inset 0 1px 0 #d6d6d614,
    0 5px 12px #0707073d
- **variant B** (3×): /admin/rag/ingest×2, /admin/rag/kov
    - backgroundImage = none
    - color = rgb(200, 200, 200)
    - boxShadow = rgba(214, 214, 214, 0.1) 0px 1px 0px 0px inset, rgba(7, 7, …
    - borderTopColor = color(srgb 0.8 0.45 0.45 / 0.7)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = color(srgb 0.3 0.2 0.2 / 0.7)
    - --btn-primary-shadow = inset 0 1px 0 #d6d6d614,
    0 5px 12px #0707073d
- **variant C** (2×): /admin/rag/ingest, /admin/rag/kov
    - backgroundImage = radial-gradient(118% 102% at 50% 8%, rgba(62, 62, 62, 0.9) …
    - color = rgba(230, 230, 230, 0.95)
    - boxShadow = rgba(214, 214, 214, 0.1) 0px 1px 0px 0px inset, rgba(7, 7, …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 18px
    - hover backgroundImage = radial-gradient(118% 102% at 50% 8%, rgba(62, 62, 62, 0.9) …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-shadow = inset 0 1px 0 #d6d6d614,
    0 5px 12px #0707073d
- **variant D** (2×): /profiil#account-settings-modal×2
    - backgroundImage = radial-gradient(118% 102% at 50% 8%, rgba(62, 62, 62, 0.9) …
    - color = rgba(230, 230, 230, 0.95)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(118% 102% at 50% 8%, rgba(62, 62, 62, 0.9) …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-shadow = 0 4px 10px #00000021

## `.button[data-variant="primary"] @primary` @hc — 4 variants

- **variant A** (3×): /admin/rag/ingest, /admin/rag/kov×2
    - backgroundImage = none
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(255, 234, 0, 0.5)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = color(srgb 0.25 0.25 0.05 / 0.65)
    - --btn-primary-bg = #0e14206b
    - --btn-primary-bg-hover = #ffea001f
    - --btn-primary-shadow = none
- **variant B** (3×): /admin/rag/ingest×2, /admin/rag/kov
    - backgroundImage = none
    - boxShadow = none
    - borderTopColor = color(srgb 1 0.9 0 / 0.85)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = color(srgb 0.35 0.35 0.05 / 0.7)
    - --btn-primary-bg = #0e14206b
    - --btn-primary-bg-hover = #ffea001f
    - --btn-primary-shadow = none
- **variant C** (2×): /admin/rag/ingest, /admin/rag/kov
    - backgroundImage = radial-gradient(124% 96% at 50% 6%, rgba(27, 39, 53, 0.5) 0…
    - boxShadow = none
    - borderTopColor = rgba(255, 234, 0, 0.65)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 18px
    - hover backgroundImage = linear-gradient(rgba(255, 234, 0, 0.1) 0%, rgba(255, 234, 0…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = #0e14206b
    - --btn-primary-bg-hover = #ffea001f
    - --btn-primary-shadow = none
- **variant D** (2×): /profiil#account-settings-modal×2
    - backgroundImage = radial-gradient(124% 96% at 50% 6%, rgba(27, 39, 53, 0.5) 0…
    - boxShadow = none
    - borderTopColor = rgba(255, 234, 0, 0.65)
    - borderTopWidth = 2px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = linear-gradient(rgba(255, 234, 0, 0.1) 0%, rgba(255, 234, 0…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(82% 66% at 50% -14%,
      #deecff1c 0%,
  …
    - --btn-primary-bg-hover = linear-gradient(0deg,
      #ffea000b 0%,
      #ffea000b 1…
    - --btn-primary-shadow = inset 0 1px 0 #dcecff1a,
    0 5px 12px #0206103d

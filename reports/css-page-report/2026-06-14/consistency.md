# Button consistency — divergences

> For each inspected selector × theme, visible instances are grouped by a
> DESIGN fingerprint: resolved tokens + paint props, RESTING **and** HOVER
> (position/transform/visibility excluded — those legitimately vary). A
> selector showing >1 group should be ONE design but isn't — the same
> primitive paints differently across routes, modals or hover. This is the
> class of bug the per-route crawl is blind to (it never opens modals and
> never resolves hover).

## `.button[data-variant="primary"] @primary` @light — 20 variants

- **variant A** (9×): /tooheaolu/kiirkontroll, /tooheaolu/raske-juhtum, /tooheaolu/toovagivald, /tooheaolu/taastumine, /tooheaolu/toopiirid, /tooheaolu/katkestused, /tooheaolu/tooprotsessid, /tooheaolu/rollipiirid, /tooheaolu/alustaja-tugi
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(36, 50, 68)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(122, 58, 56, 0) …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 12px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-text = #243244
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant B** (5×): /hinnastus×4, /eelpoordumised
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(51, 65, 85)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(122, 58, 56, 0) …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant C** (3×): /taasta-parool, /uuenda-epost, /uuenda-pin
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(43, 38, 32)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(122, 58, 56, 0) …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant D** (3×): /admin/rag/ingest, /admin/rag/kov×2
    - backgroundImage = none
    - color = rgb(34, 34, 34)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(190, 196, 208, 0.35)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = rgb(229 217 215 / 0.9)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,
      #fefdfcfe 0%,
   …
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = 0 4px 10px #0f172a1a
    - --btn-primary-border = 1px solid #94a3b814
- **variant E** (3×): /admin/rag/ingest×2, /admin/rag/kov
    - backgroundImage = none
    - color = rgb(34, 34, 34)
    - boxShadow = rgba(15, 23, 42, 0.1) 0px 4px 10px 0px, rgba(122, 58, 56, 0…
    - borderTopColor = rgb(133 81 81 / 0.8)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = rgb(221 205 203 / 0.9)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,
      #fefdfcfe 0%,
   …
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = 0 4px 10px #0f172a1a
    - --btn-primary-border = 1px solid #94a3b814
- **variant F** (2×): /tooalase-kasutuse-raamistik×2
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(43, 38, 32)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(122, 58, 56, 0) …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant G** (2×): /tooalase-kasutuse-raamistik, /dokreziim
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(51, 65, 85)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(122, 58, 56, 0) …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant H** (2×): /documents×2
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(34, 34, 34)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(122, 58, 56, 0) …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant I** (2×): /kovisioon×2
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(37, 50, 70)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(122, 58, 56, 0) …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant J** (2×): /admin/rag/ingest, /admin/rag/kov
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
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = 0 4px 10px #0f172a1a
    - --btn-primary-border = 1px solid #94a3b814
- **variant K** (2×): /profiil#account-settings-modal×2
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(31, 41, 55)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(122, 58, 56, 0) …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant L** (1×): /registreerimine
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(43, 38, 32)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(122, 58, 56, 0) …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant M** (1×): /materjalid
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(51, 65, 85)
    - boxShadow = rgba(255, 255, 255, 0.2) 0px 1px 0px 0px inset, rgba(15, 23…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,
      #fff 0%,
      #f…
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = inset 0 1px 0 #fff3, 0 2px 6px #0f172a17
    - --btn-primary-border = 0 solid transparent
- **variant N** (1×): /materjalid
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(51, 65, 85)
    - boxShadow = rgba(255, 255, 255, 0.2) 0px 1px 0px 0px inset, rgba(15, 23…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,
      #fff 0%,
      #f…
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = inset 0 1px 0 #fff3, 0 2px 6px #0f172a17
    - --btn-primary-border = 0 solid transparent
- **variant O** (1×): /dokreziim
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(34, 34, 34)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(122, 58, 56, 0) …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant P** (1×): /documents
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(34, 34, 34)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(122, 58, 56, 0) …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant Q** (1×): /kovisioon
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(37, 50, 70)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(122, 58, 56, 0) …
    - borderTopColor = rgba(122, 58, 56, 0.2)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant R** (1×): /tooheaolu/ulevaade
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(0 0 0 / 0.55)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(122, 58, 56, 0) …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 12px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-text = #243244
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant S** (1×): /tooheaolu/piloot
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(255, 255, 255)
    - boxShadow = rgba(15, 23, 42, 0.1) 0px 4px 10px 0px, rgba(122, 58, 56, 0…
    - borderTopColor = rgba(148, 163, 184, 0.1)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(254, 253, 252, 1) …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,
      #fefdfcfe 0%,
   …
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = 0 4px 10px #0f172a1a
    - --btn-primary-border = 1px solid #94a3b814
- **variant T** (1×): /teenuseprofiil
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgba(0, 0, 0, 0.9)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(122, 58, 56, 0) …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent

## `.button[data-variant="primary"] @primary` @mid — 17 variants

- **variant A** (11×): /hinnastus×4, /registreerimine, /taasta-parool, /documents×3, /uuenda-epost, /uuenda-pin
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - color = rgb(44, 51, 64)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopStyle = solid
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #2f3a4a
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant B** (9×): /tooheaolu/kiirkontroll, /tooheaolu/raske-juhtum, /tooheaolu/toovagivald, /tooheaolu/taastumine, /tooheaolu/toopiirid, /tooheaolu/katkestused, /tooheaolu/tooprotsessid, /tooheaolu/rollipiirid, /tooheaolu/alustaja-tugi
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - color = rgb(36, 50, 68)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopStyle = solid
    - borderTopLeftRadius = 12px
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #243244
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant C** (3×): /tooalase-kasutuse-raamistik×2, /dokreziim
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - color = rgb(44, 51, 64)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopStyle = solid
    - borderTopLeftRadius = 26px
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #2f3a4a
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant D** (3×): /kovisioon×3
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - color = rgb(38, 50, 68)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopStyle = solid
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #2f3a4a
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant E** (2×): /materjalid×2
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - color = rgb(47, 58, 74)
    - boxShadow = rgba(0, 0, 0, 0.2) 0px 3px 8px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopStyle = solid
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #2f3a4a
    - --btn-primary-shadow = 0 3px 8px #00000038
    - --btn-primary-border = 0 solid transparent
- **variant F** (2×): /admin/rag/ingest, /admin/rag/kov
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - color = rgb(44, 51, 64)
    - boxShadow = rgba(38, 24, 22, 0.1) 0px 6px 14px 0px, rgba(255, 255, 255,…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 18px
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #2f3a4a
    - --btn-primary-shadow = 0 6px 14px #2618161a,
    inset 0 1px 0 #ffffff57
    - --btn-primary-border = transparent
- **variant G** (2×): /admin/rag/ingest×2
    - backgroundImage = none
    - color = rgb(44, 51, 64)
    - boxShadow = rgba(38, 24, 22, 0.1) 0px 6px 14px 0px, rgba(255, 255, 255,…
    - borderTopColor = oklab(0.6 0.1 0.05 / 0.75)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = rgb(208 186 179 / 0.9)
    - --btn-primary-text = #2f3a4a
    - --btn-primary-shadow = 0 6px 14px #2618161a,
    inset 0 1px 0 #ffffff57
    - --btn-primary-border = transparent
- **variant H** (2×): /admin/rag/kov×2
    - backgroundImage = none
    - color = rgb(44, 51, 64)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(156, 138, 145, 0.3)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = rgb(220 201 194 / 0.9)
    - --btn-primary-text = #2f3a4a
    - --btn-primary-shadow = 0 6px 14px #2618161a,
    inset 0 1px 0 #ffffff57
    - --btn-primary-border = transparent
- **variant I** (2×): /profiil#account-settings-modal×2
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - color = rgb(63, 71, 86)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopStyle = solid
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #2f3a4a
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant J** (1×): /tooalase-kasutuse-raamistik
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - color = rgb(47, 58, 74)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopStyle = solid
    - borderTopLeftRadius = 26px
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #2f3a4a
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant K** (1×): /dokreziim
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - color = rgb(51, 65, 85)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopStyle = solid
    - borderTopLeftRadius = 26px
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #2f3a4a
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant L** (1×): /tooheaolu/ulevaade
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - color = rgb(0 0 0 / 0.55)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopStyle = solid
    - borderTopLeftRadius = 12px
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #243244
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant M** (1×): /tooheaolu/piloot
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - color = rgb(255, 255, 255)
    - boxShadow = rgba(38, 24, 22, 0.1) 0px 6px 14px 0px, rgba(255, 255, 255,…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopStyle = none
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #2f3a4a
    - --btn-primary-shadow = 0 6px 14px #2618161a,
    inset 0 1px 0 #ffffff57
    - --btn-primary-border = transparent
- **variant N** (1×): /teenuseprofiil
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - color = rgba(0, 0, 0, 0.9)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopStyle = solid
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #2f3a4a
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant O** (1×): /eelpoordumised
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - color = rgb(47, 58, 74)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopStyle = solid
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #2f3a4a
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant P** (1×): /admin/rag/ingest
    - backgroundImage = none
    - color = rgb(44, 51, 64)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(173, 161, 165, 0.2)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = rgb(220 201 194 / 0.9)
    - --btn-primary-text = #2f3a4a
    - --btn-primary-shadow = 0 6px 14px #2618161a,
    inset 0 1px 0 #ffffff57
    - --btn-primary-border = transparent
- **variant Q** (1×): /admin/rag/kov
    - backgroundImage = none
    - color = rgb(44, 51, 64)
    - boxShadow = rgba(38, 24, 22, 0.1) 0px 6px 14px 0px, rgba(255, 255, 255,…
    - borderTopColor = rgb(143 86 85 / 0.8)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = rgb(208 186 179 / 0.9)
    - --btn-primary-text = #2f3a4a
    - --btn-primary-shadow = 0 6px 14px #2618161a,
    inset 0 1px 0 #ffffff57
    - --btn-primary-border = transparent

## `.button[data-variant="primary"] @primary` @dark — 15 variants

- **variant A** (11×): /hinnastus×4, /taasta-parool, /documents, /eelpoordumised, /uuenda-epost, /uuenda-pin, /profiil#account-settings-modal×2
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - color = rgb(242, 242, 242)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(82% 66% at 50% -14%,
      #ffffff1e 0%,
  …
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant B** (9×): /tooheaolu/kiirkontroll, /tooheaolu/raske-juhtum, /tooheaolu/toovagivald, /tooheaolu/taastumine, /tooheaolu/toopiirid, /tooheaolu/katkestused, /tooheaolu/tooprotsessid, /tooheaolu/rollipiirid, /tooheaolu/alustaja-tugi
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - color = rgb(36, 50, 68)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 12px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(82% 66% at 50% -14%,
      #ffffff1e 0%,
  …
    - --btn-primary-text = #243244
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant C** (3×): /tooalase-kasutuse-raamistik×2, /dokreziim
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - color = rgb(242, 242, 242)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(82% 66% at 50% -14%,
      #ffffff1e 0%,
  …
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant D** (3×): /registreerimine, /documents×2
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - color = rgb(242, 242, 242)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(82% 66% at 50% -14%,
      #ffffff1e 0%,
  …
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant E** (3×): /admin/rag/ingest, /admin/rag/kov×2
    - backgroundImage = none
    - color = rgb(242, 242, 242)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(255, 255, 255, 0.15)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = rgb(73 47 50 / 0.5)
    - --btn-primary-bg = radial-gradient(82% 66% at 50% -14%,
      #ffffff1e 0%,
  …
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = inset 0 1px 0 #ffffff0f,
    0 5px 12px #0003
- **variant F** (3×): /admin/rag/ingest×2, /admin/rag/kov
    - backgroundImage = none
    - color = rgb(242, 242, 242)
    - boxShadow = rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(0, 0,…
    - borderTopColor = rgb(202 125 125 / 0.7)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = rgb(90 56 59 / 0.55)
    - --btn-primary-bg = radial-gradient(82% 66% at 50% -14%,
      #ffffff1e 0%,
  …
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = inset 0 1px 0 #ffffff0f,
    0 5px 12px #0003
- **variant G** (2×): /kovisioon×2
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - color = rgb(238, 242, 248)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(82% 66% at 50% -14%,
      #ffffff1e 0%,
  …
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant H** (2×): /admin/rag/ingest, /admin/rag/kov
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - color = rgb(242, 242, 242)
    - boxShadow = rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(0, 0,…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 18px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(82% 66% at 50% -14%,
      #ffffff1e 0%,
  …
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = inset 0 1px 0 #ffffff0f,
    0 5px 12px #0003
- **variant I** (1×): /materjalid
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - color = rgb(242, 242, 242)
    - boxShadow = rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(0, 0,…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(82% 66% at 50% -14%,
      #ffffff1c 0%,
  …
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = inset 0 1px 0 #ffffff0f,
    0 5px 12px #00000038
- **variant J** (1×): /materjalid
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - color = rgb(242, 242, 242)
    - boxShadow = rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(0, 0,…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(82% 66% at 50% -14%,
      #ffffff1c 0%,
  …
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = inset 0 1px 0 #ffffff0f,
    0 5px 12px #00000038
- **variant K** (1×): /dokreziim
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - color = rgb(242, 242, 242)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(82% 66% at 50% -14%,
      #ffffff1e 0%,
  …
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant L** (1×): /kovisioon
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - color = rgb(238, 242, 248)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(248, 253, 255, 0.2)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(82% 66% at 50% -14%,
      #ffffff1e 0%,
  …
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant M** (1×): /tooheaolu/ulevaade
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - color = rgb(255 255 255 / 0.55)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 12px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(82% 66% at 50% -14%,
      #ffffff1e 0%,
  …
    - --btn-primary-text = #243244
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant N** (1×): /tooheaolu/piloot
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - color = rgb(255, 255, 255)
    - boxShadow = rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(0, 0,…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(82% 66% at 50% -14%,
      #ffffff1e 0%,
  …
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = inset 0 1px 0 #ffffff0f,
    0 5px 12px #0003
- **variant O** (1×): /teenuseprofiil
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - color = rgba(255, 255, 255, 0.9)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(82% 66% at 50% -14%,
      #ffffff1e 0%,
  …
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021

## `.button[data-variant="primary"] @primary` @night — 17 variants

- **variant A** (9×): /hinnastus×4, /taasta-parool, /uuenda-epost, /uuenda-pin, /profiil#account-settings-modal×2
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - color = rgb(242, 242, 242)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant B** (9×): /tooheaolu/kiirkontroll, /tooheaolu/raske-juhtum, /tooheaolu/toovagivald, /tooheaolu/taastumine, /tooheaolu/toopiirid, /tooheaolu/katkestused, /tooheaolu/tooprotsessid, /tooheaolu/rollipiirid, /tooheaolu/alustaja-tugi
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - color = rgb(36, 50, 68)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 12px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #243244
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant C** (4×): /materjalid, /kovisioon×2, /eelpoordumised
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - color = rgba(234, 238, 245, 0.95)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant D** (3×): /admin/rag/ingest, /admin/rag/kov×2
    - backgroundImage = none
    - color = rgb(230, 229, 227)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(118, 149, 219, 0.1)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = rgb(77 57 64 / 0.5)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = inset 0 1px 0 #dcecff1a,
    0 5px 12px #0206103d
- **variant E** (3×): /admin/rag/ingest×2, /admin/rag/kov
    - backgroundImage = none
    - color = rgb(230, 229, 227)
    - boxShadow = rgba(220, 236, 255, 0.1) 0px 1px 0px 0px inset, rgba(2, 6, …
    - borderTopColor = rgb(201 134 137 / 0.7)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = rgb(96 68 74 / 0.5)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = inset 0 1px 0 #dcecff1a,
    0 5px 12px #0206103d
- **variant F** (2×): /tooalase-kasutuse-raamistik×2
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - color = rgb(242, 242, 242)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant G** (2×): /documents×2
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - color = rgb(230, 229, 227)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant H** (2×): /admin/rag/ingest, /admin/rag/kov
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - color = rgb(230, 229, 227)
    - boxShadow = rgba(220, 236, 255, 0.1) 0px 1px 0px 0px inset, rgba(2, 6, …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 18px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = inset 0 1px 0 #dcecff1a,
    0 5px 12px #0206103d
- **variant I** (1×): /registreerimine
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - color = rgb(242, 242, 242)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant J** (1×): /materjalid
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - color = rgba(234, 238, 245, 0.95)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant K** (1×): /dokreziim
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - color = rgba(228, 236, 255, 0.95)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant L** (1×): /dokreziim
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - color = rgb(230, 229, 227)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant M** (1×): /documents
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - color = rgb(230, 229, 227)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant N** (1×): /kovisioon
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - color = rgba(234, 238, 245, 0.95)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(226, 232, 238, 0.2)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant O** (1×): /tooheaolu/ulevaade
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - color = rgb(255 255 255 / 0.55)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 12px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #243244
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant P** (1×): /tooheaolu/piloot
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - color = rgb(255, 255, 255)
    - boxShadow = rgba(220, 236, 255, 0.1) 0px 1px 0px 0px inset, rgba(2, 6, …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = inset 0 1px 0 #dcecff1a,
    0 5px 12px #0206103d
- **variant Q** (1×): /teenuseprofiil
    - backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - color = rgba(255, 255, 255, 0.9)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021

## `.button[data-variant="primary"] @primary` @mono — 7 variants

- **variant A** (19×): /hinnastus×4, /registreerimine, /taasta-parool, /documents×3, /kovisioon×3, /teenuseprofiil, /tellimus, /eelpoordumised, /uuenda-epost, /uuenda-pin, /profiil#account-settings-modal×2
    - backgroundImage = radial-gradient(118% 102% at 50% 8%, rgba(62, 62, 62, 0.9) …
    - color = rgba(230, 230, 230, 0.95)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(118% 102% at 50% 8%, rgba(62, 62, 62, 0.9) …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #e6e6e6f5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant B** (10×): /tooheaolu/kiirkontroll, /tooheaolu/ulevaade, /tooheaolu/raske-juhtum, /tooheaolu/toovagivald, /tooheaolu/taastumine, /tooheaolu/toopiirid, /tooheaolu/katkestused, /tooheaolu/tooprotsessid, /tooheaolu/rollipiirid, /tooheaolu/alustaja-tugi
    - backgroundImage = radial-gradient(118% 102% at 50% 8%, rgba(62, 62, 62, 0.9) …
    - color = rgba(230, 230, 230, 0.95)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 12px
    - hover backgroundImage = radial-gradient(118% 102% at 50% 8%, rgba(62, 62, 62, 0.9) …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #243244
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant C** (4×): /tooalase-kasutuse-raamistik×2, /dokreziim×2
    - backgroundImage = radial-gradient(118% 102% at 50% 8%, rgba(62, 62, 62, 0.9) …
    - color = rgba(230, 230, 230, 0.95)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - hover backgroundImage = radial-gradient(118% 102% at 50% 8%, rgba(62, 62, 62, 0.9) …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #e6e6e6f5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant D** (3×): /materjalid×2, /tooheaolu/piloot
    - backgroundImage = radial-gradient(118% 102% at 50% 8%, rgba(62, 62, 62, 0.9) …
    - color = rgba(230, 230, 230, 0.95)
    - boxShadow = rgba(214, 214, 214, 0.1) 0px 1px 0px 0px inset, rgba(7, 7, …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(118% 102% at 50% 8%, rgba(62, 62, 62, 0.9) …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #e6e6e6f5
    - --btn-primary-shadow = inset 0 1px 0 #d6d6d614,
    0 5px 12px #0707073d
- **variant E** (3×): /admin/rag/ingest, /admin/rag/kov×2
    - backgroundImage = none
    - color = rgb(200, 200, 200)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(214, 214, 214, 0.1)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = rgb(67 48 48 / 0.7)
    - --btn-primary-text = #e6e6e6f5
    - --btn-primary-shadow = inset 0 1px 0 #d6d6d614,
    0 5px 12px #0707073d
- **variant F** (3×): /admin/rag/ingest×2, /admin/rag/kov
    - backgroundImage = none
    - color = rgb(200, 200, 200)
    - boxShadow = rgba(214, 214, 214, 0.1) 0px 1px 0px 0px inset, rgba(7, 7, …
    - borderTopColor = rgb(198 118 118 / 0.7)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = rgb(82 56 56 / 0.7)
    - --btn-primary-text = #e6e6e6f5
    - --btn-primary-shadow = inset 0 1px 0 #d6d6d614,
    0 5px 12px #0707073d
- **variant G** (2×): /admin/rag/ingest, /admin/rag/kov
    - backgroundImage = radial-gradient(118% 102% at 50% 8%, rgba(62, 62, 62, 0.9) …
    - color = rgba(230, 230, 230, 0.95)
    - boxShadow = rgba(214, 214, 214, 0.1) 0px 1px 0px 0px inset, rgba(7, 7, …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 18px
    - hover backgroundImage = radial-gradient(118% 102% at 50% 8%, rgba(62, 62, 62, 0.9) …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #e6e6e6f5
    - --btn-primary-shadow = inset 0 1px 0 #d6d6d614,
    0 5px 12px #0707073d

## `.button[data-variant="primary"] @primary` @hc — 13 variants

- **variant A** (10×): /tooheaolu/kiirkontroll, /tooheaolu/ulevaade, /tooheaolu/raske-juhtum, /tooheaolu/toovagivald, /tooheaolu/taastumine, /tooheaolu/toopiirid, /tooheaolu/katkestused, /tooheaolu/tooprotsessid, /tooheaolu/rollipiirid, /tooheaolu/alustaja-tugi
    - backgroundImage = radial-gradient(124% 96% at 50% 6%, rgba(27, 39, 53, 0.5) 0…
    - boxShadow = none
    - borderTopColor = rgba(255, 234, 0, 0.65)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 12px
    - hover backgroundImage = linear-gradient(rgba(255, 234, 0, 0.1) 0%, rgba(255, 234, 0…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(124% 96% at 50% 6%,
    #1b273580 0%,
    #…
    - --btn-primary-bg-hover = linear-gradient(180deg, #ffea0014 0%, #ffea0009 100%),
    …
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
    - --btn-danger-bg = 
    - --btn-danger-text = 
- **variant B** (6×): /registreerimine, /taasta-parool, /uuenda-epost, /uuenda-pin, /profiil#account-settings-modal×2
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
    - --btn-primary-border = 2px solid #ffea00a8
    - --btn-danger-bg = 
    - --btn-danger-text = 
- **variant C** (5×): /hinnastus×4, /teenuseprofiil
    - backgroundImage = radial-gradient(124% 96% at 50% 6%, rgba(27, 39, 53, 0.5) 0…
    - boxShadow = none
    - borderTopColor = rgba(255, 234, 0, 0.65)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = linear-gradient(rgba(255, 234, 0, 0.1) 0%, rgba(255, 234, 0…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(124% 96% at 50% 6%,
    #1b273580 0%,
    #…
    - --btn-primary-bg-hover = linear-gradient(180deg, #ffea0014 0%, #ffea0009 100%),
    …
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
    - --btn-danger-bg = 
    - --btn-danger-text = 
- **variant D** (3×): /documents×3
    - backgroundImage = radial-gradient(124% 96% at 50% 6%, rgba(27, 39, 53, 0.5) 0…
    - boxShadow = none
    - borderTopColor = rgba(255, 234, 0, 0.65)
    - borderTopWidth = 2px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = linear-gradient(rgba(255, 234, 0, 0.1) 0%, rgba(255, 234, 0…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = #0e14206b
    - --btn-primary-bg-hover = #ffea001f
    - --btn-primary-shadow = none
    - --btn-primary-border = 2px solid #ffea00a8
    - --btn-danger-bg = 
    - --btn-danger-text = 
- **variant E** (3×): /kovisioon×3
    - backgroundImage = radial-gradient(124% 96% at 50% 6%, rgba(27, 39, 53, 0.5) 0…
    - boxShadow = none
    - borderTopColor = rgba(255, 234, 0, 0.65)
    - borderTopWidth = 2px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = linear-gradient(rgba(255, 234, 0, 0.1) 0%, rgba(255, 234, 0…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = #0e14206b
    - --btn-primary-bg-hover = #ffea001f
    - --btn-primary-shadow = none
    - --btn-primary-border = 2px solid #ffea00a8
    - --btn-danger-bg = #090a0f
    - --btn-danger-text = #ffea00
- **variant F** (3×): /admin/rag/ingest, /admin/rag/kov×2
    - backgroundImage = none
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(255, 234, 0, 0.5)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = rgb(70 68 18 / 0.65)
    - --btn-primary-bg = #0e14206b
    - --btn-primary-bg-hover = #ffea001f
    - --btn-primary-shadow = none
    - --btn-primary-border = 2px solid #ffea00a8
    - --btn-danger-bg = 
    - --btn-danger-text = 
- **variant G** (3×): /admin/rag/ingest×2, /admin/rag/kov
    - backgroundImage = none
    - boxShadow = none
    - borderTopColor = rgb(255 234 0 / 0.85)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 13px
    - hover backgroundImage = none
    - hover backgroundColor = rgb(88 84 16 / 0.7)
    - --btn-primary-bg = #0e14206b
    - --btn-primary-bg-hover = #ffea001f
    - --btn-primary-shadow = none
    - --btn-primary-border = 2px solid #ffea00a8
    - --btn-danger-bg = 
    - --btn-danger-text = 
- **variant H** (2×): /tooalase-kasutuse-raamistik×2
    - backgroundImage = radial-gradient(124% 96% at 50% 6%, rgba(27, 39, 53, 0.5) 0…
    - boxShadow = none
    - borderTopColor = rgba(255, 234, 0, 0.65)
    - borderTopWidth = 2px
    - borderTopLeftRadius = 26px
    - hover backgroundImage = linear-gradient(rgba(255, 234, 0, 0.1) 0%, rgba(255, 234, 0…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(124% 96% at 50% 6%,
    #1b273580 0%,
    #…
    - --btn-primary-bg-hover = linear-gradient(180deg, #ffea0014 0%, #ffea0009 100%),
    …
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 2px solid #ffea00b8
    - --btn-danger-bg = 
    - --btn-danger-text = 
- **variant I** (2×): /materjalid×2
    - backgroundImage = radial-gradient(124% 96% at 50% 6%, rgba(27, 39, 53, 0.5) 0…
    - boxShadow = none
    - borderTopColor = rgba(255, 234, 0, 0.65)
    - borderTopWidth = 2px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = linear-gradient(rgba(255, 234, 0, 0.1) 0%, rgba(255, 234, 0…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(82% 66% at 50% -14%,
      #ffffff1c 0%,
  …
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% -14%,
      #ffffff24 0%,
  …
    - --btn-primary-shadow = inset 0 1px 0 #ffffff0f,
    0 5px 12px #00000038
    - --btn-primary-border = 0 solid transparent
    - --btn-danger-bg = 
    - --btn-danger-text = 
- **variant J** (2×): /dokreziim×2
    - backgroundImage = radial-gradient(124% 96% at 50% 6%, rgba(27, 39, 53, 0.5) 0…
    - boxShadow = none
    - borderTopColor = rgba(255, 234, 0, 0.65)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - hover backgroundImage = linear-gradient(rgba(255, 234, 0, 0.1) 0%, rgba(255, 234, 0…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = #0e14206b
    - --btn-primary-bg-hover = #ffea001f
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
    - --btn-danger-bg = 
    - --btn-danger-text = 
- **variant K** (2×): /admin/rag/ingest, /admin/rag/kov
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
    - --btn-primary-border = 2px solid #ffea00a8
    - --btn-danger-bg = 
    - --btn-danger-text = 
- **variant L** (1×): /tooheaolu/piloot
    - backgroundImage = radial-gradient(124% 96% at 50% 6%, rgba(27, 39, 53, 0.5) 0…
    - boxShadow = none
    - borderTopColor = rgba(255, 234, 0, 0.65)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = linear-gradient(rgba(255, 234, 0, 0.1) 0%, rgba(255, 234, 0…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(124% 96% at 50% 6%,
    #1b273580 0%,
    #…
    - --btn-primary-bg-hover = linear-gradient(180deg, #ffea0014 0%, #ffea0009 100%),
    …
    - --btn-primary-shadow = none
    - --btn-primary-border = 0 solid transparent
    - --btn-danger-bg = 
    - --btn-danger-text = 
- **variant M** (1×): /eelpoordumised
    - backgroundImage = radial-gradient(124% 96% at 50% 6%, rgba(27, 39, 53, 0.5) 0…
    - boxShadow = none
    - borderTopColor = rgba(255, 234, 0, 0.65)
    - borderTopWidth = 2px
    - borderTopLeftRadius = 999px
    - hover backgroundImage = linear-gradient(rgba(255, 234, 0, 0.1) 0%, rgba(255, 234, 0…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg = radial-gradient(124% 96% at 50% 6%,
    #1b273580 0%,
    #…
    - --btn-primary-bg-hover = linear-gradient(180deg, #ffea0014 0%, #ffea0009 100%),
    …
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
    - --btn-danger-bg = 
    - --btn-danger-text = 

## `.back-button` @light — 2 variants

- **variant A** (39×): /hinnastus, /voimalused, /autorilt, /kasutusjuhend, /kasutustingimused, /privaatsustingimused, /tooalase-kasutuse-raamistik, /registreerimine, /taasta-parool, /materjalid, /dokreziim, /documents, /teekond, /kovisioon, /tooheaolu, /tooheaolu/kiirkontroll, /tooheaolu/ulevaade, /tooheaolu/raske-juhtum, /tooheaolu/toovagivald, /tooheaolu/taastumine, /tooheaolu/toopiirid, /tooheaolu/katkestused, /tooheaolu/tooprotsessid, /tooheaolu/rollipiirid, /tooheaolu/alustaja-tugi, /teenuseprofiil, /tellimus, /eelpoordumised, /ruum, /uuenda-epost, /uuenda-pin, /admin/rag, /admin/rag/documents, /admin/rag/ingest, /admin/rag/kov, /admin/rag/organizations, /admin/rag/source-packages, /profiil#account-settings-modal×2
    - borderTopStyle = solid
- **variant B** (1×): /teenusekaart
    - borderTopStyle = none

## `.back-button` @mid — 2 variants

- **variant A** (39×): /hinnastus, /voimalused, /autorilt, /kasutusjuhend, /kasutustingimused, /privaatsustingimused, /tooalase-kasutuse-raamistik, /registreerimine, /taasta-parool, /materjalid, /dokreziim, /documents, /kovisioon, /tooheaolu, /tooheaolu/kiirkontroll, /tooheaolu/ulevaade, /tooheaolu/raske-juhtum, /tooheaolu/toovagivald, /tooheaolu/taastumine, /tooheaolu/toopiirid, /tooheaolu/katkestused, /tooheaolu/tooprotsessid, /tooheaolu/rollipiirid, /tooheaolu/alustaja-tugi, /teenuseprofiil, /tellimus, /eelpoordumised, /rooms, /ruum, /uuenda-epost, /uuenda-pin, /admin/rag, /admin/rag/documents, /admin/rag/ingest, /admin/rag/kov, /admin/rag/organizations, /admin/rag/source-packages, /profiil#account-settings-modal×2
    - borderTopStyle = solid
- **variant B** (1×): /teenusekaart
    - borderTopStyle = none

## `.back-button` @dark — 2 variants

- **variant A** (40×): /hinnastus, /voimalused, /autorilt, /kasutusjuhend, /kasutustingimused, /privaatsustingimused, /tooalase-kasutuse-raamistik, /registreerimine, /taasta-parool, /profiil, /materjalid, /dokreziim, /documents, /kovisioon, /tooheaolu, /tooheaolu/kiirkontroll, /tooheaolu/ulevaade, /tooheaolu/raske-juhtum, /tooheaolu/toovagivald, /tooheaolu/taastumine, /tooheaolu/toopiirid, /tooheaolu/katkestused, /tooheaolu/tooprotsessid, /tooheaolu/rollipiirid, /tooheaolu/alustaja-tugi, /teenuseprofiil, /tellimus, /eelpoordumised, /rooms, /ruum, /uuenda-epost, /uuenda-pin, /admin/rag, /admin/rag/documents, /admin/rag/ingest, /admin/rag/kov, /admin/rag/organizations, /admin/rag/source-packages, /profiil#account-settings-modal×2
    - borderTopStyle = solid
- **variant B** (1×): /teenusekaart
    - borderTopStyle = none

## `.back-button` @night — 2 variants

- **variant A** (39×): /hinnastus, /voimalused, /autorilt, /kasutusjuhend, /kasutustingimused, /privaatsustingimused, /tooalase-kasutuse-raamistik, /registreerimine, /taasta-parool, /materjalid, /dokreziim, /documents, /teekond, /kovisioon, /tooheaolu, /tooheaolu/kiirkontroll, /tooheaolu/ulevaade, /tooheaolu/raske-juhtum, /tooheaolu/toovagivald, /tooheaolu/taastumine, /tooheaolu/toopiirid, /tooheaolu/katkestused, /tooheaolu/tooprotsessid, /tooheaolu/rollipiirid, /tooheaolu/alustaja-tugi, /teenuseprofiil, /tellimus, /eelpoordumised, /ruum, /uuenda-epost, /uuenda-pin, /admin/rag, /admin/rag/documents, /admin/rag/ingest, /admin/rag/kov, /admin/rag/organizations, /admin/rag/source-packages, /profiil#account-settings-modal×2
    - borderTopStyle = solid
- **variant B** (1×): /teenusekaart
    - borderTopStyle = none

## `.back-button` @mono — 2 variants

- **variant A** (40×): /hinnastus, /voimalused, /autorilt, /kasutusjuhend, /kasutustingimused, /privaatsustingimused, /tooalase-kasutuse-raamistik, /registreerimine, /taasta-parool, /materjalid, /dokreziim, /documents, /teekond, /kovisioon, /tooheaolu, /tooheaolu/kiirkontroll, /tooheaolu/ulevaade, /tooheaolu/raske-juhtum, /tooheaolu/toovagivald, /tooheaolu/taastumine, /tooheaolu/toopiirid, /tooheaolu/katkestused, /tooheaolu/tooprotsessid, /tooheaolu/rollipiirid, /tooheaolu/alustaja-tugi, /teenuseprofiil, /tellimus, /eelpoordumised, /rooms, /ruum, /uuenda-epost, /uuenda-pin, /admin/rag, /admin/rag/documents, /admin/rag/ingest, /admin/rag/kov, /admin/rag/organizations, /admin/rag/source-packages, /profiil#account-settings-modal×2
    - borderTopColor = rgb(255, 255, 255)
    - borderTopStyle = solid
- **variant B** (1×): /teenusekaart
    - borderTopColor = rgb(197, 113, 113)
    - borderTopStyle = none

## `.invite-primary-btn` @light — 2 variants

- **variant A** (1×): /vestlus
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - boxShadow = rgba(15, 23, 42, 0.05) 0px 1px 4px 0px, rgba(15, 23, 42, 0.…
    - borderTopColor = rgb(31, 41, 55)
    - borderTopStyle = none
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(254, 253, 252, 1) …
- **variant B** (1×): /dokreziim
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …
    - boxShadow = rgba(15, 23, 42, 0.1) 0px 5px 12px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopStyle = solid
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …

## `.invite-primary-btn` @mid — 2 variants

- **variant A** (1×): /vestlus
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - boxShadow = rgba(38, 24, 22, 0.1) 0px 6px 14px 0px, rgba(255, 255, 255,…
    - borderTopColor = rgb(47, 58, 74)
    - borderTopStyle = none
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
- **variant B** (1×): /dokreziim
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(246, 237, 233, 0.5…
    - boxShadow = rgba(15, 23, 42, 0.1) 0px 5px 12px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopStyle = solid
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(246, 237, 233, 0.5…

## `.invite-primary-btn` @dark — 2 variants

- **variant A** (1×): /vestlus
    - boxShadow = rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(0, 0,…
- **variant B** (1×): /dokreziim
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px

## `.invite-primary-btn` @night — 2 variants

- **variant A** (1×): /vestlus
    - boxShadow = rgba(220, 236, 255, 0.1) 0px 1px 0px 0px inset, rgba(2, 6, …
- **variant B** (1×): /dokreziim
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px

## `.invite-primary-btn` @mono — 2 variants

- **variant A** (1×): /vestlus
    - boxShadow = rgba(214, 214, 214, 0.1) 0px 1px 0px 0px inset, rgba(7, 7, …
- **variant B** (1×): /dokreziim
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px

## `.chat-send-btn` @light — 2 variants

- **variant A** (1×): /vestlus
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - boxShadow = rgba(15, 23, 42, 0.05) 0px 1px 4px 0px, rgba(15, 23, 42, 0.…
    - borderTopColor = rgb(31, 41, 55)
    - borderTopStyle = none
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(254, 253, 252, 1) …
- **variant B** (1×): /dokreziim
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …
    - boxShadow = rgba(15, 23, 42, 0.1) 0px 5px 12px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopStyle = solid
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …

## `.chat-send-btn` @mid — 2 variants

- **variant A** (1×): /vestlus
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - boxShadow = rgba(38, 24, 22, 0.1) 0px 6px 14px 0px, rgba(255, 255, 255,…
    - borderTopColor = rgb(47, 58, 74)
    - borderTopStyle = none
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
- **variant B** (1×): /dokreziim
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(246, 237, 233, 0.5…
    - boxShadow = rgba(15, 23, 42, 0.1) 0px 5px 12px 0px
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopStyle = solid
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(246, 237, 233, 0.5…

## `.chat-send-btn` @dark — 2 variants

- **variant A** (1×): /vestlus
    - boxShadow = rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(0, 0,…
- **variant B** (1×): /dokreziim
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px

## `.chat-send-btn` @night — 2 variants

- **variant A** (1×): /vestlus
    - boxShadow = rgba(220, 236, 255, 0.1) 0px 1px 0px 0px inset, rgba(2, 6, …
- **variant B** (1×): /dokreziim
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px

## `.chat-send-btn` @mono — 2 variants

- **variant A** (1×): /vestlus
    - boxShadow = rgba(214, 214, 214, 0.1) 0px 1px 0px 0px inset, rgba(7, 7, …
- **variant B** (1×): /dokreziim
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px

## `.profile-orbit-menu__center` @dark — 2 variants

- **variant A** (1×): /profiil
    - boxShadow = rgba(255, 255, 255, 0.3) 0px 0px 22px 0px, rgba(0, 0, 0, 0.…
- **variant B** (1×): /profiil#profile-orbit-open
    - boxShadow = rgba(255, 255, 255, 0.4) 0px 0px 28px 0px, rgba(0, 0, 0, 0.…

## `.profile-orbit-menu__center` @hc — 2 variants

- **variant A** (1×): /profiil
    - boxShadow = rgba(255, 234, 0, 0.4) 0px 0px 26px 0px
- **variant B** (1×): /profiil#profile-orbit-open
    - boxShadow = rgba(0, 0, 0, 0.1) 0px 6px 13px 0px, rgba(255, 122, 126, 0.…

## `.dashboard-info-trigger-corner` @hc — 2 variants

- **variant A** (14×): /materjalid, /tooheaolu, /tooheaolu/kiirkontroll, /tooheaolu/ulevaade, /tooheaolu/raske-juhtum, /tooheaolu/toovagivald, /tooheaolu/taastumine, /tooheaolu/toopiirid, /tooheaolu/katkestused, /tooheaolu/tooprotsessid, /tooheaolu/rollipiirid, /tooheaolu/alustaja-tugi, /teenuseprofiil, /eelpoordumised
    - borderTopWidth = 0px
- **variant B** (3×): /dokreziim, /documents, /kovisioon
    - borderTopWidth = 2px

## `.invite-primary-btn @primary` @light — 3 variants

- **variant A** (2×): /admin/rag/ingest, /admin/rag/kov
    - color = rgb(34, 34, 34)
    - boxShadow = rgba(15, 23, 42, 0.1) 0px 4px 10px 0px, rgba(122, 58, 56, 0…
    - borderTopColor = rgba(148, 163, 184, 0.1)
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 18px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(254, 253, 252, 1) …
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,
      #fefdfcfe 0%,
   …
    - --btn-primary-shadow = 0 4px 10px #0f172a1a
    - --btn-primary-border = 1px solid #94a3b814
- **variant B** (1×): /dokreziim
    - color = rgb(51, 65, 85)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(122, 58, 56, 0) …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant C** (1×): /dokreziim
    - color = rgb(34, 34, 34)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(122, 58, 56, 0) …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent

## `.invite-primary-btn @primary` @mid — 3 variants

- **variant A** (2×): /admin/rag/ingest, /admin/rag/kov
    - color = rgb(44, 51, 64)
    - boxShadow = rgba(38, 24, 22, 0.1) 0px 6px 14px 0px, rgba(255, 255, 255,…
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 18px
    - --btn-primary-shadow = 0 6px 14px #2618161a,
    inset 0 1px 0 #ffffff57
    - --btn-primary-border = transparent
- **variant B** (1×): /dokreziim
    - color = rgb(51, 65, 85)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(0, 0, 0, 0) 0px …
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant C** (1×): /dokreziim
    - color = rgb(44, 51, 64)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(0, 0, 0, 0) 0px …
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent

## `.invite-primary-btn @primary` @dark — 3 variants

- **variant A** (2×): /admin/rag/ingest, /admin/rag/kov
    - boxShadow = rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(0, 0,…
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 18px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - --btn-primary-shadow = inset 0 1px 0 #ffffff0f,
    0 5px 12px #0003
- **variant B** (1×): /dokreziim
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant C** (1×): /dokreziim
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
    - --btn-primary-shadow = 0 4px 10px #00000021

## `.invite-primary-btn @primary` @night — 3 variants

- **variant A** (2×): /admin/rag/ingest, /admin/rag/kov
    - color = rgb(230, 229, 227)
    - boxShadow = rgba(220, 236, 255, 0.1) 0px 1px 0px 0px inset, rgba(2, 6, …
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 18px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - --btn-primary-shadow = inset 0 1px 0 #dcecff1a,
    0 5px 12px #0206103d
- **variant B** (1×): /dokreziim
    - color = rgba(228, 236, 255, 0.95)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant C** (1×): /dokreziim
    - color = rgb(230, 229, 227)
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px, rgba(255, 122, 126, 0…
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
    - --btn-primary-shadow = 0 4px 10px #00000021

## `.invite-primary-btn @primary` @mono — 2 variants

- **variant A** (2×): /dokreziim×2
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant B** (2×): /admin/rag/ingest, /admin/rag/kov
    - boxShadow = rgba(214, 214, 214, 0.1) 0px 1px 0px 0px inset, rgba(7, 7, …
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 18px
    - --btn-primary-shadow = inset 0 1px 0 #d6d6d614,
    0 5px 12px #0707073d

## `.invite-primary-btn @primary` @hc — 2 variants

- **variant A** (2×): /dokreziim×2
    - borderTopWidth = 0px
    - borderTopLeftRadius = 26px
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant B** (2×): /admin/rag/ingest, /admin/rag/kov
    - borderTopWidth = 0.8px
    - borderTopLeftRadius = 18px
    - --btn-primary-shadow = none
    - --btn-primary-border = 2px solid #ffea00a8

## `.drawer-pill-btn @primary` @light — 2 variants

- **variant A** (1×): /dokreziim
    - color = rgb(51, 65, 85)
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
- **variant B** (1×): /dokreziim
    - color = rgb(34, 34, 34)
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …

## `.drawer-pill-btn @primary` @mid — 2 variants

- **variant A** (1×): /dokreziim
    - color = rgb(51, 65, 85)
- **variant B** (1×): /dokreziim
    - color = rgb(44, 51, 64)

## `.drawer-pill-btn @primary` @dark — 2 variants

- **variant A** (1×): /dokreziim
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…
- **variant B** (1×): /dokreziim
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(255, 255, 255, 0.…

## `.drawer-pill-btn @primary` @night — 2 variants

- **variant A** (1×): /dokreziim
    - color = rgba(228, 236, 255, 0.95)
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…
- **variant B** (1×): /dokreziim
    - color = rgb(230, 229, 227)
    - hover backgroundImage = radial-gradient(82% 66% at 50% -14%, rgba(222, 236, 255, 0.…

## `.documents-dropdown-trigger` @light — 5 variants

- **variant A** (35×): /tooheaolu/kiirkontroll×4, /tooheaolu/raske-juhtum×4, /tooheaolu/toovagivald×4, /tooheaolu/taastumine×4, /tooheaolu/toopiirid×4, /tooheaolu/katkestused×4, /tooheaolu/tooprotsessid×4, /tooheaolu/rollipiirid×4, /tooheaolu/alustaja-tugi×3
    - backgroundImage = none
    - color = rgba(0, 0, 0, 0.95)
    - boxShadow = none
    - borderTopColor = rgba(122, 58, 56, 0.3)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 12px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(255, 255, 255, 0.65)
- **variant B** (10×): /admin/rag/documents×4, /admin/rag/ingest×2, /admin/rag/kov×4
    - backgroundImage = none
    - color = rgb(34, 34, 34)
    - boxShadow = rgba(15, 23, 42, 0.05) 0px 4px 14px 0px
    - borderTopColor = rgba(190, 196, 208, 0.35)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 999px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(252, 251, 249, 0.9)
- **variant C** (5×): /dokreziim×4, /documents
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgb(31, 41, 55)
    - boxShadow = rgba(15, 23, 42, 0.1) 0px 4px 10px 0px
    - borderTopColor = rgba(148, 163, 184, 0.1)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …
    - hover backgroundColor = rgba(0, 0, 0, 0)
- **variant D** (2×): /teenuseprofiil×2
    - backgroundImage = none
    - color = rgb(31, 41, 55)
    - boxShadow = none
    - borderTopColor = rgb(31, 41, 55)
    - borderTopWidth = 0px
    - borderTopStyle = none
    - borderTopLeftRadius = 14px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(0, 0, 0, 0)
- **variant E** (1×): /kovisioon
    - backgroundImage = none
    - color = rgb(31, 41, 55)
    - boxShadow = none
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopStyle = none
    - borderTopLeftRadius = 999px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(0, 0, 0, 0)

## `.documents-dropdown-trigger` @mid — 5 variants

- **variant A** (35×): /tooheaolu/kiirkontroll×4, /tooheaolu/raske-juhtum×4, /tooheaolu/toovagivald×4, /tooheaolu/taastumine×4, /tooheaolu/toopiirid×4, /tooheaolu/katkestused×4, /tooheaolu/tooprotsessid×4, /tooheaolu/rollipiirid×4, /tooheaolu/alustaja-tugi×3
    - backgroundImage = none
    - color = rgba(0, 0, 0, 0.95)
    - boxShadow = none
    - borderTopColor = rgba(255, 255, 255, 0.65)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 12px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(255, 255, 255, 0.25)
- **variant B** (10×): /admin/rag/documents×4, /admin/rag/ingest×2, /admin/rag/kov×4
    - backgroundImage = none
    - color = rgb(44, 51, 64)
    - boxShadow = rgba(26, 18, 18, 0.1) 0px 5px 14px 0px
    - borderTopColor = rgba(156, 138, 145, 0.3)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 999px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(230, 222, 214, 0.85)
- **variant C** (5×): /dokreziim×4, /documents
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - color = rgb(47, 58, 74)
    - boxShadow = rgba(38, 24, 22, 0.1) 0px 6px 14px 0px, rgba(255, 255, 255,…
    - borderTopColor = rgba(126, 95, 88, 0.15)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 999px
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(246, 237, 233, 0.5…
    - hover backgroundColor = rgba(0, 0, 0, 0)
- **variant D** (2×): /teenuseprofiil×2
    - backgroundImage = none
    - color = rgb(47, 58, 74)
    - boxShadow = none
    - borderTopColor = rgb(47, 58, 74)
    - borderTopWidth = 0px
    - borderTopStyle = none
    - borderTopLeftRadius = 14px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(0, 0, 0, 0)
- **variant E** (1×): /kovisioon
    - backgroundImage = none
    - color = rgb(47, 58, 74)
    - boxShadow = none
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopStyle = none
    - borderTopLeftRadius = 999px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(0, 0, 0, 0)

## `.documents-dropdown-trigger` @dark — 5 variants

- **variant A** (35×): /tooheaolu/kiirkontroll×4, /tooheaolu/raske-juhtum×4, /tooheaolu/toovagivald×4, /tooheaolu/taastumine×4, /tooheaolu/toopiirid×4, /tooheaolu/katkestused×4, /tooheaolu/tooprotsessid×4, /tooheaolu/rollipiirid×4, /tooheaolu/alustaja-tugi×3
    - color = rgba(255, 255, 255, 0.95)
    - boxShadow = none
    - borderTopColor = rgba(205, 133, 133, 0.25)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 12px
    - hover backgroundColor = rgba(18, 21, 28, 0.6)
- **variant B** (10×): /admin/rag/documents×4, /admin/rag/ingest×2, /admin/rag/kov×4
    - color = rgb(242, 242, 242)
    - boxShadow = rgba(248, 253, 255, 0.2) 0px 10px 20px -18px, rgba(248, 253…
    - borderTopColor = rgba(255, 255, 255, 0.15)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 999px
    - hover backgroundColor = rgb(14 16 20 / 0.4)
- **variant C** (5×): /dokreziim×4, /documents
    - color = rgb(230, 229, 227)
    - boxShadow = rgba(0, 0, 0, 0.1) 0px 8px 18px 0px
    - borderTopColor = rgba(255, 255, 255, 0.05)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 999px
    - hover backgroundColor = rgb(53 53 53 / 0.2)
- **variant D** (2×): /teenuseprofiil×2
    - color = rgb(230, 229, 227)
    - boxShadow = none
    - borderTopColor = rgb(230, 229, 227)
    - borderTopWidth = 0px
    - borderTopStyle = none
    - borderTopLeftRadius = 14px
    - hover backgroundColor = rgba(0, 0, 0, 0)
- **variant E** (1×): /kovisioon
    - color = rgb(230, 229, 227)
    - boxShadow = none
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopStyle = none
    - borderTopLeftRadius = 999px
    - hover backgroundColor = rgba(0, 0, 0, 0)

## `.documents-dropdown-trigger` @night — 5 variants

- **variant A** (35×): /tooheaolu/kiirkontroll×4, /tooheaolu/raske-juhtum×4, /tooheaolu/toovagivald×4, /tooheaolu/taastumine×4, /tooheaolu/toopiirid×4, /tooheaolu/katkestused×4, /tooheaolu/tooprotsessid×4, /tooheaolu/rollipiirid×4, /tooheaolu/alustaja-tugi×3
    - color = rgba(255, 255, 255, 0.95)
    - boxShadow = none
    - borderTopColor = rgba(205, 133, 133, 0.3)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 12px
    - hover backgroundColor = rgba(18, 21, 28, 0.6)
- **variant B** (10×): /admin/rag/documents×4, /admin/rag/ingest×2, /admin/rag/kov×4
    - color = rgb(230, 229, 227)
    - boxShadow = rgba(214, 231, 255, 0.2) 0px 10px 18px -15px, rgba(120, 168…
    - borderTopColor = rgba(118, 149, 219, 0.1)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 999px
    - hover backgroundColor = rgb(16 21 31 / 0.4)
- **variant C** (5×): /dokreziim×4, /documents
    - color = rgb(230, 229, 227)
    - boxShadow = rgba(2, 6, 16, 0.1) 0px 8px 18px 0px
    - borderTopColor = rgba(133, 164, 216, 0.15)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 999px
    - hover backgroundColor = rgb(52 55 61 / 0.3)
- **variant D** (2×): /teenuseprofiil×2
    - color = rgb(230, 229, 227)
    - boxShadow = none
    - borderTopColor = rgb(230, 229, 227)
    - borderTopWidth = 0px
    - borderTopStyle = none
    - borderTopLeftRadius = 14px
    - hover backgroundColor = rgba(0, 0, 0, 0)
- **variant E** (1×): /kovisioon
    - color = rgb(230, 229, 227)
    - boxShadow = none
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopWidth = 0px
    - borderTopStyle = none
    - borderTopLeftRadius = 999px
    - hover backgroundColor = rgba(0, 0, 0, 0)

## `.documents-dropdown-trigger` @mono — 4 variants

- **variant A** (35×): /tooheaolu/kiirkontroll×4, /tooheaolu/raske-juhtum×4, /tooheaolu/toovagivald×4, /tooheaolu/taastumine×4, /tooheaolu/toopiirid×4, /tooheaolu/katkestused×4, /tooheaolu/tooprotsessid×4, /tooheaolu/rollipiirid×4, /tooheaolu/alustaja-tugi×3
    - backgroundImage = none
    - color = rgba(255, 255, 255, 0.95)
    - boxShadow = none
    - borderTopColor = rgba(232, 238, 224, 0.35)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 12px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(28, 29, 28, 0.65)
- **variant B** (15×): /dokreziim×4, /documents, /admin/rag/documents×4, /admin/rag/ingest×2, /admin/rag/kov×4
    - backgroundImage = linear-gradient(rgba(42, 42, 42, 0.95) 0%, rgba(29, 29, 29,…
    - color = rgb(200, 200, 200)
    - boxShadow = rgba(0, 0, 0, 0.25) 0px 6px 16px 0px, rgba(230, 230, 230, 0…
    - borderTopColor = rgba(214, 214, 214, 0.15)
    - borderTopWidth = 0.8px
    - borderTopStyle = solid
    - borderTopLeftRadius = 999px
    - hover backgroundImage = linear-gradient(rgba(50, 50, 50, 0.95) 0%, rgba(34, 34, 34,…
    - hover backgroundColor = rgba(0, 0, 0, 0)
- **variant C** (2×): /teenuseprofiil×2
    - backgroundImage = none
    - color = rgb(200, 200, 200)
    - boxShadow = none
    - borderTopColor = rgb(200, 200, 200)
    - borderTopWidth = 0px
    - borderTopStyle = none
    - borderTopLeftRadius = 14px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(0, 0, 0, 0)
- **variant D** (1×): /kovisioon
    - backgroundImage = linear-gradient(rgba(42, 42, 42, 0.95) 0%, rgba(29, 29, 29,…
    - color = rgb(200, 200, 200)
    - boxShadow = rgba(0, 0, 0, 0.25) 0px 6px 16px 0px, rgba(230, 230, 230, 0…
    - borderTopColor = rgba(214, 214, 214, 0.15)
    - borderTopWidth = 0px
    - borderTopStyle = none
    - borderTopLeftRadius = 999px
    - hover backgroundImage = linear-gradient(rgba(50, 50, 50, 0.95) 0%, rgba(34, 34, 34,…
    - hover backgroundColor = rgba(0, 0, 0, 0)

## `.documents-dropdown-trigger` @hc — 3 variants

- **variant A** (35×): /tooheaolu/kiirkontroll×4, /tooheaolu/raske-juhtum×4, /tooheaolu/toovagivald×4, /tooheaolu/taastumine×4, /tooheaolu/toopiirid×4, /tooheaolu/katkestused×4, /tooheaolu/tooprotsessid×4, /tooheaolu/rollipiirid×4, /tooheaolu/alustaja-tugi×3
    - borderTopWidth = 0px
    - borderTopStyle = solid
    - borderTopLeftRadius = 12px
- **variant B** (16×): /dokreziim×4, /documents, /kovisioon, /admin/rag/documents×4, /admin/rag/ingest×2, /admin/rag/kov×4
    - borderTopWidth = 2px
    - borderTopStyle = solid
    - borderTopLeftRadius = 999px
- **variant C** (2×): /teenuseprofiil×2
    - borderTopWidth = 0px
    - borderTopStyle = none
    - borderTopLeftRadius = 14px

## `.button[data-variant="secondary"] @secondary` @light — 4 variants

- **variant A** (3×): /tooheaolu/piloot×3
    - backgroundImage = none
    - color = rgb(230, 229, 227)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopLeftRadius = 3e+7px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(255, 255, 255, 0.1)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,
      #fefdfcfe 0%,
   …
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = 0 4px 10px #0f172a1a
    - --btn-primary-border = 1px solid #94a3b814
- **variant B** (2×): /teenuseprofiil×2
    - backgroundImage = radial-gradient(82% 66% at 50% 16%, rgba(253, 252, 251, 1) …
    - color = rgba(0, 0, 0, 0.9)
    - boxShadow = rgba(15, 23, 42, 0.1) 0px 4px 10px 0px
    - borderTopColor = rgba(97, 111, 132, 0.4)
    - borderTopLeftRadius = 3e+7px
    - hover backgroundImage = radial-gradient(82% 66% at 50% 16%, rgb(255, 255, 255) 0%, …
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-text = #1f2937eb
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant C** (1×): /tooheaolu/ulevaade
    - backgroundImage = none
    - color = rgb(0 0 0 / 0.55)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopLeftRadius = 12px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(255, 255, 255, 0.1)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-text = #243244
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant D** (1×): /tooheaolu/taastumine
    - backgroundImage = none
    - color = rgba(0, 0, 0, 0.95)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopLeftRadius = 12px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(255, 255, 255, 0.1)
    - --btn-primary-bg-hover = radial-gradient(82% 66% at 50% 16%,#fff 0%,#fff 42%,#ffffff…
    - --btn-primary-text = #243244
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent

## `.button[data-variant="secondary"] @secondary` @mid — 4 variants

- **variant A** (3×): /tooheaolu/piloot×3
    - backgroundImage = none
    - color = rgb(230, 229, 227)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopLeftRadius = 3e+7px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(255, 255, 255, 0.1)
    - --btn-primary-text = #2f3a4a
    - --btn-primary-shadow = 0 6px 14px #2618161a,
    inset 0 1px 0 #ffffff57
    - --btn-primary-border = transparent
- **variant B** (2×): /teenuseprofiil×2
    - backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(248, 240, 237, 0.6…
    - color = rgba(0, 0, 0, 0.9)
    - boxShadow = rgba(38, 24, 22, 0.1) 0px 6px 14px 0px, rgba(255, 255, 255,…
    - borderTopColor = rgba(97, 111, 132, 0.4)
    - borderTopLeftRadius = 3e+7px
    - hover backgroundImage = radial-gradient(92% 88% at 50% 16%, rgba(246, 237, 233, 0.5…
    - hover backgroundColor = rgba(0, 0, 0, 0)
    - --btn-primary-text = #2f3a4a
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant C** (1×): /tooheaolu/ulevaade
    - backgroundImage = none
    - color = rgb(0 0 0 / 0.55)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopLeftRadius = 12px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(255, 255, 255, 0.1)
    - --btn-primary-text = #243244
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent
- **variant D** (1×): /tooheaolu/taastumine
    - backgroundImage = none
    - color = rgba(0, 0, 0, 0.95)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopLeftRadius = 12px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(255, 255, 255, 0.1)
    - --btn-primary-text = #243244
    - --btn-primary-shadow = 0 4px 10px #00000021
    - --btn-primary-border = 0 solid transparent

## `.button[data-variant="secondary"] @secondary` @dark — 4 variants

- **variant A** (3×): /tooheaolu/piloot×3
    - backgroundImage = none
    - color = rgb(230, 229, 227)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopLeftRadius = 3e+7px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(255, 255, 255, 0.1)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = inset 0 1px 0 #ffffff0f,
    0 5px 12px #0003
- **variant B** (2×): /teenuseprofiil×2
    - backgroundImage = linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255,…
    - color = rgba(255, 255, 255, 0.9)
    - boxShadow = rgba(0, 0, 0, 0.2) 0px 5px 14px 0px, rgba(238, 242, 248, 0.…
    - borderTopColor = rgba(248, 253, 255, 0.15)
    - borderTopLeftRadius = 3e+7px
    - hover backgroundImage = linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255,…
    - hover backgroundColor = rgb(0 0 0 / 0.15)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant C** (1×): /tooheaolu/ulevaade
    - backgroundImage = none
    - color = rgb(255 255 255 / 0.55)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopLeftRadius = 12px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(255, 255, 255, 0.1)
    - --btn-primary-text = #243244
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant D** (1×): /tooheaolu/taastumine
    - backgroundImage = none
    - color = rgba(255, 255, 255, 0.95)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopLeftRadius = 12px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(255, 255, 255, 0.1)
    - --btn-primary-text = #243244
    - --btn-primary-shadow = 0 4px 10px #00000021

## `.button[data-variant="secondary"] @secondary` @night — 4 variants

- **variant A** (3×): /tooheaolu/piloot×3
    - backgroundImage = none
    - color = rgb(230, 229, 227)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopLeftRadius = 3e+7px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(255, 255, 255, 0.1)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = inset 0 1px 0 #dcecff1a,
    0 5px 12px #0206103d
- **variant B** (2×): /teenuseprofiil×2
    - backgroundImage = linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255,…
    - color = rgba(255, 255, 255, 0.9)
    - boxShadow = rgba(2, 6, 16, 0.2) 0px 5px 14px 0px, rgba(220, 236, 255, 0…
    - borderTopColor = rgba(226, 232, 238, 0.2)
    - borderTopLeftRadius = 3e+7px
    - hover backgroundImage = linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255,…
    - hover backgroundColor = rgb(13 17 24 / 0.2)
    - --btn-primary-text = #f8fcfff5
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant C** (1×): /tooheaolu/ulevaade
    - backgroundImage = none
    - color = rgb(255 255 255 / 0.55)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopLeftRadius = 12px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(255, 255, 255, 0.1)
    - --btn-primary-text = #243244
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant D** (1×): /tooheaolu/taastumine
    - backgroundImage = none
    - color = rgba(255, 255, 255, 0.95)
    - boxShadow = rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px …
    - borderTopColor = rgba(0, 0, 0, 0)
    - borderTopLeftRadius = 12px
    - hover backgroundImage = none
    - hover backgroundColor = rgba(255, 255, 255, 0.1)
    - --btn-primary-text = #243244
    - --btn-primary-shadow = 0 4px 10px #00000021

## `.button[data-variant="secondary"] @secondary` @mono — 3 variants

- **variant A** (3×): /tooheaolu/piloot×3
    - boxShadow = rgba(214, 214, 214, 0.1) 0px 1px 0px 0px inset, rgba(7, 7, …
    - borderTopLeftRadius = 3e+7px
    - --btn-primary-text = #e6e6e6f5
    - --btn-primary-shadow = inset 0 1px 0 #d6d6d614,
    0 5px 12px #0707073d
- **variant B** (2×): /tooheaolu/ulevaade, /tooheaolu/taastumine
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px
    - borderTopLeftRadius = 12px
    - --btn-primary-text = #243244
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant C** (2×): /teenuseprofiil×2
    - boxShadow = rgba(0, 0, 0, 0.15) 0px 4px 10px 0px
    - borderTopLeftRadius = 3e+7px
    - --btn-primary-text = #e6e6e6f5
    - --btn-primary-shadow = 0 4px 10px #00000021

## `.button[data-variant="secondary"] @secondary` @hc — 3 variants

- **variant A** (3×): /tooheaolu/piloot×3
    - borderTopLeftRadius = 3e+7px
    - --btn-primary-shadow = none
- **variant B** (2×): /tooheaolu/ulevaade, /tooheaolu/taastumine
    - borderTopLeftRadius = 12px
    - --btn-primary-shadow = 0 4px 10px #00000021
- **variant C** (2×): /teenuseprofiil×2
    - borderTopLeftRadius = 3e+7px
    - --btn-primary-shadow = 0 4px 10px #00000021

## `.button[data-variant="ghost"] @ghost` @light — 3 variants

- **variant A** (8×): /admin/rag/ingest×3, /admin/rag/kov×3, /admin/rag/organizations×2
    - color = rgb(34, 34, 34)
    - borderTopColor = rgba(190, 196, 208, 0.35)
    - hover backgroundColor = rgb(229 217 215 / 0.9)
- **variant B** (1×): /admin/rag/documents
    - color = rgb(34 34 34 / 0.95)
    - borderTopColor = rgb(212 215 223 / 0.45)
    - hover backgroundColor = rgb(229 217 215 / 0.9)
- **variant C** (1×): /admin/rag/kov
    - color = rgb(34 34 34 / 0.95)
    - borderTopColor = rgb(212 215 223 / 0.45)
    - hover backgroundColor = rgb(250 249 248 / 0.85)

## `.button[data-variant="ghost"] @ghost` @mid — 3 variants

- **variant A** (8×): /admin/rag/ingest×3, /admin/rag/kov×3, /admin/rag/organizations×2
    - color = rgb(44, 51, 64)
    - borderTopColor = rgba(156, 138, 145, 0.3)
    - hover backgroundColor = rgb(220 201 194 / 0.9)
- **variant B** (1×): /admin/rag/documents
    - color = rgb(44 51 64 / 0.95)
    - borderTopColor = rgb(183 169 171 / 0.4)
    - hover backgroundColor = rgb(220 201 194 / 0.9)
- **variant C** (1×): /admin/rag/kov
    - color = rgb(44 51 64 / 0.95)
    - borderTopColor = rgb(183 169 171 / 0.4)
    - hover backgroundColor = rgb(228 219 212 / 0.8)

## `.button[data-variant="ghost"] @ghost` @dark — 3 variants

- **variant A** (8×): /admin/rag/ingest×3, /admin/rag/kov×3, /admin/rag/organizations×2
    - color = rgb(242, 242, 242)
    - borderTopColor = rgba(255, 255, 255, 0.15)
    - hover backgroundColor = rgb(73 47 50 / 0.5)
- **variant B** (1×): /admin/rag/documents
    - color = rgb(242 242 242 / 0.95)
    - borderTopColor = rgb(163 164 166 / 0.2)
    - hover backgroundColor = rgb(73 47 50 / 0.5)
- **variant C** (1×): /admin/rag/kov
    - color = rgb(242 242 242 / 0.95)
    - borderTopColor = rgb(163 164 166 / 0.2)
    - hover backgroundColor = rgb(23 25 29 / 0.4)

## `.button[data-variant="ghost"] @ghost` @night — 3 variants

- **variant A** (8×): /admin/rag/ingest×3, /admin/rag/kov×3, /admin/rag/organizations×2
    - color = rgb(230, 229, 227)
    - borderTopColor = rgba(118, 149, 219, 0.1)
    - hover backgroundColor = rgb(77 57 64 / 0.5)
- **variant B** (1×): /admin/rag/documents
    - color = rgb(230 229 227 / 0.95)
    - borderTopColor = rgb(72 91 134 / 0.15)
    - hover backgroundColor = rgb(77 57 64 / 0.5)
- **variant C** (1×): /admin/rag/kov
    - color = rgb(230 229 227 / 0.95)
    - borderTopColor = rgb(72 91 134 / 0.15)
    - hover backgroundColor = rgb(18 24 35 / 0.35)

## `.button[data-variant="ghost"] @ghost` @mono — 3 variants

- **variant A** (8×): /admin/rag/ingest×3, /admin/rag/kov×3, /admin/rag/organizations×2
    - color = rgb(200, 200, 200)
    - borderTopColor = rgba(214, 214, 214, 0.1)
    - hover backgroundColor = rgb(67 48 48 / 0.7)
- **variant B** (1×): /admin/rag/documents
    - color = rgb(217 217 217 / 0.85)
    - borderTopColor = rgb(109 109 109 / 0.2)
    - hover backgroundColor = rgb(67 48 48 / 0.7)
- **variant C** (1×): /admin/rag/kov
    - color = rgb(217 217 217 / 0.85)
    - borderTopColor = rgb(109 109 109 / 0.2)
    - hover backgroundColor = rgb(33 33 33 / 0.6)

## `.button[data-variant="ghost"] @ghost` @hc — 3 variants

- **variant A** (8×): /admin/rag/ingest×3, /admin/rag/kov×3, /admin/rag/organizations×2
    - color = rgb(255, 234, 0)
    - borderTopColor = rgba(255, 234, 0, 0.5)
    - hover backgroundColor = rgb(70 68 18 / 0.65)
- **variant B** (1×): /admin/rag/documents
    - color = rgb(255 234 0 / 0.9)
    - borderTopColor = rgb(204 188 5 / 0.5)
    - hover backgroundColor = rgb(70 68 18 / 0.65)
- **variant C** (1×): /admin/rag/kov
    - color = rgb(255 234 0 / 0.9)
    - borderTopColor = rgb(204 188 5 / 0.5)
    - hover backgroundColor = rgb(27 30 22 / 0.6)

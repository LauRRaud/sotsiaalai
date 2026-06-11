# Mobile CSS Ownership

`app/styles/mobile/index.css` is the only global mobile entry imported from `globals.css`.

- `../mobile.css` is the compatibility wrapper for the old mobile monolith. It imports owner files in cascade order.
- `chat-bootstrap.css` owns critical mobile chat composer anchoring keyed off the early `data-layout="mobile"` script; it is imported globally because it must run before route hydration.
- `subpage-title-system.css` owns shared mobile header placement and title fitting: title, back button and optional info button.
- `background-home.css` owns mobile home background behavior and reveal transitions.
- `accessibility-modal-fields.css` owns accessibility modal fieldset spacing.
- `login-modal.css` and `login-otp-close.css` own login and OTP modal mobile placement.
- `modal-surfaces.css` owns mobile glass modal surfaces for invite, subscription, help listings, materials and framework pages.
- Chat mobile layout rules moved to `app/styles/features/chat/mobile.css`; the chat vertical (shell + mobile + mono + hc overrides) is route-imported via `app/styles/features/chat/index.css`. Only `chat-bootstrap.css` stays global (pre-hydration requirement below).
- Policy mobile scroll geometry moved to `app/styles/features/policy/mobile.css`; the policy vertical is route-imported via `app/styles/features/policy/index.css` (mobile part under its own max-width condition).
- Documents mobile rules moved to `app/styles/features/documents/mobile.css`; the whole documents vertical is route-imported via `app/styles/features/documents/index.css`.
- Service-map mobile rules moved to `app/styles/features/service-map/mobile.css`; the whole feature vertical (desktop + mobile) is route-imported via `app/styles/features/service-map/index.css` and is no longer part of the shared mobile cascade.
- Component CSS modules keep their own mobile rules only when the rules are local to that component, for example rail direction, picker sizing, grid density or a feature form layout. They must not reposition shared mobile page chrome: back button, page title, info button, glass shell size or root background.

PWA `standalone`/`fullscreen` layout overrides are intentionally disabled. Installed PWA mode should inherit the normal mobile layout until a new PWA layer is rebuilt with a single owner.

Do not add new page-specific mobile overrides to `mobile.css`. Add a focused owner file under this folder, or keep the rule beside the owning route/component.

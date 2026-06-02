# Mobile CSS Ownership

`app/styles/mobile/index.css` is the only global mobile entry imported from `globals.css`.

- `../mobile.css` is the compatibility wrapper for the old mobile monolith. It imports owner files in cascade order.
- `subpage-title-system.css` owns shared mobile header placement and title fitting: title, back button and optional info button.
- `background-home.css` owns mobile home background behavior and app prepaint reveal.
- `accessibility-modal-fields.css` owns accessibility modal fieldset spacing.
- `login-modal.css` and `login-otp-close.css` own login and OTP modal mobile placement.
- `modal-surfaces.css` owns mobile glass modal surfaces for invite, subscription, help listings, materials and framework pages.
- `chat-mobile-layout.css` owns mobile chat drawer, rails and composer placement.
- `policy-scroll.css` is route-owned by the public policy pages and is imported only by those routes.
- `app/styles/mobile/service-map.css` is route-owned by service-map workspace pages and is imported next to `service-map.css`.
- `app/styles/mobile/documents-ui.css` is route-owned by documents/agent workspace pages and is imported next to `documents-ui.shared.css`.
- Component CSS modules keep their own mobile rules when the rules are local to that component.

PWA `standalone`/`fullscreen` layout overrides are intentionally disabled. Installed PWA mode should inherit the normal mobile layout until a new PWA layer is rebuilt with a single owner.

Do not add new page-specific mobile overrides to `mobile.css`. Add a focused owner file under this folder, or keep the rule beside the owning route/component.

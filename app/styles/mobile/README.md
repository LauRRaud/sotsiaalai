# Mobile CSS Ownership

`app/styles/mobile/index.css` is the only global mobile entry imported from `globals.css`.

- `../mobile.css` is the compatibility wrapper for the old mobile monolith. It imports owner files in cascade order.
- `mobile-title-backbutton-info.css` owns shared mobile header placement: title, back button and optional info button.
- `mobile-background.css` owns mobile/PWA viewport background behavior.
- `policy-scroll.css` is route-owned by the public policy pages and is imported only by those routes.
- `app/styles/components/service-map.mobile.css` is route-owned by service-map workspace pages and is imported next to `service-map.css`.
- `app/styles/components/documents-ui.mobile.css` is route-owned by documents/agent workspace pages and is imported next to `documents-ui.shared.css`.
- Component CSS modules keep their own mobile rules when the rules are local to that component.

Do not add new page-specific mobile overrides to `mobile.css`. Add a focused owner file under this folder, or keep the rule beside the owning route/component.

"use client";

export default function InvitePageShell({
  title,
  lang,
  children,
  actions,
  actionsClassName = "",
  contentClassName = "",
}) {
  return (
    <div className="profile-page-shell profile-subpage-shell invite-page-shell" lang={lang}>
      <div className="main-content glass-box glass-left profile-container profile-subpage-box invite-modal invite-modal--classic invite-modal--page" role="region">
        <header className="invite-modal__header invite-classic__header invite-page-header">
          <h1 className="invite-classic__title glass-title invite-classic__title--hero">{title}</h1>
        </header>
        {actions ? (
          <div className={`invite-page-actions ${actionsClassName}`.trim()}>{actions}</div>
        ) : null}
        <div className={`invite-modal__content invite-classic__content ${contentClassName}`.trim()}>
          {children}
        </div>
      </div>
    </div>
  );
}

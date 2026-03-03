"use client";

export default function InvitePageShell({
  title,
  lang,
  children,
  actions,
  actionsClassName = "",
  contentClassName = ""
}) {
  const shellClasses =
    "relative flex min-h-[100dvh] w-full flex-col items-center justify-start pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-[env(safe-area-inset-bottom,0px)] max-[768px]:pt-[env(safe-area-inset-top,0px)] min-[768px]:pt-[calc(env(safe-area-inset-top,0px)+clamp(0.7rem,1.9vh,1.3rem))]";
  const containerClasses =
    "relative z-[21] flex w-[min(100%,86vw)] max-w-[clamp(32rem,70vw,50rem)] flex-col items-start justify-start gap-[0.9em] rounded-[1.5em] bg-[var(--glass-surface-bg,rgba(0,0,0,0.25))] text-[color:var(--glass-surface-text,#f2f2f2)] backdrop-blur-[var(--glass-blur-radius,1rem)] px-[clamp(1.8rem,4.5vw,2.6rem)] py-[clamp(0.8rem,2.5vw,1.3rem)] pb-[clamp(1.2rem,3.5vw,2rem)] text-[1.22rem] tracking-[0.03rem] shadow-none overflow-visible max-h-none mx-auto my-[clamp(1.4rem,4vw,2.6rem)] max-[768px]:w-full max-[768px]:max-w-none [&>*]:self-stretch [--profile-subpage-pad-y:clamp(1.6rem,4.2vw,2.6rem)] [--profile-subpage-pad-x:clamp(1.8rem,5vw,3.2rem)] [--subpage-input-bg:rgba(12,18,30,0.58)] [--subpage-input-hover:var(--btn-base-bg-dark)] [--subpage-input-active:var(--btn-base-bg-dark)] [--subpage-input-border:transparent] [--subpage-input-text:rgba(248,250,255,0.96)] [--subpage-input-placeholder:rgba(230,236,245,0.82)] [--subpage-input-shadow:0_6px_16px_rgba(0,0,0,0.24),0_14px_22px_-18px_rgba(248,253,255,0.22)] light:[--subpage-input-bg:rgba(255,255,255,0.72)] light:[--subpage-input-hover:#ffffff] light:[--subpage-input-active:#ffffff] light:[--subpage-input-border:rgba(148,163,184,0.32)] light:[--subpage-input-text:color-mix(in_srgb,var(--text-strong)_70%,#ffffff_30%)] light:[--subpage-input-placeholder:color-mix(in_srgb,var(--text-strong)_45%,transparent)] light:[--subpage-input-shadow:0_6px_16px_rgba(0,0,0,0.14)]";
  const headerClasses =
    "flex items-start justify-center gap-[0.75rem] mt-[clamp(0.8rem,2.6vh,1.8rem)] mb-[0.8rem]";
  const titleClasses =
    "m-0 w-full text-center text-[1.7rem] tracking-[0.03em] font-normal font-[var(--font-aino-headline),var(--font-aino),Arial,sans-serif] text-[#c57171] light:text-[color:var(--title-color)]";
  const actionsClasses =
    "absolute left-1/2 bottom-[clamp(-0.8rem,-1.8vh,-0.2rem)] -translate-x-1/2 mt-[clamp(0.9rem,2.6vh,1.4rem)]";
  const contentClasses =
    "grid w-full max-w-[clamp(13.5rem,30vw,17.5rem)] gap-[1.6rem] mx-auto pb-[clamp(6.2rem,15vh,9rem)]";

  return (
    <div className={shellClasses} lang={lang}>
      <div className={containerClasses} role="region">
        <header className={headerClasses}>
          <h1 className={titleClasses}>{title}</h1>
        </header>
        {actions ? (
          <div className={`${actionsClasses} ${actionsClassName}`.trim()}>
            {actions}
          </div>
        ) : null}
        <div className={`${contentClasses} ${contentClassName}`.trim()}>
          {children}
        </div>
      </div>
    </div>
  );
}

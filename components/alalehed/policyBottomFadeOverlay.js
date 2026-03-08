export const policyDesktopBottomFadeOverlayClassName =
  "pointer-events-none absolute inset-x-0 bottom-[-0.32rem] z-[6] h-[clamp(5.1rem,9.5vh,6.9rem)]";

export const policyDesktopBottomFadeOverlayStyle = {
  background: `radial-gradient(
      ellipse at center bottom,
      rgba(var(--policy-bottom-fade-rgb), 1) 0%,
      rgba(var(--policy-bottom-fade-rgb), 1) 28%,
      rgba(var(--policy-bottom-fade-rgb), 0.84) 58%,
      rgba(var(--policy-bottom-fade-rgb), 0) 100%
    ),
    linear-gradient(
      to top,
      rgba(var(--policy-bottom-fade-rgb), 1) 0%,
      rgba(var(--policy-bottom-fade-rgb), 1) 18%,
      rgba(var(--policy-bottom-fade-rgb), 0.97) 42%,
      rgba(var(--policy-bottom-fade-rgb), 0.86) 60%,
      rgba(var(--policy-bottom-fade-rgb), 0.64) 78%,
      rgba(var(--policy-bottom-fade-rgb), 0.34) 92%,
      rgba(var(--policy-bottom-fade-rgb), 0.08) 97%,
      rgba(var(--policy-bottom-fade-rgb), 0) 100%
    )`
};

export function shouldShowPolicyDesktopBottomFade({
  isExpandedLayout,
  isMobilePolicyLayout
}) {
  return !isExpandedLayout && !isMobilePolicyLayout;
}

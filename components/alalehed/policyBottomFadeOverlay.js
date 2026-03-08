export const policyDesktopBottomFadeOverlayClassName =
  "pointer-events-none absolute inset-x-0 bottom-[-0.68rem] z-[6] h-[clamp(9rem,15.8vh,11.2rem)]";

export const policyDesktopBottomFadeOverlayStyle = {
  background: `radial-gradient(
      ellipse at center bottom,
      rgba(var(--policy-bottom-fade-rgb), 1) 0%,
      rgba(var(--policy-bottom-fade-rgb), 1) 50%,
      rgba(var(--policy-bottom-fade-rgb), 0.98) 76%,
      rgba(var(--policy-bottom-fade-rgb), 0) 100%
    ),
    linear-gradient(
      to top,
      rgba(var(--policy-bottom-fade-rgb), 1) 0%,
      rgba(var(--policy-bottom-fade-rgb), 1) 42%,
      rgba(var(--policy-bottom-fade-rgb), 0.995) 62%,
      rgba(var(--policy-bottom-fade-rgb), 0.96) 76%,
      rgba(var(--policy-bottom-fade-rgb), 0.86) 86%,
      rgba(var(--policy-bottom-fade-rgb), 0.66) 93%,
      rgba(var(--policy-bottom-fade-rgb), 0.34) 97.5%,
      rgba(var(--policy-bottom-fade-rgb), 0) 100%
    )`
};

export function shouldShowPolicyDesktopBottomFade({
  isExpandedLayout,
  isMobilePolicyLayout
}) {
  return !isExpandedLayout && !isMobilePolicyLayout;
}

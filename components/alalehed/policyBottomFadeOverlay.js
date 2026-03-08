export const policyDesktopBottomFadeOverlayClassName =
  "pointer-events-none absolute inset-x-0 bottom-[-0.72rem] z-[6] h-[clamp(9.6rem,16.6vh,11.8rem)]";

export const policyDesktopBottomFadeOverlayStyle = {
  background: `radial-gradient(
      ellipse at center bottom,
      rgba(var(--policy-bottom-fade-rgb), 1) 0%,
      rgba(var(--policy-bottom-fade-rgb), 1) 56%,
      rgba(var(--policy-bottom-fade-rgb), 0.985) 80%,
      rgba(var(--policy-bottom-fade-rgb), 0) 100%
    ),
    linear-gradient(
      to top,
      rgba(var(--policy-bottom-fade-rgb), 1) 0%,
      rgba(var(--policy-bottom-fade-rgb), 1) 48%,
      rgba(var(--policy-bottom-fade-rgb), 0.998) 66%,
      rgba(var(--policy-bottom-fade-rgb), 0.97) 79%,
      rgba(var(--policy-bottom-fade-rgb), 0.9) 88%,
      rgba(var(--policy-bottom-fade-rgb), 0.72) 94.2%,
      rgba(var(--policy-bottom-fade-rgb), 0.42) 98.1%,
      rgba(var(--policy-bottom-fade-rgb), 0) 100%
    )`
};

export function shouldShowPolicyDesktopBottomFade({
  isExpandedLayout,
  isMobilePolicyLayout
}) {
  return !isExpandedLayout && !isMobilePolicyLayout;
}

import { cn } from "@/components/ui/cn";

const baseClassName =
  "block h-[5.7rem] w-[5.7rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] " +
  "[--back-arrow-color:#c57171] [--back-dot-color:#7A3A38] " +
  "light:[--back-arrow-color:#7A3A38] light:[--back-dot-color:#c57171]";

export default function BackIcon({ className, ...props }) {
  return (
    <svg
      viewBox="16 12 40 40"
      aria-hidden="true"
      focusable="false"
      className={cn(baseClassName, className)}
      {...props}
    >
      <g transform="translate(36 32) scale(0.68) translate(-36 -32)">
        <path
          className="back-icon-arrow"
          d="M40 16 L22.5 32 L40 48"
          fill="none"
          stroke="var(--back-arrow-color)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
        <circle className="back-icon-dot" cx="42.5" cy="32" r="5" fill="var(--back-dot-color)" opacity="0.9" />
      </g>
    </svg>
  );
}

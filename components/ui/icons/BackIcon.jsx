import { cn } from "@/components/ui/cn";

const baseClassName =
  "block h-[4.2rem] w-[4.2rem] min-[769px]:h-[6.4rem] min-[769px]:w-[6.4rem] " +
  "[--back-arrow-color:#c57171] [--back-dot-color:#7A3A38] " +
  "light:[--back-arrow-color:#7A3A38] light:[--back-dot-color:#c57171]";

export default function BackIcon({ className, ...props }) {
  const {
    dotFilled = true,
    dotStroke = "var(--back-dot-color)",
    dotStrokeWidth,
    glyphScale = 0.68,
    strokeWidth = 3.5,
    ...svgProps
  } = props;
  const resolvedDotStrokeWidth = dotStrokeWidth ?? strokeWidth;

  return (
    <svg
      viewBox="16 12 40 40"
      aria-hidden="true"
      focusable="false"
      className={cn(baseClassName, className)}
      {...svgProps}
    >
      <g transform={`translate(36 32) scale(${glyphScale}) translate(-36 -32)`}>
        <path
          className="back-icon-arrow"
          d="M40 16 L22.5 32 L40 48"
          fill="none"
          stroke="var(--back-arrow-color)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
        <circle
          className={cn("back-icon-dot", !dotFilled ? "back-icon-dot--outline" : null)}
          cx="42.5"
          cy="32"
          r="5"
          fill={dotFilled ? "var(--back-dot-color)" : "none"}
          stroke={dotFilled ? "none" : dotStroke}
          strokeWidth={dotFilled ? undefined : resolvedDotStrokeWidth}
          opacity="0.9"
        />
      </g>
    </svg>
  );
}

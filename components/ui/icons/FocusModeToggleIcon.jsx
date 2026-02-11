import { cn } from "@/components/ui/cn";

const DARK_STROKE = "#7A3A38";
const LIGHT_STROKE = "#c57171";

export default function FocusModeToggleIcon({
  expanded = false,
  isLightTheme = false,
  className,
  ...props
}) {
  const chevronStroke = isLightTheme ? LIGHT_STROKE : DARK_STROKE;
  const frameStroke = isLightTheme ? DARK_STROKE : LIGHT_STROKE;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(className)}
      {...props}
    >
      {expanded ? (
        <>
          <path
            d="M6.2 16.8 L12 11.2 L17.8 16.8"
            stroke={chevronStroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.8 8.7 Q12 1.4 20.2 8.7"
            stroke={frameStroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path
            d="M6.2 7.2 L12 12.8 L17.8 7.2"
            stroke={chevronStroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.6 15.3 V16.3 Q3.6 19.0 6.5 19.0 H17.5 Q20.4 19.0 20.4 16.3 V15.3"
            stroke={frameStroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}

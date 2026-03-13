import { cn } from "@/components/ui/cn";

const DARK_THEME_COLOR = "var(--chat-icon-dark, #c57171)";
const LIGHT_THEME_COLOR = "var(--chat-icon-light, #7A3A38)";

function resolveThemeColor(isLightTheme) {
  return isLightTheme ? LIGHT_THEME_COLOR : DARK_THEME_COLOR;
}

export function ChatBubbleIcon({ isLightTheme = false, className, ...props }) {
  const stroke = resolveThemeColor(isLightTheme);
  return (
    <svg
      viewBox="-3 -3 132.15 119.8"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(className)}
      {...props}
    >
      <path
        d="M24.36 5h77.43c10.69 0 19.36 9.29 19.36 20.76v34.6c0 11.46-8.67 20.76-19.36 20.76H69.53l-25.81 27.68V81.12H24.36C13.67 81.12 5 71.83 5 60.36V25.76C5 14.29 13.67 5 24.36 5Z"
        stroke={stroke}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RoomsIcon({ isLightTheme = false, className, ...props }) {
  const stroke = resolveThemeColor(isLightTheme);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(className)}
      {...props}
    >
      <path
        d="M6.41 13.79h5.4c2.1 0 3.7 1 4.3 2.6.5 1.3.4 2.5.2 3.4-.5 2-2.9 2.6-7.2 2.6s-6.7-.6-7.2-2.6c-.2-.9-.3-2.1.2-3.4.6-1.6 2.2-2.6 4.3-2.6Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="9.11"
        cy="5.79"
        r="4"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.86 18.88V17c0-1.71-1.53-3.21-3.72-3.64"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.4 2.76c1.91.02 3.44 1.64 3.41 3.62s-1.59 3.56-3.5 3.53"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AddPersonIcon({ isLightTheme = false, className, ...props }) {
  const stroke = resolveThemeColor(isLightTheme);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(className)}
      {...props}
    >
      <g transform="translate(0 -1.3)">
        <path
          d="M9.3 15H14.7C16.8 15 18.4 16 19 17.6C19.5 18.9 19.4 20.1 19.2 21C18.7 23 16.3 23.6 12 23.6C7.7 23.6 5.3 23 4.8 21C4.6 20.1 4.5 18.9 5 17.6C5.6 16 7.2 15 9.3 15Z"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="7"
          r="4"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20.2 8.7V12.9"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.1 10.8H22.3"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function MaterialsIcon({ isLightTheme = false, className, ...props }) {
  const stroke = resolveThemeColor(isLightTheme);
  return (
    <svg
      viewBox="0 0 28 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(className)}
      shapeRendering="geometricPrecision"
      {...props}
    >
      <path
        d="M6.9 3.9h8.35l4.85 4.85V18.9a1.65 1.65 0 0 1-1.65 1.65H6.9A1.65 1.65 0 0 1 5.25 18.9V5.55A1.65 1.65 0 0 1 6.9 3.9Z"
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M15.25 3.9v4.85h4.85"
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M12.7 9.55v6.1"
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="m10.1 13.15 2.6 2.7 2.6-2.7"
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function ProfileIcon({ isLightTheme = false, className, ...props }) {
  const stroke = resolveThemeColor(isLightTheme);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(className)}
      {...props}
    >
      <g transform="translate(0 -1.3)">
        <path
          d="M9.3 15H14.7C16.8 15 18.4 16 19 17.6C19.5 18.9 19.4 20.1 19.2 21C18.7 23 16.3 23.6 12 23.6C7.7 23.6 5.3 23 4.8 21C4.6 20.1 4.5 18.9 5 17.6C5.6 16 7.2 15 9.3 15Z"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="7"
          r="4"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function SourcesIcon({ isLightTheme = false, className, ...props }) {
  const stroke = resolveThemeColor(isLightTheme);
  return (
    <svg
      viewBox="-2 -1 123.96 131.67"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(className)}
      {...props}
    >
      <ellipse
        cx="59.98"
        cy="24.7"
        rx="54.98"
        ry="19.7"
        stroke={stroke}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 63.34c0 10.88 24.61 19.7 54.98 19.7s54.98-8.82 54.98-19.7"
        stroke={stroke}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 101.97c0 10.88 24.61 19.7 54.98 19.7s54.98-8.82 54.98-19.7"
        stroke={stroke}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HelpRequestIcon({ isLightTheme = false, className, ...props }) {
  const stroke = resolveThemeColor(isLightTheme);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(className)}
      {...props}
    >
      <rect
        x="4.75"
        y="4.5"
        width="14.5"
        height="15"
        rx="3.2"
        stroke={stroke}
        strokeWidth="1.5"
      />
      <path
        d="M8.15 8.95H15.85"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8.15 12.05H14.25"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8.15 15.15H12.95"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HelpOfferIcon({ isLightTheme = false, className, ...props }) {
  const stroke = resolveThemeColor(isLightTheme);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(className)}
      {...props}
    >
      <rect
        x="4.75"
        y="4.5"
        width="14.5"
        height="15"
        rx="3.2"
        stroke={stroke}
        strokeWidth="1.5"
      />
      <path
        d="M8.1 12H15.9"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 8.1V15.9"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ShowRailIcon({ isLightTheme = false, className, ...props }) {
  const color = resolveThemeColor(isLightTheme);
  return (
    <svg
      viewBox="0 0 24 17.8"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(className)}
      {...props}
    >
      <rect x="8.6" y="0.9" width="11.6" height="2" rx="1" fill={color} />
      <rect x="5.4" y="7.9" width="11.6" height="2" rx="1" fill={color} />
      <rect x="8.6" y="14.9" width="11.6" height="2" rx="1" fill={color} />
    </svg>
  );
}

export function PaperclipIcon({ isLightTheme = false, className, ...props }) {
  const stroke = resolveThemeColor(isLightTheme);
  return (
    <svg
      viewBox="0 0 464 824"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(className)}
      {...props}
    >
      <path
        d="M432 52v540c0 110.46-89.54 200-200 200S32 702.46 32 592V172C32 94.68 94.68 32 172 32s140 62.68 140 140v412c0 37.56-30.44 68-68 68-37.56 0-68-30.44-68-68V188"
        stroke={stroke}
        strokeWidth="64"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

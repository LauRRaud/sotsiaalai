"use client";

import BorderGlow from "@/components/ui/BorderGlow";
import { cn } from "@/components/ui/cn";

export const fieldEdgeGlowStyle = {
  "--edge-only-hot-end": "3%",
  "--edge-only-bright-end": "6%",
  "--edge-only-soft-end": "11%",
  "--edge-only-field-top-fade-end": "30%",
  "--edge-only-fade-end": "30%",
  "--edge-only-tail-end": "50%",
  "--edge-only-gap-start": "52%",
  "--edge-only-return-start": "52%",
  "--edge-only-return-soft": "70%",
  "--edge-only-return-bright": "84%",
  "--edge-only-return-hot": "94%",
  "--edge-only-bottom-tail-start": "42%",
  "--edge-only-bottom-tail-end": "100%",
  "--edge-only-bottom-line-left": "clamp(0.85rem, 3.5%, 1.35rem)",
  "--edge-only-bottom-line-right": "clamp(0.85rem, 3.5%, 1.35rem)"
};

export default function GlowField({
  children,
  className,
  style,
  borderRadius = 999,
  backgroundColor = "#1E222A",
  ...props
}) {
  return (
    <BorderGlow
      as="div"
      className={cn("ui-glow-field", className)}
      edgeSensitivity={22}
      glowColor="358 82 72"
      backgroundColor={backgroundColor}
      borderRadius={borderRadius}
      glowRadius={42}
      glowIntensity={0.62}
      coneSpread={20}
      colors={["#c084fc", "#f472b6", "#38bdf8"]}
      fillOpacity={0}
      edgeOnly
      style={{ ...fieldEdgeGlowStyle, ...style }}
      {...props}
    >
      {children}
    </BorderGlow>
  );
}

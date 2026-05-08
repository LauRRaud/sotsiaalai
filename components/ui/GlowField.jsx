"use client";

import BorderGlow from "@/components/ui/BorderGlow";
import { cn } from "@/components/ui/cn";

export default function GlowField({
  children,
  className,
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
      glowRadius={48}
      glowIntensity={1.15}
      coneSpread={20}
      colors={["#c084fc", "#f472b6", "#38bdf8"]}
      fillOpacity={0}
      edgeOnly
      {...props}
    >
      {children}
    </BorderGlow>
  );
}

"use client";

import { badgeBaseClassName, cardBodyClassName, cardClassName } from "../ragAdminShared";

const toneClassName = {
  neutral: "border-[color:var(--admin-border)] text-[color:var(--admin-text)]",
  warn: "border-[#f59e0b] text-[#f59e0b]",
  danger: "border-[#ef4444] text-[#ef4444]",
  success: "border-[#22c55e] text-[#22c55e]"
};

export default function KovSummaryCards({ cards = [] }) {
  return (
    <div className={cardClassName}>
      <div className={`${cardBodyClassName} gap-2`}>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map(card => (
            <div
              key={card.key}
              className="grid gap-2 rounded-[14px] border border-[color:var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-surface-2)_86%,transparent)] min-[769px]:backdrop-blur-[var(--glass-blur-radius,0.68rem)] min-[769px]:[-webkit-backdrop-filter:blur(var(--glass-blur-radius,0.68rem))] px-3 py-2.5"
            >
              <span className="text-[0.76rem] uppercase tracking-[0.06em] text-[color:var(--admin-muted)]">
                {card.label}
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[1.02rem] font-semibold text-[color:var(--admin-text)]">{card.value}</span>
                <span className={`${badgeBaseClassName} ${toneClassName[card.tone] || toneClassName.neutral}`}>{card.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

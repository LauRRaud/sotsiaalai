"use client";

import EyeIcon from "@/components/ui/icons/EyeIcon";
export default function Toggle({
  id = "toggle",
  checked,
  onChange,
  ariaDescribedBy
}) {
  const handleChange = event => {
    const next = event.target.checked;
    if (onChange) onChange(next);
  };
  const inputId = id || "toggle";
  return (
    <label
      className="inline-flex h-[30px] w-[60px] items-center justify-center gap-[0.08rem] mr-[0.55rem]"
      htmlFor={inputId}
    >
      <div className="relative h-full w-full rounded-[165px] border border-[#32303e] bg-[#252532] p-[3px] shadow-[inset_0px_5px_10px_0px_#16151c,0px_3px_6px_-2px_#403f4e] cursor-[var(--cursor-pointer)]">
        <input
          id={inputId}
          className="peer absolute inset-0 opacity-0"
          type="checkbox"
          checked={!!checked}
          onChange={handleChange}
          aria-describedby={ariaDescribedBy}
        />
        <div className="relative h-full w-full peer-checked:[&_.button-toggle]:left-[calc(100%-24px)] peer-checked:[&_.button-indicator]:animate-[indicator_1s_forwards]">
          <span className="button-toggle absolute left-0 top-1/2 flex h-[24px] w-[24px] -translate-y-1/2 items-center justify-center rounded-full bg-[linear-gradient(#3b3a4e,#272733)] shadow-[inset_0px_5px_4px_0px_#424151,0px_4px_15px_0px_#0f0e17] transition-[left] duration-[280ms] ease-in">
            <EyeIcon aria-hidden="true" className="h-4 w-4" />
          </span>
          <span className="button-indicator pointer-events-none absolute right-[6px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full border-[3px] border-[#ef565f]" />
        </div>
      </div>
    </label>
  );
}

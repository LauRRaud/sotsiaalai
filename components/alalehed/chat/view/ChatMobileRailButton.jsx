import { ShowRailIcon } from "@/components/ui/icons/ChatIcons";

export default function ChatMobileRailButton({
  isLightTheme,
  onShowMobileRail,
  disabled,
  ariaLabel
}) {
  return <button
    type="button"
    onPointerDown={event => {
      event.stopPropagation();
    }}
    onClick={event => {
      event.preventDefault();
      event.stopPropagation();
      onShowMobileRail();
    }}
    disabled={disabled}
    aria-label={ariaLabel}
    className="chat-rail-show-btn pointer-events-auto touch-manipulation absolute z-[221] top-[var(--chat-mobile-show-top)] right-[calc(env(safe-area-inset-right,0px)+0.12rem)] h-[var(--chat-mobile-show-size)] w-[var(--chat-mobile-show-size)] p-0 m-0 border-0 bg-transparent inline-flex items-center justify-center text-[#c57171] light:text-[#7a3a38] opacity-90 active:scale-[0.96] focus-visible:outline-none disabled:opacity-55 disabled:pointer-events-none min-[769px]:hidden"
  >
    <ShowRailIcon isLightTheme={isLightTheme} className="h-[var(--chat-mobile-show-icon-size)] w-[var(--chat-mobile-show-icon-size)]" />
  </button>;
}

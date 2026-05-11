"use client";

import BackButton from "@/components/ui/BackButton";
import { cn } from "@/components/ui/cn";
import {
  glassSubpageBackButtonClassName,
  glassSubpageHeaderClassName,
  glassSubpageTitleClassName,
  glassSubpageTitleWrapClassName
} from "@/components/ui/glassPageStyles";

export function GlassSubpageHeader({
  title,
  children,
  titleId,
  titleAs: TitleTag = "h1",
  onBack,
  backAriaLabel,
  showBack = true,
  holdPressedVisualDisabled = false,
  headerClassName,
  titleWrapClassName,
  titleClassName,
  backClassName,
  backIconClassName,
  rightSlot
}) {
  return (
    <>
      {showBack && onBack ? (
        <BackButton
          onClick={onBack}
          ariaLabel={backAriaLabel}
          holdPressedVisualDisabled={holdPressedVisualDisabled}
          className={cn(glassSubpageBackButtonClassName, backClassName)}
          iconClassName={backIconClassName}
        />
      ) : null}
      {rightSlot}
      <header className={cn(glassSubpageHeaderClassName, headerClassName)}>
        <div className={cn(glassSubpageTitleWrapClassName, titleWrapClassName)}>
          <TitleTag id={titleId} className={cn(glassSubpageTitleClassName, titleClassName)}>
            {children ?? title}
          </TitleTag>
        </div>
      </header>
    </>
  );
}

"use client";
import { useI18n } from "./I18nProvider";
export function useT() {
  const { t } = useI18n();
  return t;
}
export default useT;

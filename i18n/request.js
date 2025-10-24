// i18n/request.js
import {getRequestConfig} from "next-intl/server";

const SUPPORTED = ["et", "en", "ru"];
const DEFAULT_LOCALE = "et";

const MESSAGE_LOADERS = {
  et: () => import("./languages/et.json"),
  en: () => import("./languages/en.json"),
  ru: () => import("./languages/ru.json"),
};

async function importMessages(locale) {
  const loader = MESSAGE_LOADERS[locale] ?? MESSAGE_LOADERS[DEFAULT_LOCALE];
  const mod = await loader();
  return mod.default;
}

export default getRequestConfig(async ({locale}) => {
  const currentLocale = SUPPORTED.includes(locale) ? locale : DEFAULT_LOCALE;
  const messages = await importMessages(currentLocale);
  return {locale: currentLocale, messages};
});

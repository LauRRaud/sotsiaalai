import "server-only";

export const SUPPORTED_LOCALES = ["et", "en", "ru"];
export const DEFAULT_LOCALE = "et";

export async function loadMessages(locale) {
  switch (locale) {
    case "en":
      return (await import("./languages/en.json")).default;
    case "ru":
      return (await import("./languages/ru.json")).default;
    default:
      return (await import("./languages/et.json")).default;
  }
}

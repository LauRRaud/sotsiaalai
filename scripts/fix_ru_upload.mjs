import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ruPath = path.join(__dirname, "..", "tmp-ru-base.json");

const raw = fs.readFileSync(ruPath, "utf8");
const data = JSON.parse(raw);

if (!data.chat || !data.chat.upload) {
  throw new Error("chat.upload section not found in tmp-ru-base.json");
}

data.chat.upload = {
  ...data.chat.upload,
  aria: "Загрузите документ для анализа (не сохраняется)",
  tooltip: "Загрузите документ для анализа (не сохраняется)",
  busy: "Анализирую документ…",
  summary: "Предпросмотр документа",
  summary_show: "Показать предпросмотр",
  summary_hide: "Скрыть предпросмотр",
  privacy: "Только для анализа, не сохраняется постоянно.",
  ask_more:
    "Пожалуйста, кратко опишите документ и выделите 3–5 ключевых пунктов.",
  ask_more_btn: "Начать свой вопрос",
  use_as_context: "Использовать как контекст для следующего ответа",
  usage: "{used}/{limit} анализов сегодня",
  error_size: "Файл слишком большой ({size} МБ > {limit} МБ).",
  error_status:
    "Не удалось проанализировать документ (код {status}).",
  error_generic: "Не удалось проанализировать документ.",
  context_hint:
    "Если флажок включён, ответы используют только этот файл. Если выключен — используется база знаний SotsiaalAI.",
};

fs.writeFileSync(
  ruPath,
  JSON.stringify(data, null, 2),
  "utf8",
);

console.log("Updated chat.upload section in", ruPath);


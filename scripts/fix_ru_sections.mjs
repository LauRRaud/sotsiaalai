import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ruPath = path.join(__dirname, "..", "tmp-ru-base.json");

let text = fs.readFileSync(ruPath, "utf8");

// Remove BOM if present
if (text.charCodeAt(0) === 0xfeff) {
  text = text.slice(1);
}

const pattern =
  /        "chat": {\s*[\s\S]*?        "quickstart": {\s*[\s\S]*?        }\r?\n      }\r?\n    }\r?\n  },/;

if (!pattern.test(text)) {
  throw new Error('Could not find "chat" to "quickstart" section in tmp-ru-base.json');
}

const replacement = `        "chat": {
          "title": "5. Страница чата",
          "body": "<p>Страница чата открывается после входа в систему, если для аккаунта активна подписка. Здесь вы ведёте весь диалог с чат‑ассистентом <strong>SotsiaalAI</strong>.</p>"
        },
        "profile": {
          "title": "6. Профиль",
          "body": "<p>На странице «Профиль» вы управляете данными аккаунта, подпиской и настройками доступности (язык, размер шрифта, контраст и т. д.).</p>"
        },
        "about": {
          "title": "7. О НАС",
          "body": "<p>На странице <a href=\\"/meist\\">О НАС</a> описаны цели платформы SotsiaalAI, для кого она предназначена и на каких материалах основаны ответы ассистента.</p>"
        },
        "quickstart": {
          "title": "8. Краткое руководство",
          "body": "<p>Это короткая инструкция по использованию SotsiaalAI: сначала откройте sotsiaal.ai, выберите роль и создайте учётную запись, затем войдите с помощью PIN‑кода и начните диалог в чате.</p>"
        }
      }
    }
  },`;

const updated = text.replace(pattern, replacement);

// Validate JSON before writing
JSON.parse(updated);

fs.writeFileSync(ruPath, updated, "utf8");

console.log("Updated Russian help sections in", ruPath);


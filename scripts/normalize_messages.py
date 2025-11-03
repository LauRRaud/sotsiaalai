import json
from collections import OrderedDict
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ["et", "ru", "en"]

DEFAULT_COMMON = {
    "et": {
        "skip_to_content": "Jätka sisuni",
        "language_changed": "Keel muudetud: {language}",
        "languages": {
            "et": "eesti",
            "ru": "vene",
            "en": "inglise",
        },
    },
    "ru": {
        "skip_to_content": "Перейти к содержимому",
        "language_changed": "Язык изменен: {language}",
        "languages": {
            "et": "эстонский",
            "ru": "русский",
            "en": "английский",
        },
    },
    "en": {
        "skip_to_content": "Skip to content",
        "language_changed": "Language changed: {language}",
        "languages": {
            "et": "Estonian",
            "ru": "Russian",
            "en": "English",
        },
    },
}

DEFAULT_NAV = {
    "et": {
        "main": "Peamenüü",
        "home": "Avaleht",
        "about": "Meist",
        "chat": "Vestlus",
        "profile": "Minu profiil",
        "privacy": "Privaatsus",
        "terms": "Tingimused",
        "register": "Registreeru",
        "login": "Logi sisse",
        "start": "Start",
    },
    "ru": {
        "main": "Главное меню",
        "home": "Главная",
        "about": "О нас",
        "chat": "Чат",
        "profile": "Профиль",
        "privacy": "Конфиденциальность",
        "terms": "Условия",
        "register": "Регистрация",
        "login": "Войти",
        "start": "Старт",
    },
    "en": {
        "main": "Main navigation",
        "home": "Home",
        "about": "About",
        "chat": "Chat",
        "profile": "Profile",
        "privacy": "Privacy",
        "terms": "Terms",
        "register": "Register",
        "login": "Log in",
        "start": "Start",
    },
}

DEFAULT_BUTTONS = {
    "et": {
        "save": "Salvesta",
        "save_changes": "Salvesta muudatused",
        "save_settings": "Salvesta seaded",
        "close": "Sulge",
        "cancel": "Katkesta",
        "back": "Tagasi",
        "back_home": "Tagasi avalehele",
        "back_previous": "Tagasi eelmisele lehele",
        "try_again": "Proovi uuesti",
        "open_profile": "Ava profiil",
        "open_chat": "Ava vestlus",
        "open_accessibility": "Ava ligipääsetavuse seaded",
        "new": "Uus",
        "new_conversation": "Uus vestlus",
        "refresh": "Värskenda",
        "delete": "Kustuta",
        "confirm": "Kinnita",
        "submit": "Saada",
    },
    "ru": {
        "save": "Сохранить",
        "save_changes": "Сохранить изменения",
        "save_settings": "Сохранить настройки",
        "close": "Закрыть",
        "cancel": "Отмена",
        "back": "Назад",
        "back_home": "Назад на главную",
        "back_previous": "Назад на предыдущую страницу",
        "try_again": "Повторить",
        "open_profile": "Открыть профиль",
        "open_chat": "Открыть чат",
        "open_accessibility": "Открыть настройки доступности",
        "new": "Новый",
        "new_conversation": "Новый диалог",
        "refresh": "Обновить",
        "delete": "Удалить",
        "confirm": "Подтвердить",
        "submit": "Отправить",
    },
    "en": {
        "save": "Save",
        "save_changes": "Save changes",
        "save_settings": "Save settings",
        "close": "Close",
        "cancel": "Cancel",
        "back": "Back",
        "back_home": "Back to home",
        "back_previous": "Back to previous page",
        "try_again": "Try again",
        "open_profile": "Open profile",
        "open_chat": "Open chat",
        "open_accessibility": "Open accessibility settings",
        "new": "New",
        "new_conversation": "New conversation",
        "refresh": "Refresh",
        "delete": "Delete",
        "confirm": "Confirm",
        "submit": "Submit",
    },
}

ORDER = [
    "common",
    "buttons",
    "errors",
    "nav",
    "auth",
    "home",
    "profile",
    "privacy",
    "terms",
    "chat",
    "about",
    "subscription",
    "start",
    "notFound",
    "role",
]


def merge_dict(defaults, overrides):
    result = deepcopy(defaults)
    for key, value in overrides.items():
        if isinstance(value, dict) and isinstance(result.get(key), dict):
            result[key] = merge_dict(result[key], value)
        else:
            result[key] = value
    return result


for locale in LOCALES:
    path = ROOT / "messages" / f"{locale}.json"
    data = json.loads(path.read_text(encoding="utf-8"))

    common_defaults = DEFAULT_COMMON.get(locale, {})
    data["common"] = merge_dict(common_defaults, data.get("common", {}))

    legal_common = data.get("legal", {}).get("common", {})
    if legal_common:
        data["common"] = merge_dict(data["common"], legal_common)

    home_nav = data.get("home", {}).get("nav", {})
    nav_existing = data.get("nav", {})
    data["nav"] = merge_dict(DEFAULT_NAV.get(locale, {}), merge_dict(home_nav, nav_existing))

    data["buttons"] = merge_dict(DEFAULT_BUTTONS.get(locale, {}), data.get("buttons", {}))

    errors = data.pop("errors", None)
    if errors is None:
        errors = data.pop("error", {})
    data["errors"] = errors

    legal = data.pop("legal", {})
    if not data.get("privacy"):
        data["privacy"] = legal.get("privacy", {})
    if not data.get("terms"):
        data["terms"] = legal.get("terms", {})

    ordered = OrderedDict()
    remaining = dict(data)
    for key in ORDER:
        if key in remaining:
            ordered[key] = remaining.pop(key)
    for key in sorted(remaining.keys()):
        ordered[key] = remaining[key]

    path.write_text(json.dumps(ordered, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

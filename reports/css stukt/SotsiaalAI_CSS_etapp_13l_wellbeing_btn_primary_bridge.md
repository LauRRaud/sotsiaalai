# SotsiaalAI CSS etapp 13l — Wellbeing `--btn-primary-*` bridge

## Eesmärk

Etapi 13l eesmärk oli eemaldada viimane `--btn-primary-*` tokenipere otsene feature-definitsioon `components/wellbeing/WellbeingPage.module.css` failist ja viia tööheaolu vaate nupu väärtus feature-prefiksiga alias-tokeni kaudu bridge-mudelisse.

Sarnaselt varasematele 13i–13k etappidele ei muutnud see patch visuaalseid väärtusi. Muutus ainult tokeni omandikiht.

---

## Tehtud muudatused

Failis `components/wellbeing/WellbeingPage.module.css`:

- lisati `--wellbeing-btn-primary-text` alias-token;
- default-režiimi `--btn-primary-text` mapib nüüd väärtuse `--wellbeing-btn-primary-text` kaudu;
- high-contrast režiimi `--btn-primary-text` mapib samuti väärtuse `--wellbeing-btn-primary-text` kaudu;
- otsene `--btn-primary-text: var(--hc-accent, #ffea00)` asendati feature-bridge mustriga;
- visuaalne väärtus jäi samaks.

Failis `app/styles/TOKENS.md`:

- lisati märkus, et `WellbeingPage.module.css` kasutab `--wellbeing-btn-primary-*` alias-tokenit ja mapib selle tagasi üldisele `--btn-primary-*` tokenile.

---

## Mõju tokeniauditile

| Mõõdik | Enne 13l | Pärast 13l |
|---|---:|---:|
| `btn-primary` feature direct definitions | 2 | **0** |
| `btn-primary` feature bridge definitions | 76 | **78** |
| `btn-primary` legacy shared definitions | 6 | 6 |
| `btn-primary` other definitions | 0 | 0 |
| Wellbeing direct `--btn-primary-*` | 2 | **0** |
| Wellbeing bridge `--btn-primary-*` | 0 | **2** |
| Projekti `!important` arv | 2025 | 2025 |

Sellega on `--btn-primary-*` tokenipere feature-direct võlg eemaldatud samamoodi nagu enne eemaldati `--subpage-card-*` direct-võlg.

---

## Staatiline kontroll

```text
git apply --check: OK
Missing local CSS imports: 0
CSS import cycles: 0
CSS brace-balance errors: 0
Project CSS !important count: 2025
Btn-primary feature direct definitions: 0
Btn-primary feature bridge definitions: 78
Btn-primary legacy shared definitions: 6
Btn-primary other definitions: 0
Subpage-card feature direct definitions: 0
Subpage-card feature bridge definitions: 23
Wellbeing btn-primary records:
  line 39: feature-bridge --btn-primary-text = var(--wellbeing-btn-primary-text)
  line 171: feature-bridge --btn-primary-text = var(--wellbeing-btn-primary-text)
```

`npm run css:tokens` ja `npm run css:tokens:check` läbisid ajutises tööpuus.

---

## Rakendamine

Rakendada pärast patch’i 29:

```bash
git apply --check sotsiaalai-css-cleanup-30-wellbeing-btn-primary-bridge.patch
git apply sotsiaalai-css-cleanup-30-wellbeing-btn-primary-bridge.patch

npm run css:tokens
npm run css:tokens:check
```

Kui päris repos on `WellbeingPage.module.css` või `TOKENS.md` juba muutunud, tuleb patch enne rakendamist ümber baasida.

---

## Järgmine soovitus

`--subpage-card-*` ja `--btn-primary-*` mõlemad esimesed omandivoorud on nüüd suletud:

- `subpage-card` feature direct definitions: **0**;
- `btn-primary` feature direct definitions: **0**;
- mõlemas peres `other`: **0**.

Järgmine väärtuslik samm on **13m: `--input-*` või `--field-*` tokenipere omandipoliitika**, sest vormiväljade tokenid on järgmine suur konfliktiallikas ning mõjutavad registreerimist, login-modalit, invite-vorme, dokumente ja tööheaolu vaadet.

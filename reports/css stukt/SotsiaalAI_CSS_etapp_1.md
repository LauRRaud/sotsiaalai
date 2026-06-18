# SotsiaalAI CSS-puhastus — etapp 1

## Miks alustasin testidest

CSS on juba osaliselt monoliitidest omaniku failidesse jagatud, kuid mitmed lepingutestid loevad endiselt ainult vanade agregaatorfailide toorteksti. Näiteks `chat-focus.css` sisaldab nüüd `@import` ridu, samal ajal kui test otsib sealt otse `focus.css`-i reeglit. Selline test kukub läbi ka siis, kui runtime CSS on õige.

Enne suuremat CSS-refaktorit peab testikiht mõistma importgraafi. Vastasel korral ei saa testitulemusi usaldada.

## Patch 01 sisu

1. Lisab `tests/helpers/cssSourceBundle.mjs` abifunktsiooni, mis loeb CSS-faili koos kohalike `@import` sõltuvustega.
2. Viib 13 testifaili compatibility-agregaatorite toorteksti lugemiselt rekursiivsele bundle’i lugemisele.
3. Muudab `documents-mode.css` selgeks test/compatibility bundle’iks, mis viitab päris documents-owner failidele.
4. Eemaldab globaalsest ahelast täiesti tühja `tokens/base.css` impordi ja kustutab placeholder-faili.

## Kontroll

- Patch läbib `git apply --check` kontrolli.
- `tests/workspace/dashboardContentTiming.test.js`: **16 testi 16-st läbisid**.
- Kogu testikomplekti ei saanud ZIP-i koopias käivitada, sest kontekstiarhiivist puuduvad juba enne patch’i viidatud failid `tests/helpers/mobileCssBundle.mjs` ja `tests/helpers/serviceMapCssBundle.mjs`. See piirang ei tulene patch’ist.

## Import- ja omandikaardi olulisemad arvud

- 42 route’i.
- 95 CSS-faili.
- Kõigi route’ide ühises sõltuvusgraafis 51 CSS-faili ehk umbes 389,7 KB toor-CSS-i.
- `/vestlus`: umbes 926,7 KB lähte-CSS-i sõltuvusi.
- Globaalne mobiililisakiht: umbes 89,4 KB igal route’il.

Need on lähtekoodi sõltuvusmahud, mitte tootmisbuildi gzip/brotli võrgumahud.

## Järgmine siht

Järgmine mõistlik tööpakett on globaalne mobiilikiht, alustades failidest:

- `features/profile/android-mobile.css`;
- `features/policy/android-mobile.css`;
- `mobile/platform-android.css`;
- `mobile/panel-surfaces.css`;
- `mobile/scroll-panels.css`.

Enne ümbertõstmist tuleb võrrelda selectorite kattuvust ja säilitada kaskaadi järjekord. Androidi feature-failide lihtsalt route-entrypoint’i tõstmine muudaks nende asukohta globaalse mobiilikihi suhtes ning võib seetõttu visuaali muuta.

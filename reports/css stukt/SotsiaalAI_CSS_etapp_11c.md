# SotsiaalAI CSS etapp 11c — `scroll-panels` feature-adapterite väljaviimine

## Eesmärk

Etapp 11c jätkab globaalse mobiili-CSS-i omandi korrastamist pärast etappe 11 ja 11b.

Selle etapi eesmärk oli eemaldada `mobile/scroll-panels` shared kihist need selectorid, mis kuuluvad selgelt konkreetsetele route’idele või feature’itele, kuid vältida Playwrighti või uue testitaristu lisamist.

Teste selles etapis ei lisatud ega käivitatud. Tehti ainult staatiline kontroll.

---

## Tehtud muudatused

### 1. Feature-adapterid viidi globaalsest `scroll-panels` kihist välja

Globaalsest mobiili scroll-kihist eemaldati järgmised feature-spetsiifilised selectorid:

- `.documents-workspace-shell.workspace-guide-panel`
- `.materials-page-content.workspace-guide-panel`
- `.materials-page-content.glass-subpage-surface`
- `.covision-page-surface.workspace-guide-panel`
- `.workspace-feature-panel.workspace-scroll-surface`
- `.workspace-feature-panel.workspace-guide-panel`
- `.invite-modal-content.person-invite-modal-content.glass-subpage-surface`
- `.documents-workspace-page--documents`
- `.documents-workspace-page--agent`

Need asuvad nüüd route-imported shared adapteris:

```text
app/styles/shared/mobile-workspace-scroll-adapters.css
```

See fail ei kuulu globaalsesse `mobile.css` ahelasse. Seda impordivad ainult feature entrypoint’id, mis päriselt neid pindu renderdavad.

---

### 2. Lisatud uued feature entrypoint’id

Lisati:

```text
app/styles/features/materials/index.css
app/styles/features/covision/index.css
app/styles/features/journey/index.css
```

Need impordivad route-owned workspace-scroll adapteri.

---

### 3. Uued route-importid

Lisati CSS-import nendesse route’idesse, mis varem tuginesid globaalsele mobiilikihile:

```text
app/materjalid/page.js
app/kovisioon/page.jsx
app/teekond/[id]/page.jsx
```

See on oluline, sest nende vaadete mobiilipaigutus ei tohiks sõltuda kõigile route’idele laetavast shared mobiili-CSS-ist.

---

### 4. Olemasolevad feature entrypoint’id impordivad adapterit

Adapterit impordivad nüüd:

```text
app/styles/features/chat/index.css
app/styles/features/documents/index.css
app/styles/features/invite/mobile.css
app/styles/features/wellbeing/index.css
app/styles/features/materials/index.css
app/styles/features/covision/index.css
app/styles/features/journey/index.css
```

Kui route impordib mitut feature’it, mis kõik viitavad samale adapterfailile, käsitleb staatiline kontroll seda ühe ja sama failina. Päris Next.js buildi chunk’i tuleb hiljem päris repos kontrollida.

---

## Miks mitte jagada adapterit igasse feature’i eraldi?

Esialgne võimalus oleks olnud teha eraldi failid:

```text
features/documents/mobile-scroll-panels.css
features/materials/mobile-scroll-panels.css
features/covision/mobile-scroll-panels.css
features/invite/scroll-panels.css
features/chat/workspace-scroll-panels.css
```

Seda varianti ei kasutatud lõppversioonis, sest see oleks dubleerinud samu mobiili geomeetria deklaratsioone mitme feature’i vahel. Eriti `/vestlus`, `/teenusekaart`, `/dokreziim` ja `/kovisioon` route’id impordivad korraga mitu feature’i, mistõttu route’i lähte-CSS oleks kasvanud liiga palju.

Seetõttu jäi paremaks kompromissiks üks route-imported shared adapter:

```text
shared/mobile-workspace-scroll-adapters.css
```

See vähendab globaalse kaskaadi selector-segadust, kuid ei loo viit eri koopiat samast geomeetriast.

---

## Mõju

Mõõdikud on normaliseeritud lähte-CSS-i põhised, mitte Next.js production bundle’i gzip/brotli mõõdikud.

| Ala | Enne | Pärast | Muutus |
|---|---:|---:|---:|
| Globaalne CSS | 342 074 B | 340 921 B | **−1 153 B** |
| `/` | 382 885 B | 381 732 B | **−1 153 B** |
| `/vestlus` | 742 396 B | 746 884 B | +4 488 B |
| `/ruum` | 366 561 B | 370 917 B | +4 356 B |
| `/documents` | 427 851 B | 432 206 B | +4 355 B |
| `/dokreziim` | 553 593 B | 558 014 B | +4 421 B |
| `/teenusekaart` | 660 736 B | 665 157 B | +4 421 B |
| `/tooheaolu` | 343 547 B | 347 902 B | +4 355 B |
| `/materjalid` | 342 074 B | 346 494 B | +4 420 B |
| `/kovisioon` | 420 428 B | 424 911 B | +4 483 B |
| `/teekond/[id]` | 342 074 B | 346 523 B | +4 449 B |

## Tõlgendus

See etapp ei ole suur mahupuhastus. See on omandiparandus.

Mitte-workspace route’id võidavad umbes 1,1 KB, sest nad ei kanna enam workspace-like feature adapterite selectoreid. Feature route’id kasvavad, sest varem said nad need reeglid tasuta globaalsest mobiilikihist, nüüd kannavad nad ise oma adapterit.

See on arhitektuurselt parem, kuid vajab hiljem production buildi mõõtmist, sest Next.js võib samale shared CSS-failile viitamist chunk’ides teisiti deduplikeerida kui siinne lihtne staatiline mõõtmine.

---

## Staatiline kontroll

Kontrollid:

```text
git diff --check: OK
git apply --check after-10 puu vastu: OK
CSS parse errors: 0
Missing local CSS @imports: 0
!important count: 1199 → 1199
```

`!important` arv ei kasvanud.

---

## Riskid

### 1. Route CSS importjärjekord

Adapter liigub globaalsest mobiiliahelast feature entrypoint’idesse. See tähendab, et route’is võib adapter laadida hiljem kui varem. Kuna deklaratsioonide väärtusi ei muudetud, on risk pigem kaskaadijärjekorras kui väärtustes.

Kõige olulisemad käsitsi kontrollitavad vaated:

- `/vestlus` mobiilis;
- `/ruum` invite-modal mobiilis;
- `/documents` mobiilis;
- `/materjalid` mobiilis;
- `/kovisioon` mobiilis;
- `/tooheaolu` mobiilis;
- `/teekond/[id]` mobiilis.

### 2. `shared/mobile-workspace-scroll-adapters.css` on kompromiss

Fail on shared, kuid mitte globaalne. See on parem kui hoida adaptereid `mobile.css` all, kuid mitte nii puhas kui täiesti feature-spetsiifiline lahendus.

Selle valiku põhjus: sama geomeetriat kasutatakse mitmes workspace-like vaates ja eraldi feature-failideks jagamine kasvataks dubleerimist.

### 3. Production bundle mõõtmine puudub

Kontekstiarhiivi põhjal ei saa kinnitada:

- Next.js production CSS chunk’e;
- gzip/brotli võrguressurssi;
- tegelikku brauseri kaskaadi;
- visuaalset regressiooni.

---

## Rakendamine

Patch rakendub pärast etappe 01–10:

```bash
git apply --check sotsiaalai-css-cleanup-11.patch
git apply sotsiaalai-css-cleanup-11.patch
```

Kuna kasutaja soovis testid hetkel vahele jätta, ei sisalda see etapp uusi teste.

Päris repos soovitatav minimaalne kontroll pärast rakendamist:

```bash
npm run build
```

ja käsitsi mobiilivaade vähemalt `/vestlus`, `/documents`, `/materjalid`, `/kovisioon`, `/tooheaolu` ja `/ruum` route’idel.

---

## Järgmine soovitus

Järgmine mõistlik etapp ei ole veel `!important` inventuur.

Soovituslik järgmine suund:

1. **Etapp 11d:** üle vaadata, kas `modal-surfaces.css` sisaldab veel invite/help/selected-listing feature-adaptereid, mida saaks route-owned entrypoint’i alla viia.
2. **Seejärel:** `subpage-header` shared faili jääkide audit — seal on veel materials/covision/subscription/help/selected-listing selectorid ühes shared kihis.
3. **Alles hiljem:** teemad ja tokenid.


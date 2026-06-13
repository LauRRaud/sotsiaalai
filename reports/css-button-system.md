# Nupu-süsteemi kontrakt (CSS faas 2 — button)

**Kuupäev:** 13.06.2026
**Staatus:** kontrakt fikseeritud; migratsioon viil-kaupa (snapshot-väravaga, vt `css-cleanup-runbook.md`).

See dokument on **nupu-süsteemi loogika** — reeglid, mille järgi iga button-viil tehakse.
Iga viil viitab siia; ükski viil ei tee oma ad-hoc otsust. Kui reegel ei kata mõnda
juhtu, **uuenda kõigepealt seda dokumenti**, siis migreeri.

Seotud: `css-progress-log.md` (jätka-siit), `css-tailwind-cleanup-plan.md` §1 Juur B,
mälu `css-debt-roadmap.md` / `css-restructure-progress.md`.

---

## 0. Põhiidee (sama mis kogu faas 2)

Brauseri **võitev arvutatud stiil ON spetsifikatsioon** — disain on enamasti õige,
võlg on STRUKTUURNE: võitev kujundus elab vales kohas. Nuppude puhul tähendab see:
nupu lõplik välimus on tihti koostatud teemafailide `:is():not()` ahelatest +
scattered alias-remapidest, mitte komponendist + tokenist. Korrastus = vii võitev
kujundus komponenti/tokenisse, kustuta selektor-ahelad. Snapshot-diff tõestab, et
arvutatud stiil ei muutunud.

---

## 1. Archetype'id (kolm, mitte üks "button")

"Button" pole üks primitiiv. On **kolm eraldi archetype'i**, igaühel oma komponent ja
oma token-nimeruum. Viil tegeleb korraga ühe archetype'iga.

| Archetype | Komponent | Token-nimeruum | Näited (alias-klassid) |
|---|---|---|---|
| **Tekst / pill** | `components/ui/Button.jsx` (variandid: primary/secondary/ghost/danger/linkBrand; suurused sm/md/lg) | `--btn-*` | `.button`, `.btn`, `.invite-primary-btn`, `.invite-refresh-btn`, `.drawer-pill-btn`, `.workspace-feature-action-btn`, `.documents-primary-button`, `[data-variant="primary"]` |
| **Ikoon** | `components/ui/IconButton.jsx`, `BackButton.jsx`, `CloseButton.jsx` | `--icon-btn-*` | `.chat-send-btn`, `.chat-listen-btn`, `.chat-dictate-btn`, `.chat-side-control-btn`, `.chat-rail-icon-btn`, `.modal-close-btn`, `.back-button`, `.chat-back-button` |
| **Segmented / valik** | `components/ui/OptionCard.jsx` + `components/ui/primarySegmentedButtonClassName.js` | `--seg-*` | option-nupud invite/register modalides |

NB: HC/mono `:is(...):not(...)` ahelate **välistus-nimekiri** (`:not(.back-button)…:not(.chat-send-btn)…`)
on tegelikult "tekstinupud, MITTE ikoonnupud" — st ahel üritab käsitsi eristada
archetype'e, mida komponendi-piir teeks automaatselt. See on otsene tõend, et
archetype'id on segamini.

---

## 2. Kontrakt (invariandid — mittevaieldavad)

**I1 — Teemafailid määravad AINULT muutujaid.**
`app/styles/theme/{dark,light,mid,night,mono}.css` + `hc.css` tohivad nuppude kohta
sisaldada **ainult** `:root.theme-X { --btn-*: … }` (vastavalt `--icon-btn-*` / `--seg-*`).
**Null nupu-selektorit, null `:is(.button,…):not(…)` ahelat, null `background: var(--btn-*) !important`
kordust.** Kui teema vajab nupule muud välimust → see on uus token, mille komponent loeb.

**I2 — Komponent omab kuju + tarbib tokeneid.**
Kuju (border-radius, padding, layout, transition) + token-tarbimine (`var(--btn-primary-bg)`)
elab komponendis. Komponent ei tea teemast midagi peale tokeni-nime.

**I3 — Token-nimeruum on archetype-kohane.**
Tekstinupp loeb ainult `--btn-*`. Ikoonnupp `--icon-btn-*`. Segmented `--seg-*`.
Üks archetype ei laena teise tokeneid (täna laenab ikoonnupp `--btn-primary-*` — see
kaob, kui ikoon-viil saab oma nimeruumi).

**I4 — `!important` on tagajärg, mitte siht.**
Iga viil langetab `!important`-arvu (mõõdik, vt `css-tailwind-cleanup-plan.md` §1).
Kui viilu järel on `!important` ikka vajalik, on struktuur veel vale → seleta või eskaleeri.

---

## 3. Alias-klasside saatus (otsustusreegel)

Iga alias-klass (`invite-primary-btn` jne) laguneb tema CSS-i SISU järgi:

1. **Käitumine / visuaal** (token-remap, värv, vari, border) → **kolib komponendi propi/variandi alla.**
   Näide: `.invite-primary-btn` ainus CSS-sisu on `register.css:100` token-remap
   "aktiivolek = jõudeoleku välimus" (lamedale-vajumise summutus) → see on `<Button flatActive>`
   (või uus variant), ko-lokeeritud `Button.jsx`-is. Alias-klass kaob CSS-ist.

2. **Päris paigutus** (suurus, marginaal, positsioon, `min-height`) → jääb JSX-il
   **Tailwind-utiliitidena** (nagu juba `invitePrimaryButtonClassName` teeb: `!min-h-[3.05rem] !px-…`).
   Alias-klassi CSS-pere kaob; layout pole kunagi olnud CSS-failis.

3. **Surnud** (täielikult üle kirjutatud / 0 markup) → kustuta (snapshot-värav).

⇒ Lõppseis: alias-klass kas (a) on `<Button>` prop, või (b) ei eksisteeri enam CSS-selektorina.
Ükski alias ei jää "tühjaks vahekihiks".

**⚠️ Variant-korrektsus (kohustuslik kontroll iga alias-eemalduse järel).**
Alias-klass võib olla **peitnud vale `variant`'i**. Näide (commit `e7407465`): documents
"Vali fail" oli `variant="ghost"` + `documents-upload-choose-button` alias, mis andis
accent-tooni + 3D varju. Alias eemaldatuna jäi alles paljas `ghost` = lapik 2D ilma
glow'ta — vale, sest faili-valiku CTA peab olema 3D klaas (`variant="primary"`).
Reegel: pärast alias-eemaldust **vaata renderdatud nuppu** ja kinnita, et `variant`
annab õige archetype-välimuse:
- `primary` = 3D klaas + BorderGlow (peamised CTA-d, faili-valik, salvestus)
- `ghost` / `secondary` = lapik 2D (sekundaarsed: Laadi alla, Kopeeri, Eemalda)
- `danger` = 3D punane

"Alias on kadunud" ≠ "stiil on õige". Kontrolli variant **enne** snapshot-väravat —
snapshot-diff ei püüa seda, sest enne/pärast on mõlemad "pärast alias-eemaldust".

---

## 4. Definition of Done (per archetype)

Archetype on VALMIS, kui:
1. **Üks kanooniline komponent** + variandid; kõik kasutuskohad kasutavad seda.
2. **Üks token-nimeruum**, teemastatud AINULT `:root.theme-X`-is (I1).
3. **Null nupu-selektorit teemafailides** selle archetype'i jaoks (`:is():not()` ahelad kustutatud).
4. **Null scattered alias-CSS-pere** (kõik propiks/Tailwindiks/kustutatud, §3).
5. Snapshot-diff `✓ identical` · `npm test` 968/12 · jscpd ≤ baseline.

---

## 5. Viilude järjekord

Tekst-archetype kõigepealt (suurim väärtus, komponent küpseim), siis ikoon, siis segmented.

1. **`invite-primary-btn` (piloot)** — väikseim, puhas token-remap (`register.css:100`),
   tõestab §3 mustri end-to-end. Eemalda ka mono/hc `:is()` ahelate kaasamis-nimekirjast.
2. **`invite-refresh-btn`** — sama pere, mono.css:376 annab täis token-bloki `!important`-itega
   → kas variant või token-väärtus per teema.
3. **`drawer-pill-btn`** (chat/mono, chat/themes, light) → Button variant.
4. **`workspace-feature-action-btn`**, ~~`documents-primary-button`~~ (mono ahel + feature-failid).
   `documents-*` pere VALMIS (commitid `f7fe3012`/`21c5c900`/`fcc1c96a`/`e7407465`) —
   alias-klassid kustutatud, kasutajad standardsel `<Button>` variandil.
5. **mono.css:361 + hc.css:1064 hiigel-ahelad** — pärast 1–4 on kaasamis-nimekiri kahanenud;
   alles jääb `.button` / `[data-variant="primary"]` üldreegel + mono-spetsiifiline lisa
   (`color: var(--forest-icon)`) → viimane muutub `--btn-primary-text: var(--forest-icon)`
   tokeniks `:root.theme-mono`-is, ahel kustub. **KÕRGE RISK — eskaleeri (Opus), lai snapshot.**
6. **Ikoon-archetype** (`chat-send-btn` jt, 9 faili) — oma `--icon-btn-*` nimeruum, eraldi DoD.
7. **Segmented** — enamjaolt juba komponent; kontrolli ja sulge.

---

## 6. Viilu-runbook (iga viil)

Sama mis `css-cleanup-runbook.md`:
1. `css-matched-rules --selector ".<alias>" --route <õige leht>` (MITTE /vestlus, kui seal ei renderdu)
   → näe võitev stiil + `[N/6 states]` + kus iga reegel elab.
2. Liigita iga reegel §3 järgi (prop / layout / surnud).
3. Lisa/täienda Button propi/varianti (token-remap ko-lokeeritud) VÕI vii layout Tailwindiks.
4. Eemalda alias teemafailide `:is()` ahelatest + scattered failidest.
5. Snapshot before/after → `✓ identical` → commit. `npm test` 968/12. jscpd ≤ baseline. LF mitte CRLF.
6. Logi `css-progress-log.md`-sse (commit + mis/miks + verifikatsioon).

---

## 7. Hard rules (samad)
- Üks viil = üks commit. Snapshot-värav enne commiti.
- LF mitte CRLF; ÄRA kasuta PowerShell `Set-Content` CSS-il.
- ÄRA puuduta `lib/rag/*` (teise konto WIP, lõhub 2 testi).
- ÄRA kustuta `safety_snapshots/`.
- Co-Authored-By rida commitis.

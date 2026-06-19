# SotsiaalAI CSS — etapid 13r kuni 14 eelne piir

## Piir

Selle töövoo eesmärk on teha ära 14. etapi eeltöö, aga **mitte alustada etappi 14**.

Etapp 14 ehk suurte CSS-failide jätkujagamine jääb puutumata.

Ei tohi alustada:

- `OrbitalMenu.css` jagamist;
- `theme/hc.css` jagamist;
- `WorkspacePanel.module.css` jagamist;
- `chat/themes.css` jagamist;
- `WellbeingPage.module.css` jagamist;
- `CovisionPage.module.css` jagamist;
- `documents/ui.css` uut suurt jagamist;
- `documents/workspace.css` uut suurt jagamist.

## Eeldus

13q patch on rakendatud pärast 13p patchi:

```bash
git apply --check sotsiaalai-css-cleanup-35-service-map-form-control-bridge.patch
git apply sotsiaalai-css-cleanup-35-service-map-form-control-bridge.patch
```

13q oodatav tulemus:

| Mõõdik | Oodatav väärtus |
|---|---:|
| `form-control feature-direct-definition` | 0 |
| `form-control feature-bridge` | 55 |
| `form-control other` | 0 |
| `!important` | 2025 |

---

# Etapp 13r — form-control nullimise kontroll ja lukustamine

## Eesmärk

Kontrollida, et 13q lõpetas form-control direct-võla ja ei tekitanud kõrvalmõjusid.

## Scope

Ainult kontroll. Uut refaktorit ei tehta.

## Käivita

```bash
npm run css:tokens
npm run css:tokens:check
npm run css:audit
```

Kui projektis on olemas ja ajaliselt mõistlik:

```bash
npm run build
npm test
```

## Kontrolli raportis

- kas 13q patch rakendus puhtalt;
- `form-control feature-direct-definition` enne/pärast;
- `form-control feature-bridge` enne/pärast;
- `form-control other` enne/pärast;
- `!important` enne/pärast;
- `css:tokens` tulemus;
- `css:tokens:check` tulemus;
- `css:audit` tulemus;
- `build/test` tulemus, kui käivitatud;
- kas form-control teema on lukustatud.

## Edukriteerium

13r on roheline ainult siis, kui:

```text
form-control feature-direct-definition = 0
form-control other = 0
!important ei suurenenud
css:tokens:check = OK
```

---

# Etapp 13s — tokeniduplikaatide inventuur

## Eesmärk

Valida järgmised tokenivõlad faktide põhjal, mitte alustada pimesi suurt refaktorit.

## Scope

Ainult audit ja klassifikatsioon. Uut CSS-patchi ei tehta, välja arvatud juhul, kui leitakse triviaalne raporti paranduse vajadus.

## Kontrollitavad rühmad

- identsed alias-väärtused;
- kasutamata tokenid;
- defineerimata tokenikasutused;
- liiga üldise nimega tokenid;
- mitme väärtusega tokenid, sh varasem suurusjärk 615.

## Käivita

```bash
npm run css:tokens
npm run css:tokens:check
```

Kui tokeniaudit loob CSV/JSON väljundeid, kogu need raportisse.

## Klassifikatsioon

Jaga leiud nelja rühma:

| Klass | Tähendus | Lubatud järgmine samm |
|---|---|---|
| A | identne väärtus, sama omanik, sama semantika | sobib 13t patchiks |
| B | identne väärtus, eri omanik või eri semantika | ainult dokumenteerida |
| C | kasutamata token, aga võimalik tulevane hook | mitte eemaldada ilma kinnitusteta |
| D | defineerimata või vigane kasutus | sobib eraldi 13v paranduseks |

## Raportis näita

- mitu identset alias-väärtust leiti;
- mitu kasutamata tokenit leiti;
- mitu defineerimata tokenikasutust leiti;
- mitu liiga üldise nimega tokenit leiti;
- mitme väärtusega tokenite arv pärast 13q/13r;
- 5–10 kõige ohutumat kandidaati järgmiseks patchiks;
- 5–10 kandidaati, mida mitte puudutada.

## Edukriteerium

13s lõpus peab olema selge, milline on kõige väiksem ohutu 13t patch. Kui selget kandidaati ei ole, tuleb 13t asemel teha täiendav audit, mitte refaktor.

---

# Etapp 13t — esimene väike tegelike tokeniduplikaatide patch

## Eesmärk

Ühendada ainult 13s auditis A-klassi märgitud identsed alias-väärtused.

## Scope

- üks tokenipere või üks omanik korraga;
- mitte rohkem kui 1–3 faili;
- väärtusi mitte muuta;
- visuaali mitte muuta;
- `!important` arvu mitte suurendada.

## Keelatud

- mitme väärtusega tokenite massiline ümbernimetamine;
- kasutamata tokenite eemaldamine samas patchis;
- defineerimata kasutuste parandamine samas patchis;
- suurte CSS-failide jagamine;
- etapi 14 alustamine.

## Kontroll

```bash
npm run css:tokens
npm run css:tokens:check
npm run css:audit
```

## Raportis näita

- millise 13s kandidaadi põhjal patch tehti;
- enne/pärast duplikaatide arv selles tokeniperes;
- kas tokenite lõppväärtused jäid samaks;
- muutunud failid;
- `!important` enne/pärast;
- `css:tokens:check` tulemus.

---

# Etapp 13u — kasutamata tokenite eemaldamise audit

## Eesmärk

Valida kasutamata tokenid, mida on ohutu eemaldada, aga mitte teha massilist koristust.

## Scope

Audit ja vajadusel väga väike patch ainult siis, kui token on selgelt surnud:

- puudub kasutus CSS-is;
- puudub kasutus JS/TS/TSX failides;
- puudub dokumenteeritud tulevane override-hook;
- puudub seos HC/reduce-motion/mobile variandiga.

## Soovitus

13u esimene läbimine võiks olla ainult raport, mitte patch.

---

# Etapp 13v — defineerimata tokenikasutuste parandamine

## Eesmärk

Parandada ainult päriselt defineerimata tokenikasutused.

## Scope

- iga paranduse juures otsusta, kas õige on lisada definitsioon või muuta viide olemasolevale tokenile;
- mitte asendada pimesi fallback-väärtusega;
- mitte muuta visuaali.

## Kontroll

```bash
npm run css:tokens
npm run css:tokens:check
```

## Raportis näita

- defineerimata kasutused enne/pärast;
- iga paranduse põhjus;
- kas fallback jäi alles või eemaldati;
- muutunud failid.

---

# Etapp 13w — liiga üldiste tokeninimede ümbernimetamise plaan

## Eesmärk

Koostada rename-plaan, mitte teha massilist rename’i.

## Scope

Raport:

- millised tokenid on liiga üldised;
- kelle omandisse need kuuluvad;
- milline oleks uus nimi;
- milline oleks migratsioonijärjekord;
- millised failid oleksid riskantsed.

## Keelatud

- automaatne massiline rename;
- mitme omaniku tokenite korraga muutmine;
- etapi 14 alustamine.

---

# Etapp 13x — mitme väärtusega tokenite vähendamise esimene valik

## Eesmärk

Vähendada mitme väärtusega tokenite hulka ainult seal, kus semantika on selge.

## Scope

- üks tokenipere;
- üks omanik;
- väike patch;
- väärtusi mitte muuta;
- lõppväärtuste võrdlus raportisse.

## Märkus

Varasem suurusjärk oli 615 mitme väärtusega tokenit. Seda ei tohi lahendada ühe suure patchiga.

---

# Enne etappi 14 peab olema olemas

Etapp 14 võib alata alles siis, kui olemas on:

- 13r raport: form-control direct = 0;
- 13s raport: tokeniduplikaatide inventuur;
- vähemalt üks väike 13t/13v/13x patch või põhjendus, miks patchi ei tehtud;
- kinnitatud `!important` piir;
- nimekiri 14 kandidaatidest ja nende riskijärjekord.

14 kandidaadid, aga neid ei muudeta selles töövoos:

1. `OrbitalMenu.css`
2. `theme/hc.css`
3. `WorkspacePanel.module.css`
4. `chat/themes.css`
5. `WellbeingPage.module.css`
6. `CovisionPage.module.css`
7. `documents/ui.css`
8. `documents/workspace.css`

---

# Üks tervikprompt tegijale

```text
Jätka SotsiaalAI CSS tööjärge kuni etapi 14 eelse piirini, aga ära alusta etappi 14.

Eeldus:
- 13p on rakendatud.
- 13q patch `sotsiaalai-css-cleanup-35-service-map-form-control-bridge.patch` tuleb rakendada ja kontrollida.

Tee järjest:

1. 13r — form-control nullimise kontroll ja lukustamine.
   - Käivita `npm run css:tokens`, `npm run css:tokens:check`, `npm run css:audit`.
   - Kontrolli, et `form-control feature-direct-definition = 0`, `feature-bridge = ootuspärane`, `other = 0`, `!important` ei suurenenud.
   - Ära tee uut refaktorit.

2. 13s — tokeniduplikaatide inventuur.
   - Leia identsed alias-väärtused, kasutamata tokenid, defineerimata tokenikasutused, liiga üldised tokenid ja mitme väärtusega tokenid.
   - Klassifitseeri leiud A/B/C/D riskirühmadesse.
   - Ära tee veel patchi, kui ohutu kandidaat pole täiesti selge.

3. 13t — esimene väike tegelike tokeniduplikaatide patch ainult siis, kui 13s leidis A-klassi kandidaadi.
   - Scope üks tokenipere või üks omanik, maksimaalselt 1–3 faili.
   - Väärtusi mitte muuta, visuaali mitte muuta, `!important` arvu mitte suurendada.

4. 13u/13v/13w/13x — tee ainult nii palju, kui audit võimaldab väikeste ja kontrollitavate sammudena.
   - 13u: kasutamata tokenite eemaldamise audit.
   - 13v: defineerimata tokenikasutuste parandamine.
   - 13w: liiga üldiste tokeninimede rename-plaan, mitte massiline rename.
   - 13x: esimene väike mitme väärtusega tokenite vähendamise kandidaat.

Ära alusta etappi 14.
Ära jaga veel suuri CSS-faile.
Ära puuduta `OrbitalMenu.css`, `theme/hc.css`, `WorkspacePanel.module.css`, `chat/themes.css`, `WellbeingPage.module.css`, `CovisionPage.module.css`, `documents/ui.css` ega `documents/workspace.css` suurte jagamistena.

Lõpuraportis näita:
- 13q rakenduse staatus;
- 13r kontrollide tulemused;
- tokeniduplikaatide inventuuri tabel;
- milline väike patch tehti või miks patchi ei tehtud;
- `!important` enne/pärast;
- `css:tokens`, `css:tokens:check`, `css:audit` tulemused;
- kas etapp 14 on valmis planeerimiseks, aga mitte alustamiseks.
```

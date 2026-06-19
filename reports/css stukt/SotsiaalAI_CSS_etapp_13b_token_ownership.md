# SotsiaalAI CSS etapp 13b — tokenite omandimudel ja auditiskript

## Eesmärk

Etapp 13a näitas, et CSS-i peamine järgmine probleem ei ole enam ainult globaalse mobiilikihi lekked, vaid tokenite omand. Sama `--token` nimi saab mitmes failis eri väärtuse ja vahel ka eri tähenduse. See põhjustab hiljem override’e, teemakonflikte ja `!important` kasutust.

Etapp 13b ei muuda veel visuaalseid CSS-väärtusi. See lisab projekti tokenite kasutamise reeglistiku ja tööriista, millega tokenikonflikte saab mõõta.

---

## Tehtud muudatused

### 1. Lisatud dokument `app/styles/TOKENS.md`

Dokument määrab viis tokenikihti:

1. **Foundation tokenid** — bränd, radius, spacing, z-index, baasväärtused.
2. **Semantic tokenid** — surface, text, border, focus, üldised UI tähendused.
3. **Component tokenid** — korduvkasutatava komponendi või primitive’i tokenid.
4. **Feature alias tokenid** — konkreetse feature’i adapterid, näiteks `--service-map-*` või `--workspace-*`.
5. **Theme override tokenid** — light, mid, night, mono, high contrast ja accessibility väärtused.

Dokument lisab ka nimekonventsiooni ja reeglid uute tokenite lisamiseks.

---

### 2. Lisatud auditiskript

Uus fail:

```text
scripts/css-cleanup/style-token-audit.mjs
```

Skript skaneerib:

```text
app/styles
components
```

ja leiab:

- kõik custom property definitsioonid;
- kõik `var(...)` kasutused;
- mitme erineva väärtusega tokenid;
- defineerimata kasutused;
- defineeritud, aga kasutamata tokenid;
- tokenite esialgse kihi nimeprefix’i järgi.

Väljundid:

```text
reports/css-token-audit.json
reports/css-token-collisions.csv
```

---

### 3. Lisatud npm käsud

`package.json` sai uued käsud:

```bash
npm run css:tokens
npm run css:tokens:check
```

Praegu on `css:tokens:check` väga leebe ja ebaõnnestub ainult siis, kui mitme väärtusega tokenikonflikte on üle 700. Hetkeseis on 615, seega see ei tohiks olemasoleva seisu peal kukkuda.

---

## Staatiline kontroll

Patch rakendub pärast `sotsiaalai-css-cleanup-19.patch`:

```text
git apply --check: OK
package.json parse: OK
node scripts/css-cleanup/style-token-audit.mjs: OK
```

Auditiskripti väljund:

```text
CSS files: 156
Tokens: 1112
Definitions: 4224
Usages: 5914
Multi-value token collisions: 615
Undefined usages: 95
Defined but unused: 259
```

---

## Miks see etapp on vajalik

Ilma tokeni-omandimudelita oleks järgmine refaktor ohtlik, sest:

- `--input-bg` ja sarnased tokenid on korraga shared vormivälja, modalivälja ja feature’i toon;
- `--subpage-card-bg` tähendab eri kohtades eri asja;
- `--btn-primary-bg` on liiga lai ja levib mitmesse konteksti;
- theme-failid parandavad vahel komponente otse, mitte semantic tokeneid;
- `!important` inventuur enne tokenite korrastamist lahendaks sümptomeid, mitte põhjust.

---

## Järgmine praktiline samm

Järgmine etapp võiks olla **13c: esimene väike tokenite korrastuspatch**.

Kõige mõistlikum kandidaat on mitte kogu värvisüsteem, vaid üks kitsas grupp:

```text
--subpage-card-*
```

Põhjus:

- see on üks kõige rohkem konflikte tekitavaid gruppe;
- see seostub juba tehtud mobiilipäise ja subpage registry puhastusega;
- selle saab jagada shared primitive’i ja feature alias tokenite vahel;
- see aitab vähendada hilisemaid override’e ilma kogu teemasüsteemi korraga ümber tegemata.

Alternatiivina võib alustada `z-index` või `radius` skaalast, sest need on väiksemad ja lihtsamini kontrollitavad, kuid nende mõju `!important` vähendamisele on väiksem.

---

## Rakendamine

Pärast `sotsiaalai-css-cleanup-19.patch`:

```bash
git apply --check sotsiaalai-css-cleanup-20-token-ownership.patch
git apply sotsiaalai-css-cleanup-20-token-ownership.patch
npm run css:tokens
```

# CSS faas 2 — järgmise sessiooni handoff

**Kuupäev:** 13.06.2026  
**Viimati uuendatud:** 13.06.2026 (button-viilu alias-eemaldus + variant-parandused)

---

## Mis on tehtud

### Dropdown viil — VALMIS
- Commit `ff8390cd` — 4 faili muudetud, kõik valvurid rohelised
- `workspace.css` — lisatud `:root.theme-X` tokeniplokid (portaali-fix)
- `mono.css` — eemaldatud `!important` + redundantsed workspace-skoopilist tokenid
- `ui.css` — HC reeglid globaalseks + `!important`-vabad
- `css-snapshot.targets.json` — 2 uut dropdowni sihtmärki
- Snapshot-diff ✓ identical · npm test 968/12 · jscpd 109→109

### Button viil — documents-* alias-pere VALMIS
- `f7fe3012` — eemaldatud `documents-primary-button` / `-secondary-button` /
  `-danger-button` / `-upload-choose-button` / `--compact` alias-klassid (CSS + JSX,
  5 CSS-faili + 7 JSX-faili). Kasutajad → standardne `<Button>` variant.
- `21c5c900` — kovisioon: eemaldatud vale `[data-variant="primary"]` selektor
  (liiga lai — tabas kõiki primary nuppe, mitte ainult lehe omasid).
- `fcc1c96a` — analüüsi-modaali upload-nupp: eemaldatud `glassPrimaryButtonToneClassName`
  otse nupult (see on **konteineri**-tasandi token-klass; nupp pärib selle shellilt).
- `e7407465` — documents "Vali fail" `variant="ghost"` → `"primary"` (vt õppetund #2);
  + `css-page-report.targets.json`: surnud `.documents-primary-button` eemaldatud,
  lisatud elus selektorid (`documents-dropdown-trigger`, `-upload-dropzone-trigger`,
  `cs-delete`, `dashboard-info-trigger-corner`).
- Live-verifitseeritud Chrome MCP-ga `/vestlus?workspace=documents` peal: kõik 3
  faili-valiku nuppu (documents / materjalid / analüüs) nüüd järjekindlalt `primary` 3D.

### ⚠️ Õppetunnid (kriitilised — ära korda)

**#1 — Dev-serverit EI tohi `.next` alt kustutada.** `rm -rf .next` jooksva dev-serveri
alt jätab serveri katkisesse seisu: mälus olev chunk-manifest ei klapi kettaga,
CSS-chunkid annavad `400`, leht renderdab toore HTML-ina (CSS-ta). Sümptom näeb välja
nagu "muudatus ei jõudnud kohale" / "vana nupp ikka alles". **Parandus:** tapa
dev-server (`Get-NetTCPConnection -LocalPort 3000` → `Stop-Process`), siis `npm run dev`
värskelt. Verifitseeri: CSS-chunk peab andma `200`, mitte `400`.

**#2 — Alias-klassi eemaldamine EI taga õiget baasstiili.** `documents-upload-choose-button`
eemaldamine paljastas, et nupp oli `variant="ghost"` (disainilt lapik 2D, ilma glow'ta),
kuigi peaks olema `variant="primary"` (3D klaas glow'ga). Alias oli seda peitnud.
**Reegel:** pärast alias-eemaldust kontrolli, et `variant` annab õige archetype'i
välimuse (3D vs lapik), mitte ainult seda et alias on kadunud. Vt `css-button-system.md` §3.

---

## Järgmine ülesanne: button alias-pered (vt `css-button-system.md` §5)

`documents-*` pere on tehtud. Järgmised samad mustri järgi:

1. `invite-primary-btn` / `invite-refresh-btn` — token-remap, vt §5.1–5.2
2. `drawer-pill-btn`, `workspace-feature-action-btn`
3. mono.css:361 + hc.css:1064 hiigel-`:is():not()` ahelad — **KÕRGE RISK, eskaleeri**
4. Ikoon-archetype (`chat-send-btn` jt) — oma `--icon-btn-*` nimeruum

### Tööriist: css-page-report (uuendatud)
`node scripts/css-page-report.mjs` — crawlib 38 route × 6 teemat HEADED, annab
per-route nupu-CSS kaardi (matched rules allikate + state'ide kaupa) + surnud-klasside
kandidaadid. Targets: `scripts/css-page-report.targets.json` (uuendatud `e7407465`).
Väljund: `reports/css-page-report/<kuupäev>/`.

### Vana 6-sammuline runbook (alias-viilu jaoks)

1. **`css-matched-rules` alias-elemendil × 6 teemat** — näe võitev stiil per teema
2. **Kanooniline komponent** — `Button.jsx`, vaata mis klasse emiteerib + **kontrolli variant** (õppetund #2)
3. **Kirjuta CSS teema-tokenitega** — `var(--btn-*)` + `:root.theme-Y { --btn-*: … }`
4. **Migreeri** — kõik kasutajad kanoonilisele
5. **Kustuta** — hajutatud feature+tema override'd
6. **Snapshot-värav** — before/after → `✓ identical` → commit

### Server + auth
```powershell
# Prod server (MITTE dev):
npm run build && npm start

# Värske login-token:
node scripts/tmp-create-login-token.mjs
# → kasuta SNAPSHOT_SESSION=<token> env-na snapshot-skriptis
```

### Valvurid (KÕIK kohustuslikud)
- Snapshot-diff = `✓ identical` enne commiti
- `npm test` = 968/12 (null uut kukkumist)
- `jscpd` ei tõuse (109 on praegune baseline)
- CSS-failid LF mitte CRLF — **ÄRA kasuta PowerShell Set-Content CSS-il**
- ÄRA puutu `lib/rag/*` (teise konto WIP, lõhub 2 testi)
- ÄRA kustuta `safety_snapshots/`
- Üks viil = üks commit + `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

### Lugemisjärjekord enne alustamist
1. `reports/css-progress-log.md` — PRAEGUNE SEIS + Faas 2 runbook
2. `reports/css-tailwind-cleanup-plan.md` — §0 põhiidee, §3 tööriistad
3. `reports/css-cleanup-runbook.md` — snapshot-väravaga töövoog

---

## Primitiivide järjekord pärast button
modal → panel → card

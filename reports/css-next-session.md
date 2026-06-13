# CSS faas 2 — järgmise sessiooni handoff

**Kuupäev:** 13.06.2026  
**Sessioon lõpetatud kontekstilimiidi tõttu.**

---

## Mis on tehtud (see sessioon)

### Dropdown viil — VALMIS
- Commit `ff8390cd` — 4 faili muudetud, kõik valvurid rohelised
- `workspace.css` — lisatud `:root.theme-X` tokeniplokid (portaali-fix)
- `mono.css` — eemaldatud `!important` + redundantsed workspace-skoopilist tokenid
- `ui.css` — HC reeglid globaalseks + `!important`-vabad
- `css-snapshot.targets.json` — 2 uut dropdowni sihtmärki
- Snapshot-diff ✓ identical · npm test 968/12 · jscpd 109→109

---

## Järgmine ülesanne: button viil

### Andmed (css:primitives)
- `btn` — 58 faili, `.btn` — 69 faili spread
- `button` — 41 faili, `.button` — 75 faili spread
- Kanooniline komponent: `components/ui/Button.jsx` ✅ (olemas)

### 6-sammuline runbook (sama mis dropdownil)

1. **`css-matched-rules` button-elemendil × 6 teemat** — näe võitev stiil per teema  
   Käsk: `node scripts/css-matched-rules.mjs --selector ".btn" --themes all`  
   NB: vajab auth-tokeniga serverit (vt allpool)

2. **Kanooniline komponent** — `Button.jsx` on olemas, vaata mis klasse see emiteerib

3. **Kirjuta CSS teema-tokenitega** — `var(--btn-*)` + `:root.theme-Y { --btn-*: … }`  
   MITTE `:not()`-ahelad, MITTE pinna-`!important`

4. **Migreeri** — kõik `btn`/`.button` kasutajad kanoonilisele

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

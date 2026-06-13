<!-- Automaatselt genereeritud handoff — uuenda vajadusel -->
# CSS/Tailwind korrastus — handoff uuele sessioonile

SotsiaalAI CSS/Tailwind korrastus — jätkan pooleli tööd.

ALUSTA: loe repos reports/css-progress-log.md (jätka-siit: praegune seis +
tehtud commitidega + järgmine samm). Seejärel reports/css-tailwind-cleanup-plan.md
(master-plaan) ja reports/css-cleanup-runbook.md (snapshot-väravaga töövoog).
NB: sessiooni-mälu on konto-lokaalne — kogu seis elab neis repo-failides.

PÕHIIDEE: brauseri võitev (efektiivne) arvutatud stiil ON spetsifikatsioon;
võlg on struktuurne (võitev kujundus elab tihti vales kohas — scattered
override, mitte kanooniline komponent). !important (4637) on sümptom, mitte
ülesannete nimekiri — langeb struktuursete paranduste kõrvalsaadusena.

TÖÖRIISTAD (serveris): scripts/css-snapshot.mjs (golden-master, computed
styles × 6 teemat × vaateavad), css-snapshot-diff.mjs (before/after värav),
css-matched-rules.mjs (CDP: per selektor kõik reeglid + [N/6 states]).

TÖÖVOOG: baseline snapshot → muuda → after snapshot → diff (✓ identical =
ohutu) → npm test (baseline 12 kukkumist + 2 RAG-WIP, null UUT) → 1 etapp =
1 commit → lisa kirje css-progress-log.md (runbook samm 8).

VALVURID: snapshot'i vastu kasuta `next build` + `next start` (mitte dev —
sureb reload'idel); MITTE puutuda committimata lib/rag/* (teise konto WIP,
lõhub 2 testi); MITTE kustutada safety_snapshots/; failid LF (mitte CRLF,
ära kasuta PowerShell Set-Content't CSS-il); Git Bashis MSYS_NO_PATHCONV=1.

JÄRGMINE SAMM: vt css-progress-log.md "JÄRGMINE SAMM" (faas 1 surnud kood VÕI
nupu-konsolideerimine; snapshot-väravaga mehaanika sobib ka Sonnet 4.6-le).

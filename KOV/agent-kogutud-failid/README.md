# Agent-kogutud failid

See kaust on moteldud ajutiseks kohaks, kuhu saad panna agendilt saadud
KOV-i kogutud failid ja Riigi Teataja failid enne nende edasist tootlemist voi
admini kaudu yleslaadimist.

Struktuur:

- `kov/` = KOV-i veebikihi failid
- `riigiteataja/` = Riigi Teataja kihi failid

Soovitus:

- hoia yhe KOV-i failid koos
- kasuta failinimedes KOV `slug`-i
- kui voimalik, pane kokku kuuluvad failid samasse alamkausta

Naide:

- `kov/tallinn/`
- `riigiteataja/tallinn/`

Siia voivad minna naiteks:

- `.json`
- `.md`
- `.pdf`
- muud toofailid, mida tahad enne ingestit yle vaadata

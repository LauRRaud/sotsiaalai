# Invite flow (email-based room invitations)

See dokument kirjeldab SotsiaalAI vestlusruumide e-posti kutsevoogu, andmemudeli täiendusi ja ärireegleid, sh *self-paid vs sponsored* liitumise loogikat.

---

## 1. DB muudatused

**NB:** DB ALTER jääb samaks nagu kokkulepitud. Kui projektis pole veel `organisations` tabelit, võivad arendajad jätta `sponsored_by_org_id` reaalelus `NULL`-ks ja rely’da ainult `sponsored_by_user_id` peale.

```sql
ALTER TYPE invite_status ADD VALUE IF NOT EXISTS 'revoked';

ALTER TABLE invites
  ADD COLUMN relationship_type TEXT NOT NULL DEFAULT 'colleague'
    CHECK (relationship_type IN ('colleague','client')),
  ADD COLUMN payment_mode TEXT NOT NULL DEFAULT 'self_paid'
    CHECK (payment_mode IN ('self_paid','sponsored_by_host')),
  ADD COLUMN sponsored_by_user_id BIGINT REFERENCES users(id),
  ADD COLUMN sponsored_by_org_id BIGINT REFERENCES organisations(id);

ALTER TABLE room_members
  ADD COLUMN billing_source TEXT NOT NULL DEFAULT 'self'
    CHECK (billing_source IN ('self','sponsored_by_host')),
  ADD COLUMN sponsor_user_id BIGINT REFERENCES users(id),
  ADD COLUMN sponsor_org_id BIGINT REFERENCES organisations(id);

CREATE INDEX IF NOT EXISTS invites_room_status_idx ON invites(room_id,status);
CREATE INDEX IF NOT EXISTS invites_token_hash_idx ON invites(token_hash);
```

Selgitus:

- relationship_type – kas kutsutav on kolleeg või klient (UI valik).
- payment_mode – kas eeldus on, et kutsutav on self-paid või sponsored_by_host (UI valik).
- sponsored_by_user_id / sponsored_by_org_id – sponsor (tavaliselt ruumi omanik või tema organisatsioon).
- billing_source ruumiliikmel – tegelik kasutatav makseallikas: `self` või `sponsored_by_host`.

## 2. Invite loomine (POST /api/invites)

Näide body:

```json
{
  "room_id": 123,
  "emails": ["user@example.com"],
  "relationship_type": "client",
  "payment_mode": "sponsored_by_host"
}
```

Serveri loogika (kokkuvõte):

- Kontrolli, et kutsuja on ruumi owner/mod (requireRoomRole).
- NB: GET /list ja POST /create puhul võtke room_id ka `req.query.room_id`-st, mitte ainult body/params’ist.
- Kontrolli kutsuja/ruumi/organisatsiooni subscription’it vastavalt ärireeglitele.
- Kui `payment_mode === 'sponsored_by_host'`, tee `resolveSponsor(room_id, inviter_id)` → salvestab `sponsored_by_user_id` ja `sponsored_by_org_id`.
- Salvesta relationship_type ja payment_mode UI valitud väärtustena (need on soovid; lõplik otsus tehakse accept-voos).
- Genereeri token_hash ja saada e-kiri kutselingiga (raw token).

## 3. Accept flow (POST /api/invites/:token/accept)

Eeldus: req.user on autentitud ja tema e-post on kinnitatud.

### 3.1 Pseudokood (TS/JS stiilis)

```ts
await db.tx(async (trx) => {
  const now = new Date();

  // 1) Leia invite ja lukusta rida race conditioni vältimiseks
  const invite = await trx.q(
    `SELECT * FROM invites WHERE token_hash = $1 FOR UPDATE`,
    [tokenHash],
  );
  if (!invite) throw http(404);

  if (invite.status !== 'sent' || invite.expires_at <= now) {
    throw http(410, 'INVITE_EXPIRED');
  }
  if (invite.use_count >= invite.max_uses) {
    throw http(410, 'INVITE_EXHAUSTED');
  }

  // 2) E-post peab klappima (või claimitud samaks)
  if (req.user.email.toLowerCase() !== invite.invitee_email.toLowerCase()) {
    throw http(403, 'INVITE_EMAIL_MISMATCH');
  }

  // 3) Loe kasutaja subscription DB-st (ära looda ainult JWT-le)
  const userSub = await trx.q(
    `SELECT status, ends_at
       FROM subscriptions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1`,
    [req.user.id],
  );

  const userActive =
    !!userSub &&
    ['active', 'grace'].includes(userSub.status) &&
    (!userSub.ends_at || userSub.ends_at > now);

  let billing_source: 'self' | 'sponsored_by_host' = 'self';
  let sponsor_user_id: number | null = null;
  let sponsor_org_id: number | null = null;

  // 4) Kui EI ole aktiivne/grace, kontrollime sponsorlust
  if (!userActive) {
    if (invite.payment_mode === 'self_paid') {
      throw http(402, 'SUBSCRIPTION_REQUIRED');
    }

    if (invite.payment_mode === 'sponsored_by_host') {
      const hostPlanOk = await checkHostSponsorship(
        trx,
        invite.room_id,
        invite.sponsored_by_user_id,
        invite.sponsored_by_org_id,
      );
      if (!hostPlanOk) {
        throw http(409, 'SPONSOR_NOT_AVAILABLE');
      }
      billing_source = 'sponsored_by_host';
      sponsor_user_id = invite.sponsored_by_user_id;
      sponsor_org_id = invite.sponsored_by_org_id;
    }
  }

  // 5) Kui kasutajal on oma plaan, jätame billing_source='self'

  // 6) Upsert liikmeks
  await trx.q(
    `INSERT INTO room_members (room_id, user_id, role, billing_source, sponsor_user_id, sponsor_org_id, joined_at, left_at)
     VALUES ($1, $2, 'member', $3, $4, $5, $6, NULL)
     ON CONFLICT (room_id, user_id) DO UPDATE
       SET left_at = NULL,
           billing_source = EXCLUDED.billing_source,
           sponsor_user_id = EXCLUDED.sponsor_user_id,
           sponsor_org_id = EXCLUDED.sponsor_org_id`,
    [invite.room_id, req.user.id, billing_source, sponsor_user_id, sponsor_org_id, now],
  );

  // 7) update use_count/status
  const newUse = invite.use_count + 1;
  await trx.q(
    `UPDATE invites
        SET use_count = $1,
            status = CASE WHEN $1 >= max_uses THEN 'accepted' ELSE 'sent' END
      WHERE id = $2`,
    [newUse, invite.id],
  );

  // 8) audit
  await trx.q(
    `INSERT INTO audit_logs (actor_id, room_id, target_user_id, action_type, metadata)
     VALUES ($1, $2, $3, 'invite_accepted',
             jsonb_build_object('invite_id', $4, 'billing_source', $5))`,
    [req.user.id, invite.room_id, req.user.id, invite.id, billing_source],
  );

  return { room_id: invite.room_id, joined: true, billing_source };
});
```

### 3.2 Host sponsorluse kontroll

`checkHostSponsorship(...)` peab:

- kontrollima kehtivat plaani,
- kontrollima limiite/kvoote (kui seat- või guest-põhine),
- tagastama true/false.

Kui `false` → kliendile neutraalne teade, kutsujale/adminile detailne seletus (separate view).

## 4. Kaks põhireeglit (fikseeritud)

- Kui kasutajal on oma aktiivne/grace plaan → always `billing_source = 'self'` sõltumata `invites.payment_mode` väärtusest (vältida topelt maksmist / sponsorlimiidi raiskamist).
- Sponsoreeritud liitumine (`billing_source='sponsored_by_host'`) toimub ainult pärast hosti plaani/limiidi edukat kontrolli – ainult UI `payment_mode='sponsored_by_host'` ei piisa.

## 5. UX (kutsuja/admin)

- `billing_source='self'` → Liitunud (oma plaaniga)
- `billing_source='sponsored_by_host'` → Liitunud (sponsoreeritud)

Klient ei näe seda informatsiooni.

## 6. Veateated (API vs kasutaja)

API:

- 402 SUBSCRIPTION_REQUIRED
- 409 SPONSOR_NOT_AVAILABLE
- 410 INVITE_EXPIRED
- 410 INVITE_EXHAUSTED

Kliendile:

- neutraalsed teated, mitte arvelduse detailid
- vajadusel “Palun võta ühendust oma spetsialistiga.”

## 7. Anti-spam / throttling

- POST /api/invites – limit per inviter & IP (nt 10/min); bounce detection; organisatsiooni tasemel limiidid.
- POST /api/invites/:token/accept – IP/token limit (nt 20/min); e-post peab olema kinnitatud; vajadusel CAPTCHA.

## 8. Organisations puudumisel

- `sponsored_by_org_id` võib alati olla NULL.
- kasutage ainult `sponsored_by_user_id`.
- tulevikus saab organisatsiooni-taseme billingut lisada.

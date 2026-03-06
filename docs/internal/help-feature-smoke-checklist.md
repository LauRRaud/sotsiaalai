# Help Feature Smoke Checklist

Date: 2026-03-06

Use this checklist before calling the help request / help offer feature ready
for production on the chat page.

## 1. Chat-native creation

1. Open `/vestlus`.
2. Write a natural request message such as:
   - `Mul oleks vaja emale abi poes käimiseks.`
3. Verify the chat starts a help-request workflow instead of a generic answer.
4. Verify only missing fields are asked.
5. Verify a confirmation summary is shown before save.
6. Confirm save.
7. Verify the success reply appears in the same conversation.

Repeat for help offer:

1. Write:
   - `Soovin pakkuda transporti Tallinnas.`
2. Verify the offer workflow starts inside the same chat.
3. Verify confirmation happens before save.

## 2. Location normalization

1. Start a request with a smaller place name:
   - `Mul oleks vaja abi Tabasalus.`
2. Verify the system normalizes it to the correct municipality.
3. If confidence is lower, verify it asks for confirmation.
4. Verify the saved structured location is `municipalityId`, not raw text.

## 3. LeftRail global browse

1. Open global `help requests` from LeftRail.
2. Verify listings are loaded from DB, not hardcoded.
3. Verify around 10 items load initially.
4. Verify `load more` loads more records.
5. Select one listing.
6. Verify its context opens in the chat area.

Repeat for LeftRail `help offers`.

## 4. RightRail personal workspace

1. Open `my help requests` from RightRail.
2. Verify only signed-in user listings are shown.
3. Select one listing.
4. Verify selected listing context opens in the chat area.
5. Verify `edit`, `close`, and `delete` work.

Repeat for `my help offers`.

Important:

- verify `Add people` still remains in RightRail
- verify it still opens the existing group-chat invite flow

## 5. Selected listing context

1. Open a global listing you do not own.
2. Verify the detail view is human-readable, not a raw DB dump.
3. Verify it shows:
   - title
   - summary / description
   - category
   - municipality
   - help type
   - time type
   - role label
   - target groups
   - status
4. Verify `Ask AI`, `Contact`, or `Offer help` actions are available as expected.

## 6. Matching and Room continuation

1. Open a request and choose one of your own offers, or vice versa.
2. Trigger explicit connect action.
3. Verify a `HelpMatch` is created only at this point.
4. Verify a `Room` is created or reused.
5. Verify the user lands in `/room/[roomId]`.
6. Verify the matched pair can continue communication in that Room.

## 7. Language checks

Check in:

- `et`
- `en`
- `ru`

Verify for each language:

- LeftRail help labels
- RightRail personal help labels
- listing panel actions
- selected listing context actions
- empty states
- edit / close / delete flows

## 8. Regression checks

1. Generic RAG answers still work in the same chat page.
2. Existing Room chat still works.
3. `Add people` still works.
4. Document workflow still starts from the main chat when relevant.
5. Profile page remains account/settings-focused and does not become the main
   listing-management surface.

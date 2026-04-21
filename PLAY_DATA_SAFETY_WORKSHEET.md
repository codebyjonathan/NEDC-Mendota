# Google Play Data Safety Worksheet (Safe Space)

Last updated: 2026-04-21

This worksheet is a practical mapping of current app behavior to Play Console's Data safety form. It is not legal advice.

## 1) Data inventory from current code

### A) User-generated content
- What: Safety chat messages users type in `Safety Plan` chat.
- Where in code:
  - `app/safety-plan/page.tsx` sends messages to `/api/safety-chat`
  - `app/api/safety-chat/route.ts` forwards content to OpenAI API
- Recommended Data safety treatment:
  - Data type: `Personal info -> Messages` (or closest chat/user content category in Play form)
  - Collected: `Yes`
  - Shared: `Yes` (to service provider/OpenAI for processing)
  - Required or optional: `Optional` (feature-based)
  - Purpose: `App functionality`, `Safety & moderation`

### B) Device/app identifiers
- What: `device_id` cookie used for notification/push device association.
- Where in code:
  - `app/api/notifications/route.ts` sets `device_id`
  - `app/api/push-notifications/[...slug]/route.ts` sets `device_id`
- Recommended Data safety treatment:
  - Data type: `Identifiers -> Device or other IDs`
  - Collected: `Yes`
  - Shared: `No` (based on current server code)
  - Required or optional: `Optional` (used for notifications)
  - Purpose: `App functionality`

### C) App activity / analytics
- What: Vercel Analytics usage telemetry.
- Where in code:
  - `app/layout.tsx` includes `@vercel/analytics/next`
- Recommended Data safety treatment:
  - Data type: `App activity` (usage analytics category)
  - Collected: `Yes`
  - Shared: `No` (unless you configured third-party sharing beyond analytics provider processing)
  - Required or optional: `Optional`
  - Purpose: `Analytics`

### D) Push subscription technical data
- What: Push subscription endpoint + keys (auth/p256dh), schedule metadata.
- Where in code:
  - `app/api/push-notifications/[...slug]/route.ts`
  - `lib/server/push-notification-store.ts`
- Recommended Data safety treatment:
  - Covered under `Identifiers` and technical app functionality data.
  - Collected: `Yes`
  - Shared: `No` (unless you add other outbound processors)
  - Purpose: `App functionality`

### E) Location
- What: Geolocation obtained in emergency-location screen; used to build share link.
- Where in code:
  - `app/emergency-location/page.tsx`
- Current behavior:
  - Location is used on-device and then explicitly shared by user action (SMS/share sheet/copy).
  - No app backend endpoint receives latitude/longitude in current code.
- Recommended Data safety treatment:
  - Collected by app/backend: `No` (current implementation)
  - Note: if you later send location to server, change this to `Yes` immediately.

## 2) Recommended Play Console answers (current code)

### "Does your app collect or share any required user data types?"
- Recommended: `Yes`

### Mark as collected/shared
- User messages/content for Safety AI:
  - Collected: `Yes`
  - Shared: `Yes` (service provider processing)
- Device/app IDs:
  - Collected: `Yes`
  - Shared: `No`
- App activity/analytics:
  - Collected: `Yes`
  - Shared: `No` (with current setup assumptions)
- Location:
  - Collected: `No` (current implementation)

### Data handling flags
- Is all user data encrypted in transit? `Yes` (HTTPS expected in production)
- Can users request data deletion?
  - With current architecture (no user account + mostly local/in-memory): select the option that matches "not applicable/no persistent account data," but keep wording consistent with your Privacy Policy.

## 3) What must be kept in sync (critical)

If you change any of these, update Data safety immediately:
- Add backend storage for location
- Add persistent database for chat/safety plan
- Add new analytics/SDKs
- Start sharing data with additional third parties
- Add user account system

## 4) Evidence checklist for review readiness

Keep these ready:
- Privacy Policy URL matching this behavior
- Short internal note of data flows:
  - `app/api/safety-chat/route.ts`
  - `app/api/push-notifications/[...slug]/route.ts`
  - `app/api/notifications/route.ts`
  - `app/layout.tsx`
  - `app/emergency-location/page.tsx`

## 5) Quick risk notes

- You currently have an old duplicate route at `app/api/push-notifications/route.ts` plus the newer catch-all route.
- To avoid declaration confusion, keep only one production push API path if possible.

## 6) Collaboration claim note (MHS NAMI)

- Team-confirmed statement:
  - Safe Space is built with a real school collaboration context involving MHS NAMI as a main collaborator based on your interview/project process.
- For Play review safety, keep verification artifacts ready:
  - adviser/club approval email or letter
  - project interview notes or meeting record
  - school-facing statement describing MHS NAMI collaboration scope
- Store listing wording should remain accurate and non-misleading (collaborator/supporter language, not formal endorsement unless documented that way).

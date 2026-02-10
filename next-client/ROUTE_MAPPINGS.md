# Express to Next.js Route Mappings - Quick Reference

## Job Routes

| Express Route | Next.js Route | Method | File Path |
|--------------|---------------|---------|-----------|
| `/ignore` | `/api/jobs/ignore` | POST | `app/api/jobs/ignore/route.ts` |
| `/get-ignored-jobs` | `/api/jobs/ignored` | GET | `app/api/jobs/ignored/route.ts` |
| `/applied-jobs/:userId` | `/api/jobs/applied/[userId]` | GET | `app/api/jobs/applied/[userId]/route.ts` |
| `/update-stage/:id` | `/api/jobs/stage/[id]` | PUT | `app/api/jobs/stage/[id]/route.ts` |
| `/scrape-logs` | `/api/jobs/scrape-logs` | GET | `app/api/jobs/scrape-logs/route.ts` |
| `/edit-apply-job/:jobId` | `/api/jobs/applied/[jobId]` | PUT | `app/api/jobs/applied/[jobId]/route.ts` |
| `/activate` | `/api/jobs/technologies/activate` | POST | `app/api/jobs/technologies/activate/route.ts` |
| `/deactivate` | `/api/jobs/technologies/deactivate` | POST | `app/api/jobs/technologies/deactivate/route.ts` |
| `/active/:userId` | `/api/jobs/technologies/[userId]` | GET | `app/api/jobs/technologies/[userId]/route.ts` |
| `/mark-hired` | `/api/jobs/hired` | POST | `app/api/jobs/hired/route.ts` |
| `/get-hired-jobs/:bidderId` | `/api/jobs/hired/[bidderId]` | GET | `app/api/jobs/hired/[bidderId]/route.ts` |

## Admin Routes

| Express Route | Next.js Route | Method | File Path |
|--------------|---------------|---------|-----------|
| `/allusers` | `/api/admin/users` | GET | `app/api/admin/users/route.ts` |
| `/allusers-count` | `/api/admin/users/count` | GET | `app/api/admin/users/count/route.ts` |
| `/job-count` | `/api/admin/jobs/count` | GET | `app/api/admin/jobs/count/route.ts` |
| `/appliedjob-count` | `/api/admin/jobs/applied-count` | GET | `app/api/admin/jobs/applied-count/route.ts` |
| `/top-tech` | `/api/admin/analytics/top-tech` | GET | `app/api/admin/analytics/top-tech/route.ts` |
| `/get-scrape-log-summary` | `/api/admin/scrape-logs/summary` | GET | `app/api/admin/scrape-logs/summary/route.ts` |
| `/user/activity` | `/api/admin/users/activity` | GET | `app/api/admin/users/activity/route.ts` |
| `/user/:id/status` | `/api/admin/users/[id]/status` | PUT | `app/api/admin/users/[id]/status/route.ts` |
| `/logs/:id` | `/api/admin/logs/[id]` | GET | `app/api/admin/logs/[id]/route.ts` |
| `/platforms` | `/api/admin/platforms` | GET | `app/api/admin/platforms/route.ts` |
| `/job-stats` | `/api/admin/analytics/job-stats` | GET | `app/api/admin/analytics/job-stats/route.ts` |
| `/user/:userId/jobs` | `/api/admin/users/[userId]/jobs` | GET | `app/api/admin/users/[userId]/jobs/route.ts` |

## Notification Routes

| Express Route | Next.js Route | Method | File Path |
|--------------|---------------|---------|-----------|
| `/` | `/api/notifications` | GET | `app/api/notifications/route.ts` |
| `/unread-count` | `/api/notifications/unread-count` | GET | `app/api/notifications/unread-count/route.ts` |
| `/:id/read` | `/api/notifications/[id]/read` | PUT | `app/api/notifications/[id]/read/route.ts` |
| `/mark-all-read` | `/api/notifications/mark-all-read` | PUT | `app/api/notifications/mark-all-read/route.ts` |
| `/all` | `/api/notifications/all` | DELETE | `app/api/notifications/all/route.ts` |
| `/:id` | `/api/notifications/[id]` | DELETE | `app/api/notifications/[id]/route.ts` |
| `/test` | `/api/notifications/test` | POST | `app/api/notifications/test/route.ts` |

## Developer Routes

| Express Route | Next.js Route | Method | File Path |
|--------------|---------------|---------|-----------|
| `/get-all-developers` | `/api/developers` | GET | `app/api/developers/route.ts` |
| `/add-developer` | `/api/developers` | POST | `app/api/developers/route.ts` |
| `/edit-developer/:developerId` | `/api/developers/[developerId]` | PUT | `app/api/developers/[developerId]/route.ts` |
| `/delete-developer/:developerId` | `/api/developers/[developerId]` | DELETE | `app/api/developers/[developerId]/route.ts` |

## Profile Routes

| Express Route | Next.js Route | Method | File Path |
|--------------|---------------|---------|-----------|
| `/get-all-profiles` | `/api/profiles` | GET | `app/api/profiles/route.ts` |

## Portfolio Routes

| Express Route | Next.js Route | Method | File Path |
|--------------|---------------|---------|-----------|
| `/portfolios/all` | `/api/portfolios` | GET | `app/api/portfolios/route.ts` |
| `/portfolios` (POST) | `/api/portfolios` | POST | `app/api/portfolios/route.ts` |
| `/portfolios/user/:userId` | `/api/portfolios/user/[userId]` | GET | `app/api/portfolios/user/[userId]/route.ts` |
| `/portfolios/:id` (GET) | `/api/portfolios/[id]` | GET | `app/api/portfolios/[id]/route.ts` |
| `/portfolios/:id` (PUT) | `/api/portfolios/[id]` | PUT | `app/api/portfolios/[id]/route.ts` |
| `/portfolios/:id` (DELETE) | `/api/portfolios/[id]` | DELETE | `app/api/portfolios/[id]/route.ts` |
| `/portfolios/reorder` | `/api/portfolios/reorder` | PATCH | `app/api/portfolios/reorder/route.ts` |

## Connects Routes

| Express Route | Next.js Route | Method | File Path |
|--------------|---------------|---------|-----------|
| `/get-connects/:userId` | `/api/connects/[userId]` | GET | `app/api/connects/[userId]/route.ts` |
| `/save-connect-cost` | `/api/connects/cost` | POST | `app/api/connects/cost/route.ts` |
| `/create-platform` | `/api/connects/platform` | POST | `app/api/connects/platform/route.ts` |

## Target Routes

| Express Route | Next.js Route | Method | File Path |
|--------------|---------------|---------|-----------|
| `/set-target` | `/api/targets` | POST | `app/api/targets/route.ts` |
| `/get-target` | `/api/targets` | GET | `app/api/targets/route.ts` |

---

## Usage Examples

### Frontend API Calls - Before (Express)
```typescript
// Old Express routes
const response = await fetch('/api/jobs/ignore', { method: 'POST', ... });
const response = await fetch('/api/admin/users', { method: 'GET', ... });
```

### Frontend API Calls - After (Next.js)
```typescript
// New Next.js routes - SAME PATHS!
const response = await fetch('/api/jobs/ignore', { method: 'POST', ... });
const response = await fetch('/api/admin/users', { method: 'GET', ... });
```

**No changes needed in frontend code!** All API paths remain the same.

---

## Key Differences in Implementation

### Express (Old)
```javascript
router.post('/ignore', authenticate, ignoreJobController.ignoreJob);

// Controller
const ignoreJob = async (req, res) => {
  const userId = req.user.id;
  res.status(200).json({ message: "Job marked as ignored" });
};
```

### Next.js (New)
```typescript
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  const userId = context.user.id;
  return NextResponse.json({ message: "Job marked as ignored" });
}

export const POST = withAuth(handler);
```

---

## Authentication

All routes use the `withAuth()` middleware which:
- Validates JWT tokens
- Attaches user to context: `context.user`
- Returns 401 for unauthorized requests

---

## Path Parameters

Express `:param` → Next.js `[param]`

- Express: `/user/:id` → Handler: `req.params.id`
- Next.js: `/user/[id]` → Handler: `context.params.id`

---

## Query Parameters

Accessed via `req.nextUrl.searchParams`:

```typescript
const { search, page, limit } = Object.fromEntries(req.nextUrl.searchParams);
```

---

## File Structure

```
next-client/
└── app/
    └── api/
        ├── jobs/
        │   ├── ignore/route.ts
        │   ├── ignored/route.ts
        │   ├── applied/[userId]/route.ts
        │   ├── stage/[id]/route.ts
        │   ├── scrape-logs/route.ts
        │   ├── technologies/
        │   │   ├── activate/route.ts
        │   │   ├── deactivate/route.ts
        │   │   └── [userId]/route.ts
        │   └── hired/
        │       ├── route.ts
        │       └── [bidderId]/route.ts
        ├── admin/
        │   ├── users/
        │   │   ├── route.ts
        │   │   ├── count/route.ts
        │   │   ├── activity/route.ts
        │   │   ├── [id]/status/route.ts
        │   │   └── [userId]/jobs/route.ts
        │   ├── jobs/
        │   │   ├── count/route.ts
        │   │   └── applied-count/route.ts
        │   ├── analytics/
        │   │   ├── top-tech/route.ts
        │   │   └── job-stats/route.ts
        │   ├── scrape-logs/summary/route.ts
        │   ├── logs/[id]/route.ts
        │   └── platforms/route.ts
        ├── notifications/
        │   ├── route.ts
        │   ├── unread-count/route.ts
        │   ├── mark-all-read/route.ts
        │   ├── all/route.ts
        │   ├── test/route.ts
        │   └── [id]/
        │       ├── route.ts
        │       └── read/route.ts
        ├── developers/
        │   ├── route.ts
        │   └── [developerId]/route.ts
        ├── profiles/route.ts
        ├── portfolios/
        │   ├── route.ts
        │   ├── reorder/route.ts
        │   ├── user/[userId]/route.ts
        │   └── [id]/route.ts
        ├── connects/
        │   ├── [userId]/route.ts
        │   ├── cost/route.ts
        │   └── platform/route.ts
        └── targets/route.ts
```

---

## Status Codes

All HTTP status codes preserved:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 409: Conflict
- 500: Server Error

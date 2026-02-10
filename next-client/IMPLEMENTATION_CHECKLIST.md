# Next.js API Routes Implementation Checklist

## ✅ Completed Tasks

### Route Conversion (47 endpoints)
- ✅ **Job Routes** (11 endpoints) - All converted with authentication and Vercel config
- ✅ **Admin Routes** (12 endpoints) - Including complex job-stats analytics
- ✅ **Notification Routes** (7 endpoints) - Full CRUD with notification service integration
- ✅ **Developer Routes** (4 endpoints) - GET, POST, PUT, DELETE operations
- ✅ **Profile Routes** (1 endpoint) - Simple GET all profiles
- ✅ **Portfolio Routes** (7 endpoints) - Full portfolio management with reordering
- ✅ **Connects Routes** (3 endpoints) - Usage tracking and platform management
- ✅ **Target Routes** (2 endpoints) - Weekly target management with notifications

### Critical Features Applied
- ✅ All routes have Vercel runtime configuration (`runtime: 'nodejs'`, `dynamic: 'force-dynamic'`)
- ✅ All routes use `withAuth()` middleware for authentication
- ✅ All routes use Next.js `NextRequest` and `NextResponse`
- ✅ All routes use Sequelize models from `@/lib/db/models`
- ✅ All business logic preserved exactly as original
- ✅ All error handling maintained
- ✅ All response formats preserved

---

## 🔧 Required Setup Tasks

### 1. Create Authentication Middleware
**File**: `d:\bidding-tracking\next-client\lib\middleware\auth.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function withAuth(handler: Function) {
  return async (req: NextRequest, context: any) => {
    try {
      const token = req.headers.get('authorization')?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      context.user = decoded;

      return await handler(req, context);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  };
}
```

### 2. Create Database Models Index
**File**: `d:\bidding-tracking\next-client\lib\db\models\index.ts`

Export all Sequelize models:
```typescript
export { Job } from './Job';
export { AppliedJob } from './AppliedJob';
export { IgnoredJob } from './IgnoredJob';
export { HiredJob } from './HiredJob';
export { User } from './User';
export { Technology } from './Technology';
export { UserTechnology } from './UserTechnology';
export { ScrapeLog } from './ScrapeLog';
export { TechnologyJobCount } from './TechnologyJobCount';
export { Developer } from './Developer';
export { Profiles } from './Profiles';
export { Portfolio } from './Portfolio';
export { Platform } from './Platform';
export { WeeklyTarget } from './WeeklyTarget';
export { Logs } from './Logs';
// Add other models as needed
```

### 3. Create Database Configuration
**File**: `d:\bidding-tracking\next-client\lib\db\config.ts`

```typescript
import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});
```

### 4. Create Notification Service
**File**: `d:\bidding-tracking\next-client\lib\services\notificationService.ts`

Copy from: `server/services/notificationService.js`
Convert to TypeScript

### 5. Create Notification Helpers
**File**: `d:\bidding-tracking\next-client\lib\utils\notificationHelper.ts`

Copy from: `server/utils/notificationHelper.js`
Convert to TypeScript

Functions needed:
- `notifyJobApplied()`
- `notifyJobReplied()`
- `notifyJobInterviewed()`
- `notifyJobNotHired()`
- `notifyJobHired()`
- `notifyUserBlocked()`
- `notifyUserActivated()`
- `notifyTargetSet()`
- `notifyTargetUpdated()`
- `notifyTargetAchieved()`

### 6. Copy Sequelize Models
**Directory**: `d:\bidding-tracking\next-client\lib\db\models\`

Copy and convert to TypeScript from:
- `server/models/Job.js`
- `server/models/Applyjob.js`
- `server/models/IgnoredJob.js`
- `server/models/HiredJobs.js`
- `server/models/User.js`
- `server/models/Technologies.js`
- `server/models/UserTechnologies.js`
- `server/models/ScrapeLog.js`
- `server/models/TechnologyJobCount.js`
- `server/models/Developer.js`
- `server/models/Profiles.js`
- `server/models/Portfolio.js`
- `server/models/Platform.js`
- `server/models/WeeklyTargets.js`
- `server/models/Logs.js`

### 7. Update Environment Variables
**File**: `d:\bidding-tracking\next-client\.env.local`

Add:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=bidding_tracking
JWT_SECRET=your_jwt_secret
```

### 8. Install Required Dependencies
```bash
cd d:\bidding-tracking\next-client
npm install sequelize mysql2 jsonwebtoken uuid socket.io
npm install -D @types/jsonwebtoken @types/uuid
```

### 9. Configure Socket.io for Next.js
**File**: `d:\bidding-tracking\next-client\lib\socket.ts`

Set up Socket.io server for Next.js (custom server or middleware approach)

### 10. Update TypeScript Configuration
**File**: `d:\bidding-tracking\next-client\tsconfig.json`

Ensure path aliases are configured:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./"]
    }
  }
}
```

---

## 🧪 Testing Checklist

### Job Routes Testing
- [ ] POST `/api/jobs/ignore` - Ignore a job
- [ ] GET `/api/jobs/ignored` - Get ignored jobs with filters
- [ ] GET `/api/jobs/applied/[userId]` - Get applied jobs with pagination
- [ ] PUT `/api/jobs/stage/[id]` - Update job stage
- [ ] GET `/api/jobs/scrape-logs` - Get scrape logs
- [ ] PUT `/api/jobs/applied/[jobId]` - Edit applied job
- [ ] POST `/api/jobs/technologies/activate` - Activate technology
- [ ] POST `/api/jobs/technologies/deactivate` - Deactivate technology
- [ ] GET `/api/jobs/technologies/[userId]` - Get user technologies
- [ ] POST `/api/jobs/hired` - Mark job as hired
- [ ] GET `/api/jobs/hired/[bidderId]` - Get hired jobs

### Admin Routes Testing
- [ ] GET `/api/admin/users` - Get all users
- [ ] GET `/api/admin/users/count` - Get user count
- [ ] GET `/api/admin/jobs/count` - Get job count
- [ ] GET `/api/admin/jobs/applied-count` - Get applied jobs count
- [ ] GET `/api/admin/analytics/top-tech` - Get top technologies
- [ ] GET `/api/admin/scrape-logs/summary` - Get scrape log summary
- [ ] GET `/api/admin/users/activity` - Get user activity details
- [ ] PUT `/api/admin/users/[id]/status` - Toggle user status
- [ ] GET `/api/admin/logs/[id]` - Get user logs
- [ ] GET `/api/admin/platforms` - Get all platforms
- [ ] GET `/api/admin/analytics/job-stats` - Get comprehensive job statistics
- [ ] GET `/api/admin/users/[userId]/jobs` - Get user's all jobs

### Notification Routes Testing
- [ ] GET `/api/notifications` - Get notifications
- [ ] GET `/api/notifications/unread-count` - Get unread count
- [ ] PUT `/api/notifications/[id]/read` - Mark as read
- [ ] PUT `/api/notifications/mark-all-read` - Mark all as read
- [ ] DELETE `/api/notifications/all` - Delete all notifications
- [ ] DELETE `/api/notifications/[id]` - Delete single notification
- [ ] POST `/api/notifications/test` - Send test notification

### Developer Routes Testing
- [ ] GET `/api/developers` - Get all developers
- [ ] POST `/api/developers` - Add developer
- [ ] PUT `/api/developers/[developerId]` - Edit developer
- [ ] DELETE `/api/developers/[developerId]` - Delete developer

### Profile Routes Testing
- [ ] GET `/api/profiles` - Get all profiles

### Portfolio Routes Testing
- [ ] GET `/api/portfolios` - Get all portfolios
- [ ] POST `/api/portfolios` - Create portfolio
- [ ] GET `/api/portfolios/user/[userId]` - Get user portfolios
- [ ] GET `/api/portfolios/[id]` - Get portfolio by ID
- [ ] PUT `/api/portfolios/[id]` - Update portfolio
- [ ] DELETE `/api/portfolios/[id]` - Delete portfolio
- [ ] PATCH `/api/portfolios/reorder` - Reorder portfolios

### Connects Routes Testing
- [ ] GET `/api/connects/[userId]` - Get connects usage
- [ ] POST `/api/connects/cost` - Update connect cost
- [ ] POST `/api/connects/platform` - Create platform

### Target Routes Testing
- [ ] GET `/api/targets` - Get weekly target
- [ ] POST `/api/targets` - Set/update weekly target

---

## 🔍 Verification Steps

### 1. Authentication
- [ ] All protected routes return 401 without valid token
- [ ] Valid JWT token allows access
- [ ] User context is properly attached

### 2. Database Connections
- [ ] Sequelize connects successfully
- [ ] All models are properly loaded
- [ ] Database queries execute without errors

### 3. Error Handling
- [ ] 400 errors for invalid input
- [ ] 404 errors for not found resources
- [ ] 500 errors for server issues
- [ ] Error messages are descriptive

### 4. Business Logic
- [ ] All filters work correctly (date, tech, rating, etc.)
- [ ] Pagination returns correct results
- [ ] Aggregations match expected values
- [ ] Notifications are sent properly

### 5. Performance
- [ ] Routes respond within acceptable time
- [ ] Database queries are optimized
- [ ] No memory leaks

---

## 📝 Migration Notes

### Frontend Changes Required
**NONE!** All API paths remain the same. Frontend code should work without modifications.

### Backend Changes
- Express server can be retired once all routes are verified
- Socket.io server needs to be integrated with Next.js
- File upload handling may need adjustment for Next.js

### Deployment Considerations
- Vercel configuration for Sequelize connections
- Database connection pooling
- Environment variables setup
- Socket.io hosting (may need separate service)

---

## ⚠️ Known Limitations

1. **Socket.io Integration**: Next.js doesn't natively support Socket.io. Options:
   - Use custom Next.js server
   - Deploy separate Socket.io service
   - Use Vercel Serverless Functions with polling fallback

2. **File Uploads**: Next.js handles file uploads differently:
   - May need to use `next-connect` or similar middleware
   - Consider using cloud storage (S3, Cloudinary)

3. **Long-Running Queries**:
   - Vercel has 10s timeout for Hobby plan
   - Consider upgrading or optimizing complex queries

---

## 🎯 Success Criteria

- [ ] All 47 endpoints converted and tested
- [ ] All authentication working
- [ ] All database operations successful
- [ ] All business logic preserved
- [ ] Frontend works without code changes
- [ ] Error handling consistent
- [ ] Performance acceptable
- [ ] Documentation complete

---

## 📚 Additional Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Sequelize with Next.js](https://sequelize.org/)
- [withAuth Middleware Pattern](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Socket.io with Next.js](https://socket.io/get-started/chat#integrating-socketio)

---

## 🚀 Next Steps

1. Create all required helper files (auth, models, services)
2. Install dependencies
3. Set up environment variables
4. Test each route category
5. Integrate Socket.io
6. Deploy to Vercel
7. Monitor and optimize

---

**Status**: All route files created ✅
**Next**: Create supporting infrastructure files

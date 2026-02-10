# Next.js Migration Plan - Bidding Tracking Application

## Executive Summary

**Goal:** Convert Node.js/Express backend + React/Vite frontend to Next.js while maintaining 100% functionality, design, and zero breaking changes.

**Timeline:** 3-4 weeks (phased approach)

**Team Size:** 1-2 developers

---

## Critical Architecture Decision

### Problem: Socket.io + Vercel Incompatibility

Your application requires Socket.io for real-time notifications. Vercel's serverless architecture **cannot support Socket.io**.

### Solution: Next.js with Custom Server

Deploy Next.js with custom Express server (includes Socket.io) to **Railway/Render** instead of Vercel.

```
Next.js App (with Custom Express + Socket.io Server)
↓
Deploy to Railway/Render (NOT Vercel)
↓
Supports: API Routes + Socket.io + File Uploads
```

**Why this works:**
- ✅ All functionality preserved (Socket.io, file uploads, long-running processes)
- ✅ Zero code breaking
- ✅ Design stays identical
- ✅ One deployment (not separate frontend/backend)

**Alternative:** Deploy frontend to Vercel + backend to Railway (2 deployments)

---

## Project Structure After Migration

```
d:\bidding-tracking\
├── next-app/                          # New Next.js application
│   ├── app/                           # Next.js App Router
│   │   ├── (auth)/                    # Auth pages group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/               # User dashboard group
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── applied-jobs/
│   │   │   ├── hired-jobs/
│   │   │   ├── ignored-jobs/
│   │   │   ├── portfolios/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   ├── notifications/
│   │   │   ├── progress-tracker/
│   │   │   ├── manage-developers/
│   │   │   └── scrape-logs/
│   │   ├── (admin)/                   # Admin dashboard group
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── user-activity/
│   │   │   ├── [userId]/
│   │   │   │   └── jobs/
│   │   │   ├── jobs/
│   │   │   ├── applied-jobs/
│   │   │   ├── hired-jobs/
│   │   │   ├── scrape-logs/
│   │   │   ├── connects-logs/
│   │   │   ├── connects-cost/
│   │   │   ├── progress-tracker/
│   │   │   ├── portfolios/
│   │   │   └── notifications/
│   │   ├── api/                       # Next.js API Routes (converted from Express)
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── register/route.ts
│   │   │   │   ├── check/route.ts
│   │   │   │   └── logout/route.ts
│   │   │   ├── jobs/
│   │   │   │   ├── route.ts
│   │   │   │   ├── [jobId]/route.ts
│   │   │   │   ├── apply-job/route.ts
│   │   │   │   ├── get-jobs/route.ts
│   │   │   │   └── all-technology-names/route.ts
│   │   │   ├── applied-jobs/route.ts
│   │   │   ├── portfolios/
│   │   │   ├── notifications/
│   │   │   ├── admin/
│   │   │   └── developers/
│   │   ├── layout.tsx                 # Root layout
│   │   └── page.tsx                   # Root page (redirect)
│   ├── components/                    # Migrated from client/src/components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── admin/
│   │   ├── cards/
│   │   ├── modals/
│   │   ├── ui/
│   │   ├── Sidebar.tsx
│   │   ├── GlobalHeader.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── [more components...]
│   ├── lib/                           # Utilities and configurations
│   │   ├── db/                        # Database (from server/)
│   │   │   ├── config.ts
│   │   │   ├── models/                # All 19 Sequelize models
│   │   │   └── migrations/
│   │   ├── store/                     # Redux store
│   │   │   ├── store.ts
│   │   │   ├── slices/
│   │   │   │   └── authSlice.ts
│   │   │   └── hooks.ts
│   │   ├── socket/                    # Socket.io client
│   │   │   └── SocketContext.tsx
│   │   ├── api.ts                     # API client (Axios)
│   │   ├── auth.ts                    # Auth utilities
│   │   └── validations.ts             # Yup schemas
│   ├── context/                       # Context providers
│   │   ├── NotificationContext.tsx
│   │   └── Providers.tsx
│   ├── middleware.ts                  # Next.js middleware for auth
│   ├── server.js                      # Custom Express server with Socket.io
│   ├── uploads/                       # File uploads (from server/uploads)
│   ├── public/                        # Static assets
│   ├── .env.local                     # Environment variables
│   ├── next.config.ts                 # Next.js configuration
│   ├── tailwind.config.js             # Tailwind CSS config
│   ├── package.json
│   └── tsconfig.json
├── client/                            # OLD (keep for reference, delete after migration)
├── server/                            # OLD (keep for reference, delete after migration)
└── next-client/                       # OLD (delete)
```

---

## Phase-by-Phase Implementation Plan

### Phase 0: Pre-Migration Setup (Day 1)

**Tasks:**
1. Create new `next-app/` directory
2. Initialize Next.js project with TypeScript
3. Install all dependencies
4. Set up Tailwind CSS
5. Configure ESLint and Prettier

**Commands:**
```bash
cd d:\bidding-tracking
npx create-next-app@latest next-app --typescript --tailwind --app --src-dir=false
cd next-app
npm install
```

**Dependencies to install:**
```bash
# Core
npm install next@latest react@18.3.1 react-dom@18.3.1

# Backend (from server/package.json)
npm install express socket.io sequelize mysql2 pg pg-hstore
npm install bcryptjs jsonwebtoken cookie-parser cors dotenv multer
npm install csv-parser uuid

# Frontend (from client/package.json)
npm install @reduxjs/toolkit react-redux redux-persist
npm install axios formik yup
npm install react-modal react-toastify react-loader-spinner
npm install recharts react-paginate
npm install lucide-react @headlessui/react
npm install date-fns react-datepicker react-date-range
npm install react-select socket.io-client

# Types
npm install --save-dev @types/react @types/node @types/express
npm install --save-dev @types/bcryptjs @types/cookie-parser @types/cors
npm install --save-dev @types/multer @types/jsonwebtoken
```

---

### Phase 1: Database Layer Migration (Days 2-3)

**Goal:** Move Sequelize models and database configuration

**Tasks:**

1. **Create `next-app/lib/db/config.ts`**
   - Copy from `server/config/db.js`
   - Convert to TypeScript
   - Use environment variables

2. **Migrate all 19 models to `next-app/lib/db/models/`**
   - User.js → User.ts
   - Job.js → Job.ts
   - AppliedJob.js → AppliedJob.ts
   - Portfolio.js → Portfolio.ts
   - Technology.js → Technology.ts
   - UserTechnology.js → UserTechnology.ts
   - Developer.js → Developer.ts
   - HiredJob.js → HiredJob.ts
   - ScrapeLog.js → ScrapeLog.ts
   - Notification.js → Notification.ts
   - ConnectCost.js → ConnectCost.ts
   - (All 19 models)

3. **Create model index file**
   - `next-app/lib/db/models/index.ts`
   - Initialize Sequelize
   - Set up all associations

**Files to migrate:**
- `server/config/db.js` → `next-app/lib/db/config.ts`
- `server/models/*.js` → `next-app/lib/db/models/*.ts` (19 files)

---

### Phase 2: Backend API Routes Migration (Days 4-8)

**Goal:** Convert Express routes to Next.js API routes

#### Day 4: Authentication Routes

**Migrate:** `server/routes/authRoute.js`

**Convert to:**
- `next-app/app/api/auth/login/route.ts`
- `next-app/app/api/auth/register/route.ts`
- `next-app/app/api/auth/check/route.ts`
- `next-app/app/api/auth/logout/route.ts`

**Example conversion:**
```typescript
// OLD: server/routes/authRoute.js
router.post('/login', authController.login);

// NEW: next-app/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/lib/db/models';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.SECRET_KEY!,
      { expiresIn: '7d' }
    );

    // Set cookie
    const response = NextResponse.json({
      message: 'Login successful',
      token,
      userId: user.id,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### Day 5: Job Routes

**Migrate:** `server/routes/jobRoute.js`

**Convert to:**
- `next-app/app/api/jobs/route.ts` (GET all, POST create)
- `next-app/app/api/jobs/[jobId]/route.ts` (GET, PUT, DELETE)
- `next-app/app/api/jobs/get-jobs/route.ts`
- `next-app/app/api/jobs/apply-job/route.ts`
- `next-app/app/api/jobs/all-technology-names/route.ts`
- `next-app/app/api/jobs/activate/route.ts`
- `next-app/app/api/jobs/deactivate/route.ts`
- `next-app/app/api/jobs/mark-hired/route.ts`
- `next-app/app/api/jobs/attachments/[filename]/route.ts` (file serving)

**File Upload Handling:**
```typescript
// next-app/app/api/jobs/apply-job/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll('attachments') as File[];

  const uploadedFiles = [];
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(process.cwd(), 'uploads', 'attachments', filename);

    await writeFile(filepath, buffer);
    uploadedFiles.push(filename);
  }

  // Save job application with uploadedFiles
  // ...
}
```

#### Day 6: Applied Jobs, Hired Jobs, Ignored Jobs Routes

**Migrate:**
- `server/routes/appliedJobRoute.js`
- `server/routes/hiredJobRoute.js`
- `server/routes/ignoredJobRoute.js`

**Convert to:**
- `next-app/app/api/applied-jobs/route.ts`
- `next-app/app/api/applied-jobs/[id]/route.ts`
- `next-app/app/api/mark-as-reply/route.ts`
- `next-app/app/api/mark-as-interview/route.ts`
- `next-app/app/api/mark-as-not-hired/route.ts`
- `next-app/app/api/edit-applied-job/route.ts`
- `next-app/app/api/delete-applied-job/route.ts`

#### Day 7: Admin Routes

**Migrate:** `server/routes/adminRoute.js`

**Convert to:**
- `next-app/app/api/admin/job-stats/route.ts`
- `next-app/app/api/admin/user/activity/route.ts`
- `next-app/app/api/admin/users/route.ts`
- `next-app/app/api/admin/block-user/route.ts`

#### Day 8: Remaining Routes

**Migrate:**
- `server/routes/portfolioRoute.js` → `next-app/app/api/portfolios/**`
- `server/routes/notificationRoute.js` → `next-app/app/api/notifications/**`
- `server/routes/developerRoute.js` → `next-app/app/api/developers/**`
- `server/routes/connectRoute.js` → `next-app/app/api/connects/**`
- `server/routes/technologyRoute.js` → `next-app/app/api/technologies/**`

**Create middleware helper:**
```typescript
// next-app/lib/auth.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function verifyAuth(request: NextRequest) {
  const token = cookies().get('token')?.value;

  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
      userId: number;
      role: string;
    };
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function requireAdmin(request: NextRequest) {
  const user = await verifyAuth(request);
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return user;
}
```

---

### Phase 3: Socket.io Server Setup (Day 9)

**Goal:** Integrate Socket.io with Next.js custom server

**Create `next-app/server.js`:**
```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const express = require('express');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = createServer(expressApp);

  // Socket.io setup
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_APP_URL
        : 'http://localhost:3000',
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Socket.io connection handling (from server/server.js)
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user room
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room`);
    });

    // Join admin room
    socket.on('join_admin', () => {
      socket.join('admin_room');
      console.log('Admin joined room');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // Make io accessible in API routes
  expressApp.use((req, res, next) => {
    req.io = io;
    next();
  });

  // Cookie parser
  expressApp.use(cookieParser());

  // Handle all requests with Next.js
  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

**Update `package.json`:**
```json
{
  "scripts": {
    "dev": "node server.js",
    "build": "next build",
    "start": "NODE_ENV=production node server.js"
  }
}
```

**Socket.io helper for API routes:**
```typescript
// next-app/lib/socket.ts (server-side)
import { Server } from 'socket.io';

let io: Server | null = null;

export function setSocketIO(socketIO: Server) {
  io = socketIO;
}

export function getSocketIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export function emitToUser(userId: number, event: string, data: any) {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
}

export function emitToAdmin(event: string, data: any) {
  if (io) {
    io.to('admin_room').emit(event, data);
  }
}
```

**Update API routes to emit Socket.io events:**
```typescript
// Example: next-app/app/api/applied-jobs/route.ts
import { emitToUser, emitToAdmin } from '@/lib/socket';

export async function POST(request: NextRequest) {
  // ... create applied job

  // Emit notification
  emitToUser(userId, 'notification', {
    message: 'Job application submitted',
    type: 'success'
  });

  emitToAdmin('admin_notification', {
    message: `User ${userId} applied to job`,
    type: 'info'
  });

  return NextResponse.json({ success: true });
}
```

---

### Phase 4: Frontend Pages Migration (Days 10-16)

**Goal:** Migrate all React pages to Next.js pages

#### Day 10: Auth Pages

**Migrate:**
- `client/src/pages/Login.jsx` → `next-app/app/(auth)/login/page.tsx`
- `client/src/pages/Register.jsx` → `next-app/app/(auth)/register/page.tsx`

**Example:**
```typescript
// next-app/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/lib/store/slices/authSlice';
import { toast } from 'react-toastify';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required')
});

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', values, {
        withCredentials: true
      });

      const { token, userId, user } = response.data;

      dispatch(setCredentials({ token, userId, user }));

      toast.success('Login successful!');

      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email</label>
                <Field
                  name="email"
                  type="email"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                {errors.email && touched.email && (
                  <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Password</label>
                <Field
                  name="password"
                  type="password"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                {errors.password && touched.password && (
                  <div className="text-red-500 text-sm mt-1">{errors.password}</div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
```

#### Day 11: Dashboard Layout

**Create:**
- `next-app/app/(dashboard)/layout.tsx`

**Migrate components:**
- `client/src/components/Sidebar.jsx` → `next-app/components/Sidebar.tsx`
- `client/src/components/GlobalHeader.jsx` → `next-app/components/GlobalHeader.tsx`
- `client/src/components/DashboardLayout.jsx` → `next-app/components/DashboardLayout.tsx`

#### Days 12-13: User Dashboard Pages

**Migrate:**
- `client/src/pages/dashboard/Dashboard.jsx` → `next-app/app/(dashboard)/page.tsx`
- `client/src/pages/dashboard/AppliedJobs.jsx` → `next-app/app/(dashboard)/applied-jobs/page.tsx`
- `client/src/pages/dashboard/HiredJobs.jsx` → `next-app/app/(dashboard)/hired-jobs/page.tsx`
- `client/src/pages/dashboard/IgnoredJobs.jsx` → `next-app/app/(dashboard)/ignored-jobs/page.tsx`
- `client/src/pages/dashboard/Portfolios.jsx` → `next-app/app/(dashboard)/portfolios/page.tsx`
- `client/src/pages/dashboard/Profile.jsx` → `next-app/app/(dashboard)/profile/page.tsx`
- `client/src/pages/dashboard/Settings.jsx` → `next-app/app/(dashboard)/settings/page.tsx`
- `client/src/pages/dashboard/Notifications.jsx` → `next-app/app/(dashboard)/notifications/page.tsx`
- `client/src/pages/dashboard/ProgressTracker.jsx` → `next-app/app/(dashboard)/progress-tracker/page.tsx`
- `client/src/pages/dashboard/ManageDevelopers.jsx` → `next-app/app/(dashboard)/manage-developers/page.tsx`

#### Days 14-15: Admin Pages

**Migrate:**
- `client/src/admin/Dashboard.jsx` → `next-app/app/(admin)/dashboard/page.tsx`
- `client/src/admin/pages/Allusers.jsx` → `next-app/app/(admin)/users/page.tsx`
- `client/src/admin/pages/UserActivity.jsx` → `next-app/app/(admin)/user-activity/page.tsx`
- `client/src/admin/pages/UserJobDetails.jsx` → `next-app/app/(admin)/[userId]/jobs/page.tsx`
- `client/src/admin/pages/ScrapeLogs.jsx` → `next-app/app/(admin)/scrape-logs/page.tsx`
- `client/src/admin/pages/Connects.jsx` → `next-app/app/(admin)/connects-logs/page.tsx`
- `client/src/admin/pages/ConnectCost.jsx` → `next-app/app/(admin)/connects-cost/page.tsx`
- `client/src/admin/pages/AllPortfolios.jsx` → `next-app/app/(admin)/portfolios/page.tsx`

#### Day 16: Remaining Pages

**Migrate:**
- `client/src/pages/dashboard/Job.jsx`
- `client/src/pages/dashboard/Test.jsx`

---

### Phase 5: Components Migration (Days 17-19)

**Goal:** Migrate all shared components

#### Day 17: Card Components

**Migrate:**
- `client/src/components/cards/JobCard.jsx` → `next-app/components/cards/JobCard.tsx`
- `client/src/components/cards/AppliedCard.jsx` → `next-app/components/cards/AppliedCard.tsx`
- `client/src/components/cards/HiredJobsCard.jsx` → `next-app/components/cards/HiredJobsCard.tsx`
- `client/src/components/cards/UniversalJobCard.jsx` → `next-app/components/cards/UniversalJobCard.tsx`

#### Day 18: Form & Filter Components

**Migrate:**
- `client/src/components/JobFilters.jsx` → `next-app/components/JobFilters.tsx`
- `client/src/components/JobSearch.jsx` → `next-app/components/JobSearch.tsx`
- `client/src/components/FileUpload.jsx` → `next-app/components/FileUpload.tsx`
- `client/src/components/DeveloperForm.jsx` → `next-app/components/DeveloperForm.tsx`
- `client/src/components/UnifiedDateTimePicker.jsx` → `next-app/components/UnifiedDateTimePicker.tsx`

#### Day 19: Modal Components (17 modals)

**Migrate all modals from:**
- `client/src/modals/*.jsx` → `next-app/components/modals/*.tsx`
- `client/src/admin/modals/*.jsx` → `next-app/components/modals/admin/*.tsx`

**Modals:**
- ApplyModal.jsx
- ApplyManualJob.jsx
- HiredJob.jsx
- EditAppliedModal.jsx
- MarkAsReplyModal.jsx
- MarkAsInterviewModal.jsx
- MarkAsNotHiredModal.jsx
- ViewStageDetailsModal.jsx
- AddPortfolioModal.jsx
- EditPortfolioModal.jsx
- MediaGalleryModal.jsx
- AttachmentPreviewModal.jsx
- AttachmentViewerModal.jsx
- ConfirmModal.jsx
- ConfirmUserBlock.jsx
- ConnectCostModal.jsx
- ViewUser.jsx

---

### Phase 6: State Management & Context (Day 20)

**Goal:** Set up Redux and Context providers

#### Redux Setup

**Migrate:**
- `client/src/app/store.js` → `next-app/lib/store/store.ts`
- `client/src/features/auth/authSlice.js` → `next-app/lib/store/slices/authSlice.ts`

**Create:**
```typescript
// next-app/lib/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth']
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```typescript
// next-app/lib/store/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

#### Context Providers

**Migrate:**
- `client/src/context/SocketContext.jsx` → `next-app/lib/socket/SocketContext.tsx`
- `client/src/context/NotificationContext.jsx` → `next-app/context/NotificationContext.tsx`

**Create root providers:**
```typescript
// next-app/context/Providers.tsx
'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/lib/store/store';
import { SocketProvider } from '@/lib/socket/SocketContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SocketProvider>
          <NotificationProvider>
            {children}
            <ToastContainer position="top-center" autoClose={3000} />
          </NotificationProvider>
        </SocketProvider>
      </PersistGate>
    </Provider>
  );
}
```

**Update root layout:**
```typescript
// next-app/app/layout.tsx
import { Providers } from '@/context/Providers';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

### Phase 7: Middleware & Authentication (Day 21)

**Goal:** Set up route protection

**Create `next-app/middleware.ts`:**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // Public paths
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.includes(path);

  // If on public path and logged in, redirect to dashboard
  if (isPublicPath && token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
        role: string;
      };

      if (decoded.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // Invalid token, allow to proceed to login
    }
  }

  // If on protected path and not logged in, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Admin-only paths
  const adminPaths = ['/admin'];
  const isAdminPath = adminPaths.some(p => path.startsWith(p));

  if (isAdminPath && token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
        role: string;
      };

      if (decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
```

---

### Phase 8: Styling & Assets (Day 22)

**Goal:** Migrate all styles and static assets

**Tasks:**

1. **Copy Tailwind config**
   ```bash
   cp client/tailwind.config.js next-app/tailwind.config.js
   ```

   Update content paths:
   ```javascript
   module.exports = {
     content: [
       './app/**/*.{js,ts,jsx,tsx,mdx}',
       './components/**/*.{js,ts,jsx,tsx,mdx}',
     ],
     // ... rest of config
   }
   ```

2. **Copy global CSS**
   ```bash
   cp client/src/App.css next-app/app/globals.css
   ```

3. **Copy public assets**
   ```bash
   cp -r client/public/* next-app/public/
   ```

4. **Create uploads directory**
   ```bash
   mkdir -p next-app/uploads/attachments
   cp -r server/uploads/* next-app/uploads/
   ```

---

### Phase 9: Environment Variables (Day 22)

**Create `next-app/.env.local`:**
```env
# Database
MYSQL_DB_NAME=kodion_bidding
MYSQL_DB_USER=kodion_bidding
MYSQL_DB_PASSWORD=godaddy.Kodion@2025
MYSQL_DB_HOST=118.139.180.250
MYSQL_DB_PORT=3306

# JWT
SECRET_KEY=your_jwt_secret_key_here

# App
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# For production
# NODE_ENV=production
# NEXT_PUBLIC_APP_URL=https://your-app.railway.app
```

**Create `next-app/.env.example`:**
```env
MYSQL_DB_NAME=
MYSQL_DB_USER=
MYSQL_DB_PASSWORD=
MYSQL_DB_HOST=
MYSQL_DB_PORT=

SECRET_KEY=

NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Phase 10: Testing & Debugging (Days 23-25)

**Day 23: Unit Testing**

**Test checklist:**
- [ ] Database connection
- [ ] All 19 models load correctly
- [ ] Model associations work
- [ ] Auth API routes (login, register, logout)
- [ ] JWT generation and verification
- [ ] Cookie setting and reading

**Day 24: Integration Testing**

**Test checklist:**
- [ ] Complete login flow
- [ ] Complete registration flow
- [ ] Role-based routing (admin vs user)
- [ ] Job operations (view, apply, hire, ignore)
- [ ] File uploads and retrieval
- [ ] Socket.io connection
- [ ] Real-time notifications
- [ ] All CRUD operations
- [ ] Filters and search
- [ ] Pagination
- [ ] Form validations

**Day 25: UI/UX Testing**

**Test checklist:**
- [ ] All pages render correctly
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] All modals work
- [ ] Toast notifications appear
- [ ] Loading states display
- [ ] Error states display
- [ ] Charts render (Recharts)
- [ ] Date pickers work
- [ ] File upload previews work
- [ ] Sidebar navigation
- [ ] Header notifications

**Browser testing:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

---

### Phase 11: Deployment Preparation (Day 26)

**Tasks:**

1. **Update package.json scripts**
   ```json
   {
     "scripts": {
       "dev": "node server.js",
       "build": "next build",
       "start": "NODE_ENV=production node server.js",
       "lint": "next lint"
     }
   }
   ```

2. **Create deployment config for Railway**

   **Create `railway.json`:**
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run build && npm start",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

3. **Create `.dockerignore`**
   ```
   node_modules
   .next
   .git
   .env.local
   ```

4. **Update Next.js config**
   ```typescript
   // next-app/next.config.ts
   import type { NextConfig } from 'next';

   const nextConfig: NextConfig = {
     images: {
       remotePatterns: [
         {
           protocol: 'https',
           hostname: '**',
         },
       ],
     },
     // Enable standalone output for Docker/Railway
     output: 'standalone',
   };

   export default nextConfig;
   ```

5. **Test production build locally**
   ```bash
   npm run build
   npm start
   ```

---

### Phase 12: Deployment (Days 27-28)

**Day 27: Deploy to Railway**

**Steps:**

1. **Create Railway account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create new project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository
   - Select `next-app` directory as root

3. **Add environment variables**
   - Go to project settings → Variables
   - Add all variables from `.env.example`

4. **Deploy**
   - Railway will auto-detect Next.js
   - Build and deploy automatically
   - Get deployment URL

5. **Set up custom domain (optional)**
   - Go to Settings → Domains
   - Add custom domain
   - Update DNS records

**Day 28: Post-Deployment Testing**

**Test checklist:**
- [ ] App loads on production URL
- [ ] Login works
- [ ] Registration works
- [ ] Database connection works
- [ ] File uploads work
- [ ] Socket.io connects
- [ ] Real-time notifications work
- [ ] All API endpoints respond
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Performance acceptable (< 3s page load)

**Monitor:**
- [ ] Railway logs for errors
- [ ] Database connections
- [ ] Socket.io connections
- [ ] Memory usage
- [ ] CPU usage

---

## Environment Variables Summary

### Development (.env.local)
```env
MYSQL_DB_NAME=kodion_bidding
MYSQL_DB_USER=kodion_bidding
MYSQL_DB_PASSWORD=godaddy.Kodion@2025
MYSQL_DB_HOST=118.139.180.250
MYSQL_DB_PORT=3306
SECRET_KEY=your_jwt_secret
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production (Railway)
```env
MYSQL_DB_NAME=kodion_bidding
MYSQL_DB_USER=kodion_bidding
MYSQL_DB_PASSWORD=godaddy.Kodion@2025
MYSQL_DB_HOST=118.139.180.250
MYSQL_DB_PORT=3306
SECRET_KEY=your_jwt_secret
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
```

---

## Key Conversion Patterns

### 1. React Router → Next.js Navigation

**Before:**
```javascript
import { useNavigate, useParams } from 'react-router-dom';

const navigate = useNavigate();
navigate('/dashboard');

const { userId } = useParams();
```

**After:**
```typescript
'use client';
import { useRouter, useParams } from 'next/navigation';

const router = useRouter();
router.push('/dashboard');

const { userId } = useParams();
```

### 2. Environment Variables

**Before (Vite):**
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

**After (Next.js):**
```typescript
const apiUrl = process.env.NEXT_PUBLIC_APP_URL;
```

### 3. API Calls

**Before (to external backend):**
```javascript
axios.get('http://localhost:5000/api/jobs', {
  headers: { Authorization: `Bearer ${token}` }
});
```

**After (to Next.js API routes):**
```typescript
axios.get('/api/jobs', {
  withCredentials: true // Uses cookie automatically
});
```

### 4. Express Route → Next.js API Route

**Before (Express):**
```javascript
// server/routes/jobRoute.js
router.get('/get-jobs', jobController.getJobs);

// server/controller/jobController.js
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

**After (Next.js):**
```typescript
// next-app/app/api/jobs/get-jobs/route.ts
import { NextResponse } from 'next/server';
import { Job } from '@/lib/db/models';

export async function GET() {
  try {
    const jobs = await Job.findAll();
    return NextResponse.json(jobs);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
```

### 5. Socket.io Emit (from API)

**Before (Express):**
```javascript
req.io.to(`user_${userId}`).emit('notification', data);
```

**After (Next.js):**
```typescript
import { emitToUser } from '@/lib/socket';

emitToUser(userId, 'notification', data);
```

### 6. File Upload

**Before (Express + Multer):**
```javascript
const upload = multer({ dest: 'uploads/attachments/' });
router.post('/upload', upload.array('files'), controller.upload);
```

**After (Next.js API route):**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll('files') as File[];

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = path.join(
      process.cwd(),
      'uploads',
      'attachments',
      file.name
    );
    await writeFile(filepath, buffer);
  }

  return NextResponse.json({ success: true });
}
```

---

## Deployment Options Comparison

| Platform | Socket.io | File Uploads | Cost | Setup | Recommendation |
|----------|-----------|--------------|------|-------|----------------|
| **Railway** | ✅ Yes | ✅ Yes (persistent volume) | $5/mo | Easy | ⭐ **Best Choice** |
| **Render** | ✅ Yes | ✅ Yes (persistent disk) | Free tier available | Easy | Good for testing |
| **Vercel** | ❌ No | ❌ No (serverless) | Free | Very easy | ❌ Won't work |
| **EC2** | ✅ Yes | ✅ Yes | Already paid | Manual | Use if already set up |
| **DigitalOcean** | ✅ Yes | ✅ Yes | $5/mo | Medium | Good alternative |

---

## Risk Mitigation

### Risk 1: Database Connection Pooling
**Issue:** Sequelize connection pool in serverless (if deployed to Vercel)

**Solution:** Use custom server (Express) with connection pooling

### Risk 2: Socket.io Disconnections
**Issue:** Users lose Socket.io connection

**Solution:**
- Implement auto-reconnect logic
- Show connection status to user
- Queue notifications if disconnected

### Risk 3: File Upload Path Issues
**Issue:** Uploaded files not accessible

**Solution:**
- Use absolute paths
- Create uploads directory in production
- Or migrate to S3/Cloudinary

### Risk 4: Redux Persist Hydration
**Issue:** State mismatch between server and client

**Solution:**
- Use `suppressHydrationWarning` on html/body
- Wrap auth-dependent components in client-only wrapper

### Risk 5: CORS Issues
**Issue:** API requests blocked by CORS

**Solution:**
- Configure CORS in custom server
- Set credentials: true
- Match origin domains

---

## Success Criteria

### Functionality ✅
- [ ] All 32+ routes accessible
- [ ] Authentication works (login, register, logout)
- [ ] Role-based access (admin vs user)
- [ ] All CRUD operations work
- [ ] File uploads work
- [ ] Real-time notifications work
- [ ] Socket.io connections stable
- [ ] Filters and search work
- [ ] Pagination works
- [ ] All forms validate correctly

### Design ✅
- [ ] Identical UI to current app
- [ ] All Tailwind styles applied
- [ ] Responsive on all devices
- [ ] All colors match
- [ ] All fonts match
- [ ] All spacing identical
- [ ] Modals styled correctly
- [ ] Charts render correctly

### Performance ✅
- [ ] Page load < 3 seconds
- [ ] API response < 500ms
- [ ] Socket.io latency < 100ms
- [ ] No memory leaks
- [ ] Efficient database queries

### Security ✅
- [ ] JWT tokens secure
- [ ] Passwords hashed (bcrypt)
- [ ] CORS configured correctly
- [ ] XSS protection
- [ ] SQL injection protection
- [ ] File upload validation

---

## Post-Migration Cleanup

After successful deployment and testing:

1. **Archive old code**
   ```bash
   mkdir archive
   mv client archive/client-old
   mv server archive/server-old
   mv next-client archive/next-client-old
   ```

2. **Update README.md**
   - Document new structure
   - Update setup instructions
   - Update deployment instructions

3. **Set up monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Uptime monitoring

4. **Optimize**
   - Enable Next.js Image optimization
   - Add caching headers
   - Optimize database queries
   - Add indexes to database

---

## Timeline Summary

| Phase | Days | Tasks |
|-------|------|-------|
| **Phase 0** | 1 | Project setup |
| **Phase 1** | 2-3 | Database migration |
| **Phase 2** | 4-8 | API routes migration |
| **Phase 3** | 9 | Socket.io setup |
| **Phase 4** | 10-16 | Pages migration |
| **Phase 5** | 17-19 | Components migration |
| **Phase 6** | 20 | State management |
| **Phase 7** | 21 | Middleware & auth |
| **Phase 8** | 22 | Styling & assets |
| **Phase 9** | 22 | Environment config |
| **Phase 10** | 23-25 | Testing |
| **Phase 11** | 26 | Deployment prep |
| **Phase 12** | 27-28 | Deployment |

**Total:** 28 days (4 weeks) for 1 developer
**Total:** 14-21 days (2-3 weeks) for 2 developers

---

## Daily Checklist Template

For each development day, follow this checklist:

**Morning:**
- [ ] Pull latest code
- [ ] Review yesterday's work
- [ ] Plan today's tasks
- [ ] Set up test environment

**During Development:**
- [ ] Write code following patterns in this plan
- [ ] Test each feature after implementation
- [ ] Commit frequently with clear messages
- [ ] Document any issues or blockers

**Evening:**
- [ ] Test all changes
- [ ] Push code to repository
- [ ] Update project board
- [ ] Note any blockers for tomorrow

---

## Support & Resources

**Documentation:**
- Next.js Docs: https://nextjs.org/docs
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Socket.io Docs: https://socket.io/docs/v4/
- Sequelize Docs: https://sequelize.org/docs/v6/
- Railway Docs: https://docs.railway.app/

**Common Issues & Solutions:**
- [Next.js GitHub Issues](https://github.com/vercel/next.js/issues)
- [Socket.io with Next.js Guide](https://socket.io/how-to/use-with-nextjs)
- [Redux with Next.js Guide](https://redux.js.org/usage/nextjs)

---

## Final Notes

**This migration plan ensures:**
1. ✅ Zero functionality loss
2. ✅ Zero design changes
3. ✅ Zero breaking code
4. ✅ Full Next.js migration
5. ✅ Socket.io support
6. ✅ File upload support
7. ✅ Production-ready deployment

**Deployment:** Railway (NOT Vercel due to Socket.io requirement)

**Team Communication:** Share this plan with your team. Emphasize that deploying to Railway instead of Vercel is NOT a limitation—it's the ONLY way to preserve all functionality, especially real-time notifications.

---

## Quick Start Commands

```bash
# 1. Create Next.js project
cd d:\bidding-tracking
npx create-next-app@latest next-app --typescript --tailwind --app

# 2. Install dependencies
cd next-app
npm install express socket.io sequelize mysql2 bcryptjs jsonwebtoken
npm install @reduxjs/toolkit react-redux redux-persist
npm install axios formik yup react-modal react-toastify

# 3. Copy server.js from this plan

# 4. Start development
npm run dev

# 5. Build for production
npm run build

# 6. Start production
npm start
```

---

**Ready to start? Begin with Phase 0 on Day 1!**

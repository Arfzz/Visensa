# Visensa Backend — REST API

Express.js backend for the Visensa Rehabilitation Platform. Built with a clean **Layered Architecture** (Routes → Controller → Service → DB) to allow plugging in Supabase without touching the HTTP layer.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Express.js |
| Validation | Zod |
| Auth | JWT (jsonwebtoken) |
| Security | Helmet, CORS |
| Logging | Morgan |
| Performance | Compression |
| Database *(pending)* | Supabase (PostgreSQL) |

## Folder Structure

```
backend/
├── src/
│   ├── server.js              # Entry point & graceful shutdown
│   ├── app.js                 # Express app + middleware setup
│   ├── routes/
│   │   ├── index.js           # Mount all resource routes at /api/v1
│   │   ├── auth.routes.js
│   │   ├── patient.routes.js
│   │   └── session.routes.js
│   ├── controllers/           # HTTP layer — no business logic here
│   │   ├── auth.controller.js
│   │   ├── patient.controller.js
│   │   └── session.controller.js
│   ├── services/              # Business logic + DB calls (stubbed for now)
│   │   ├── auth.service.js
│   │   ├── patient.service.js
│   │   └── session.service.js
│   ├── middlewares/
│   │   ├── authenticate.js    # JWT verify + generateAccessToken/RefreshToken
│   │   ├── authorize.js       # Role-based access control (ROLES.DOCTOR / ROLES.PATIENT)
│   │   ├── validate.js        # Zod schema validation middleware factory
│   │   ├── responseFormatter.js  # Attaches res.ok / res.created / res.paginate
│   │   └── errorHandler.js    # Global error handler + 404 handler
│   ├── validations/           # Zod schemas
│   │   ├── auth.schema.js
│   │   ├── patient.schema.js
│   │   └── session.schema.js
│   └── utils/
│       ├── AppError.js        # Custom operational error class
│       ├── responseHelper.js  # sendSuccess / sendError / sendPaginated
│       ├── pagination.js      # parsePagination / parseSort
│       └── dateFormatter.js   # formatToLocale / formatToISO / unixNow
├── docs/
│   └── visensa_api.postman_collection.json
├── .env                       # Local env (not committed)
├── .env.example               # Template for new devs
└── package.json
```

## Getting Started

```bash
# Install dependencies
npm install

# Copy & fill in environment variables
cp .env.example .env

# Start dev server (with auto-reload)
npm run dev

# Start production server
npm start
```

## API Endpoints

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/health` | ❌ | — | Server health check |
| POST | `/api/v1/auth/register` | ❌ | — | Register new user |
| POST | `/api/v1/auth/login` | ❌ | — | Login |
| POST | `/api/v1/auth/refresh` | ❌ | — | Refresh access token |
| GET | `/api/v1/auth/me` | ✅ | Any | Get current user |
| GET | `/api/v1/patients` | ✅ | Doctor | List all patients |
| GET | `/api/v1/patients/me` | ✅ | Patient | Get own profile |
| PATCH | `/api/v1/patients/me` | ✅ | Patient | Update own profile |
| GET | `/api/v1/patients/:id` | ✅ | Doctor | Get patient by ID |
| POST | `/api/v1/sessions` | ✅ | Patient | Log a session |
| GET | `/api/v1/sessions/me` | ✅ | Patient | My session history |
| GET | `/api/v1/sessions` | ✅ | Doctor | All sessions |
| GET | `/api/v1/sessions/:id` | ✅ | Doctor/Patient | Session detail |

## Standard Response Format

```json
{
  "success": true,
  "message": "Patients retrieved.",
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

## Supabase Integration (Next Step)

All `services/*.service.js` files contain `// TODO: Supabase query` comments.
When Supabase is ready, install the client and replace mock data:

```bash
npm install @supabase/supabase-js
```

Then fill in `.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

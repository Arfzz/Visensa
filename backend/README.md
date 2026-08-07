# Visensa Backend — REST API (Supabase Integrated)

Express.js backend for the Visensa Rehabilitation Platform. 
Fully integrated with **Supabase Auth** and **PostgreSQL**.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Express.js |
| Validation | Zod |
| Database / Auth | Supabase (`@supabase/supabase-js`) |
| Security | Helmet, CORS |
| Logging | Morgan |
| Performance | Compression |

## Folder Structure

```
backend/
├── src/
│   ├── server.js              # Entry point & graceful shutdown
│   ├── app.js                 # Express app + middleware setup
│   ├── config/
│   │   └── supabase.js        # Supabase client setup (using Service Role Key)
│   ├── routes/
│   │   ├── index.js           # Mount all resource routes at /api/v1
│   │   ├── auth.routes.js
│   │   ├── patient.routes.js
│   │   ├── session.routes.js  # Exercise & Minigame routes
│   │   └── dashboard.routes.js# Dashboard Stats routes
│   ├── controllers/           # HTTP layer
│   │   ├── auth.controller.js
│   │   ├── patient.controller.js
│   │   ├── session.controller.js
│   │   └── dashboard.controller.js
│   ├── services/              # Business logic + Supabase Queries
│   │   ├── auth.service.js
│   │   ├── patient.service.js
│   │   ├── session.service.js
│   │   └── dashboard.service.js
│   ├── middlewares/
│   │   ├── authenticate.js    # Supabase JWT verify + Role Injection
│   │   ├── authorize.js       # Role-based access control (ROLES.DOCTOR / ROLES.PATIENT)
│   │   ├── validate.js        # Zod schema validation
│   │   ├── responseFormatter.js
│   │   └── errorHandler.js
│   ├── validations/           # Zod schemas
│   │   ├── auth.schema.js
│   │   ├── patient.schema.js
│   │   └── session.schema.js
│   └── utils/
│       ├── AppError.js        
│       ├── responseHelper.js  
│       ├── pagination.js      
│       └── dateFormatter.js   
├── docs/
│   └── visensa_api.postman_collection.json
├── .env                       # Local env (not committed)
├── .env.example               
└── package.json
```

## Setup & Run

```bash
# Install dependencies
npm install

# Copy & fill in environment variables
# You MUST fill SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
cp .env.example .env

# Start dev server (with auto-reload)
npm run dev
```

## API Endpoints

### 🔐 Authentication (`/api/v1/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Register a new user |
| POST | `/login` | ❌ | Login with email and password |
| POST | `/refresh` | ❌ | Refresh access token |
| GET  | `/me` | ✅ | Get current authenticated user |

### 🧑‍⚕️ Patients (`/api/v1/patients`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET   | `/` | ✅ | Doctor | List all patients managed by this doctor |
| GET   | `/me` | ✅ | Patient | Get own profile |
| PATCH | `/me` | ✅ | Patient | Update own profile (name, condition, notes) |
| GET   | `/:id` | ✅ | Doctor | Get patient by ID |

### 🏋️ Sessions (`/api/v1/sessions`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/exercise` | ✅ | Patient | Log a completed exercise session |
| GET  | `/exercise/me` | ✅ | Patient | View own exercise history |
| GET  | `/exercise` | ✅ | Doctor | View all exercise logs |
| GET  | `/exercise/:id` | ✅ | Doctor/Patient | View single exercise log |
| POST | `/minigame` | ✅ | Patient | Log a completed Piano Tiles minigame session |
| GET  | `/minigame/me` | ✅ | Patient | View own minigame history |
| GET  | `/stats/me` | ✅ | Patient | Get own gamification stats & trends (Same as dashboard stats/me) |

### 📊 Dashboard (`/api/v1/dashboard`)
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/` | ✅ | Doctor | Summary stats (total patients, active, exercises, minigames, recent logs) |
| GET | `/patients/:patientId` | ✅ | Doctor | Drill-down detail for a specific patient |
| GET | `/stats/me` | ✅ | Patient | Own aggregated exercise stats and trends |

## Notes on Schema Mapping
- The `authenticate.js` middleware parses the Supabase JWT. It then queries the `doctor` and `patient` tables to determine the user's role and attaches the specific table Primary Key (UUID) to `req.user.profile.id`.
- Most operations use `req.user.profile.id` (table PK) rather than `req.user.id` (auth user UUID) for reliable relational queries.

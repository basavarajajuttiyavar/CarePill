# Family Medicine Tracker

Full-stack build matching the PRD, TRD, and DB schema you provided:
- **frontend/** — React + Vite + Tailwind, matching the 4 mockup screens (Dashboard, Family Members, Add Family Member, Member Profile) plus a working Login and Emergency Card screen.
- **backend/** — Node.js + Express + PostgreSQL API implementing the endpoints from the TRD (Section 4), with the exact table structure from `medication_tracker_database_tables.pdf`.

## Quick start

### 1. Database
```bash
createdb family_medicine_tracker
cd backend
cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET
npm install
npm run migrate             # runs sql/schema.sql
npm run seed                # optional: loads the Sharma Family sample data
```
Note: `sql/seed.sql` ships with a placeholder `password_hash`. Before logging in with the seeded account, replace it with a real bcrypt hash (e.g. `node -e "console.log(require('bcrypt').hashSync('password123', 10))"`) or just register a fresh account via `POST /auth/register`.

### 2. Backend API
```bash
cd backend
npm run dev        # starts on http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env        # points VITE_API_URL at the backend
npm run dev         # starts on http://localhost:5173
```

Register an account (or log in with your seeded one), then the app behaves like the mockups: Dashboard → Family Members → Add Family Member → Member Profile → Emergency Card.

## What's implemented vs. stubbed

| Area | Status |
|---|---|
| Auth (register/login/JWT) | Implemented |
| Family + FamilyMember CRUD | Implemented |
| Medicines CRUD + dose logging | Implemented |
| Doctors directory | Implemented |
| Dashboard "today" view | Implemented |
| Emergency Card + 24h shareable link | Implemented (share tokens are in-memory — swap for a DB table before production) |
| Analytics endpoint | Implemented (basic most-used / by-doctor queries) |
| Medicines / Today / History / Doctors / Settings **pages** | Left as placeholders — only the 4 screens you sent mockups for were fully built out. The API endpoints they'd need already exist (see table above); wire the pages the same way `Members.jsx` and `MemberProfile.jsx` do |
| Prescriptions, Lab Reports, OCR, reminders, multi-language | Not built — these are the PRD's Phase 6–8 stretch items |

## Project structure
```
family-medicine-tracker/
├── backend/
│   ├── sql/schema.sql       # exact tables from the DB PDF
│   ├── sql/seed.sql         # sample Sharma Family data
│   └── src/
│       ├── index.js         # Express app
│       ├── db.js            # Postgres pool
│       ├── middleware/auth.js
│       └── routes/          # auth, family, medicines, doctors, dashboard
└── frontend/
    └── src/
        ├── api.js           # fetch client for the backend
        ├── components/      # Sidebar, TopBar, Avatar, StatCard, Layout
        └── pages/           # Login, Dashboard, Members, AddMember, MemberProfile, EmergencyCard
```

## Security notes carried over from the TRD
- Every query is scoped by `family_id`, derived from the JWT — never from a client-supplied parameter.
- Passwords are hashed with bcrypt.
- Emergency Card share links use a random (non-sequential) token and expire after 24 hours; generation is logged to `ActivityLog`.
- `Medicine.member_id` is `NOT NULL` with a foreign key — a medicine can't exist without an owner.

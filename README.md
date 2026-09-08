# Family Medicine Tracker

Full-stack build matching the PRD, TRD, and DB schema you provided:
- **frontend/** — React + Vite + Tailwind, matching all 8 mockup screens (Dashboard, Family Members, Add Family Member, Member Profile, Add Medicine, Medicine Profile, History, Today) plus Doctors, Settings, Login, and Emergency Card screens.
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
        └── pages/           # Login, Dashboard, Members, AddMember, MemberProfile, AddMedicine, MedicineProfile, Medicines, Today, History, Doctors, EmergencyCard, Settings
```



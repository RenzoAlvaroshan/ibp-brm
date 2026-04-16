# BRM — Business Requirement Management App

A full-stack production-ready MVP for managing business requirements, inspired by ClickUp's UI. Built with React + Go + PostgreSQL.

---

## Features

- **Role-based access control** — Admin, Editor, Viewer
- **Requirements CRUD** — full lifecycle from draft to approved/rejected
- **Kanban board** — drag-and-drop between status columns (dnd-kit)
- **List view** — filterable, sortable table with inline status updates
- **Dashboard** — live metric cards, bar chart, donut chart, activity feed
- **Comments & activity log** — per-requirement threaded comments + timeline
- **Tags** — color-coded tags assignable to requirements
- **Export** — CSV export of filtered requirements; PDF per requirement
- **Notifications** — in-app bell panel + email on status change
- **JWT auth** — access + refresh tokens with auto-refresh

---

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | TypeScript · React 18 · Vite · Tailwind CSS   |
| State      | Zustand · TanStack Query                      |
| Charts     | Recharts                                      |
| DnD        | @dnd-kit/core + @dnd-kit/sortable             |
| Backend    | Go 1.21 · Gin framework                       |
| Database   | PostgreSQL 15 · GORM                          |
| Auth       | JWT (access 15min + refresh 7d)               |
| Email      | Go net/smtp                                   |
| Container  | Docker + Docker Compose                       |

---

## Quick Start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080

### Default credentials (seeded automatically)

| Role   | Email              | Password   |
|--------|--------------------|------------|
| Admin  | admin@brm.app      | admin123   |
| Editor | editor@brm.app     | editor123  |
| Viewer | viewer@brm.app     | viewer123  |

---

## Local Development (without Docker)

### Prerequisites
- Go 1.21+  → https://go.dev/dl/
- Node.js 20+ → https://nodejs.org
- PostgreSQL 15

### Backend

```bash
# Create .env from .env.example
cp .env.example .env

cd backend
go mod tidy          # generates go.sum
go run ./cmd/server
```

The backend starts on `http://localhost:8080` and auto-migrates + seeds the database on first run.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173` and proxies `/api` requests to the backend.

---

## Environment Variables

| Variable             | Default                          | Description                     |
|----------------------|----------------------------------|---------------------------------|
| `DB_HOST`            | `localhost`                      | PostgreSQL host                 |
| `DB_PORT`            | `5432`                           | PostgreSQL port                 |
| `DB_NAME`            | `brmdb`                          | Database name                   |
| `DB_USER`            | `brmuser`                        | Database user                   |
| `DB_PASSWORD`        | `brmpassword`                    | Database password               |
| `JWT_SECRET`         | (required in production)         | Access token signing key        |
| `JWT_REFRESH_SECRET` | (required in production)         | Refresh token signing key       |
| `PORT`               | `8080`                           | Backend port                    |
| `FRONTEND_URL`       | `http://localhost:5173`          | Frontend URL (for CORS)         |
| `ENV`                | `development`                    | `development` or `production`   |
| `SMTP_HOST`          | `smtp.gmail.com`                 | SMTP host for email             |
| `SMTP_PORT`          | `587`                            | SMTP port                       |
| `SMTP_USER`          | *(empty = email disabled)*       | SMTP username                   |
| `SMTP_PASSWORD`      | *(empty = email disabled)*       | SMTP password                   |
| `SMTP_FROM`          | `noreply@brmapp.com`             | Sender address                  |

---

## API Overview

### Auth
```
POST   /api/auth/register
POST   /api/auth/login          → { access_token, refresh_token, user }
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/profile
POST   /api/auth/change-password
```

### Requirements
```
GET    /api/requirements          ?status=&priority=&search=&tag=&assignee=&sort=&dir=&page=&limit=
POST   /api/requirements
GET    /api/requirements/:id
PUT    /api/requirements/:id
PATCH  /api/requirements/:id
DELETE /api/requirements/:id
PATCH  /api/requirements/reorder
GET    /api/requirements/export/csv
GET    /api/requirements/:id/comments
POST   /api/requirements/:id/comments
GET    /api/requirements/:id/activity
```

### Other
```
GET/POST/DELETE  /api/tags
GET/PATCH        /api/users  (admin only)
GET              /api/dashboard/metrics
GET              /api/dashboard/my-requirements
GET/PATCH        /api/notifications
```

---

## Project Structure

```
brm-app/
├── frontend/src/
│   ├── api/           # Axios client + typed endpoints
│   ├── components/
│   │   ├── layout/    # Sidebar, Topbar, AppShell
│   │   └── requirements/ # Badges, UserAvatar, Modal, Panel
│   ├── pages/         # Login, Dashboard, Requirements, Kanban, Tags, Settings
│   ├── store/         # Zustand: auth, ui
│   ├── types/         # Shared TypeScript interfaces
│   └── utils/         # cn, statusConfig, priorityConfig, formatters
│
└── backend/
    ├── cmd/server/    # main.go — entry point, routes
    ├── internal/
    │   ├── auth/      # JWT handlers + helpers
    │   ├── requirements/
    │   ├── comments/
    │   ├── tags/
    │   ├── users/
    │   ├── notifications/
    │   └── dashboard/
    └── pkg/
        ├── config/    # ENV loading
        ├── database/  # GORM setup, models, migrations, seed
        └── middleware/ # CORS, JWT auth, role guard
```

---

## Role Permissions

| Action                | Admin | Editor       | Viewer |
|-----------------------|-------|--------------|--------|
| View requirements     | ✅    | ✅           | ✅     |
| Create requirement    | ✅    | ✅           | ❌     |
| Edit any requirement  | ✅    | own only     | ❌     |
| Delete requirement    | ✅    | own only     | ❌     |
| Change status/priority| ✅    | ✅           | ❌     |
| Manage users/roles    | ✅    | ❌           | ❌     |
| Manage tags           | ✅    | ✅           | ❌     |
| Export CSV/PDF        | ✅    | ✅           | ✅     |

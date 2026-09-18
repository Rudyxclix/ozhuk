# Ozhuk — Civic Canal & Storm-Drain Blockage Reporting Platform

Ozhuk is a civic reporting and infrastructure triage platform for canal and storm-drain blockage management. It connects citizen reports on the ground directly with municipal ward response teams to prevent urban waterlogging, clear drainage bottlenecks, and ensure open water flow.

---

## Architecture Overview

The system is decoupled into two independent services with shared domain contracts:

```
Ozhuk/
├── shared/
│   └── types/
│       └── report.ts          # Shared domain models & DTOs
├── backend/                    # Node.js + Fastify + TypeScript
│   ├── src/
│   │   ├── config/env.ts       # Validated environment configuration (Zod)
│   │   ├── models/Report.ts    # Mongoose Schema (ready for Atlas connection)
│   │   ├── services/           # Service & business logic (in-memory store fallback)
│   │   ├── routes/             # REST API endpoints (reports, wards, health)
│   │   ├── types/              # Type definitions
│   │   └── index.ts            # Fastify server startup & CORS configuration
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/common/  # Reusable UI (Navbar, Footer, Badges, Timeline, Logo)
│   │   ├── pages/              # Citizen, Authority, and Public portal views
│   │   ├── services/api.ts     # Type-safe client for backend REST API
│   │   ├── types/              # Frontend domain interfaces
│   │   ├── index.css           # Tailwind + Material Symbols + typography
│   │   ├── App.tsx             # Root view router
│   │   └── main.tsx            # Application bootstrap
│   ├── tailwind.config.js      # Civic Hydrology design system tokens from Stitch
│   ├── vite.config.ts          # Vite configuration with /api proxy to port 4000
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── stitch_ozhuk_civic_drainage_platform/ # Original Google Stitch export (preserved reference)
├── package.json                # Root convenience scripts
└── README.md
```

---

## Supported Workflows

### 1. Citizen Workflow
```
Photo → Location → Ward → Details → Submit → Ticket → Track
```
- **Photo Evidence:** Capture or upload photo showing the blockage.
- **Location & Ward:** GPS coordinates and automated/manual municipal ward assignment.
- **Details:** Select drainage category (`STORM_DRAIN`, `CANAL`, `CULVERT`), provide landmark and severity.
- **Submit & Ticket:** Generates a unique tracking reference (e.g., `OZH-260916-001`).
- **Track:** Real-time vertical timeline displaying intake, assignment, progress, and resolution.

### 2. Authority Workflow
```
Dashboard → Report → Assign → Status → Escalate → Resolve
```
- **Dashboard:** Incident dispatch grid with KPI summary cards (`Open`, `In Progress`, `Escalated`, `Resolved`), filtered by ward or status.
- **Report Investigation:** 50/50 inspection layout with citizen evidence, resident notes, and GPS coordinates.
- **Assign:** Officer assignment dropdown to dispatch field clearing teams.
- **Status:** Lifecycle transitions (`REPORTED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED`).
- **Escalate:** Explicit escalation action or SLA breach flag for supervisor elevation.
- **Resolve:** Resolution flow with after-clearing verification photo and audit notes.

### 3. Public Workflow
```
Map → Reports → Ticket / Status Lookup
```
- **Map:** Interactive visual map with status-coded markers (Open, In Progress, Escalated, Resolved).
- **Reports:** Public transparency drawer displaying sanitized incident data (reporter privacy strictly preserved).
- **Direct Lookup:** Quick ticket search input for citizens to verify report status instantly.

---

## Design System: "Civic Hydrology"

The visual interface faithfully implements the Stitch design tokens:
- **Palette:** Deep Riparian Teal (`#002028` / `#0A3641`), Forest Conduit Green (`#376757` / `#1B4D3E`), Fresh Moss (`#2A9D8F`), and Crisp Surface Layers (`#F9F9FF`, `#FFFFFF`, `#F0F3FF`).
- **Alert Tones:** Escalation / Breach Red (`#BA1A1A` / `#FFDAD6`).
- **Typography:** Display & Headlines in `Plus Jakarta Sans`, Body & Data in `Inter`.
- **Iconography:** Google `Material Symbols Outlined`.

---

## REST API Endpoints

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health and uptime |
| `GET` | `/api/reports` | List reports (supports `?ward=`, `?status=`, `?severity=`) |
| `GET` | `/api/reports/stats` | Summary KPI counts for dashboard |
| `GET` | `/api/reports/:id` | Single report detail by ID |
| `GET` | `/api/reports/ticket/:ticketId` | Lookup report by public ticket code |
| `POST` | `/api/reports` | Create a new citizen report |
| `PATCH` | `/api/reports/:id/assign` | Assign field officer to report |
| `PATCH` | `/api/reports/:id/status` | Update lifecycle status |
| `POST` | `/api/reports/:id/escalate` | Escalate report to supervisor |
| `POST` | `/api/reports/:id/resolve` | Resolve report with clearance photo |
| `GET` | `/api/wards` | List of municipal wards |
| `GET` | `/api/wards/officers` | List of field officers |

---

## How to Run Locally

### Prerequisites
- Node.js `v20+`
- npm `10+`

### 1. Start the Backend API Server
```bash
# From project root:
npm run dev:backend

# Or directly in backend folder:
cd backend
npm run dev
```
The API server will listen on `http://localhost:4000`.

### 2. Start the Frontend React App
```bash
# From project root:
npm run dev:frontend

# Or directly in frontend folder:
cd frontend
npm run dev
```
The Vite development server will open on `http://localhost:5173`.
All `/api/*` requests from the frontend are automatically proxied to the backend on `http://localhost:4000`.

### 3. Production Build
```bash
# Build both services:
npm run build
```

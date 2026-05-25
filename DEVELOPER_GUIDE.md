# MC HRIS — Developer & IT Guide

> **For:** Developers, IT Staff, System Administrators
>
> **System:** MC Human Resource Information System
>
> **Last Updated:** May 26, 2026

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Environment Setup](#environment-setup)
5. [Docker Deployment](#docker-deployment)
6. [Database Auto-Initialization](#database-auto-initialization)
7. [Batch Scripts Reference](#batch-scripts-reference)
8. [Backup System](#backup-system)
9. [Export System](#export-system)
10. [API Reference](#api-reference)
11. [UAT Testing Checklist](#uat-testing-checklist)
12. [Troubleshooting (Technical)](#troubleshooting-technical)

---

## Architecture Overview

```
Docker Compose
├── PostgreSQL 16       (port 5433 → 5432)
│   └── Auto-initializes schema on first run
├── Backend (Node.js)   (port 5001 → 5000)
│   └── Express API server + seed on startup
└── Frontend (React)    (port 3002 → 80)
    └── Vite-built, served via nginx
```

### Startup Sequence

```
1. PostgreSQL starts → health check passes
2. Docker runs /docker-entrypoint-initdb.d/ scripts (first run only)
   └── 01-init-schema.sh checks if tables exist → loads schema.sql if empty
3. Backend starts (depends_on: postgres healthy)
   └── Runs: node index.js & node scripts/seed-docker.js
   └── seed-docker.js uses ON CONFLICT DO NOTHING (idempotent)
4. Frontend starts (depends_on: backend healthy)
5. System ready at http://localhost:3002
```

---

## Tech Stack

| Layer     | Technology                   |
|-----------|------------------------------|
| Frontend  | React + Vite                 |
| Backend   | Node.js + Express            |
| Database  | PostgreSQL 16                |
| Container | Docker + Docker Compose      |
| Export    | ExcelJS (XLSX generation)    |
| Auth      | JWT (access + refresh tokens)|

---

## Project Structure

```
web-hris/
├── .env                              # PostgreSQL credentials (used by docker-compose)
├── .env.example                      # Template for .env
├── docker-compose.yml                # Full stack orchestration
├── start.bat                         # Start all containers
├── stop.bat                          # Stop all containers
├── backup.bat                        # Manual database backup
├── reset-db.bat                      # Reset DB + reseed demo data
├── backups/                          # All backup .sql files stored here
│
├── backend/
│   ├── .env                          # Backend runtime config (local dev)
│   ├── .env.docker                   # Backend runtime config (Docker)
│   ├── .env.docker.example           # Template for .env.docker
│   ├── index.js                      # Express server entry point
│   ├── Dockerfile                    # Backend container build
│   ├── docker-entrypoint-initdb.d/   # PostgreSQL auto-init
│   │   ├── 01-init-schema.sh         # Init script (checks & loads schema)
│   │   ├── schema.sql                # Full DB schema (structure only)
│   │   └── README.md                 # Internal reference
│   ├── scripts/
│   │   ├── seed.js                   # Demo data seeder (for reset-db.bat)
│   │   └── seed-docker.js            # Idempotent seeder (runs on every Docker start)
│   ├── src/
│   │   ├── controllers/              # Route handlers
│   │   ├── routes/                   # API route definitions
│   │   ├── middlewares/              # Auth, authorization, etc.
│   │   ├── utils/                    # Utilities (backupUtils, excelExportUtil, etc.)
│   │   └── constants/                # Role constants, etc.
│   └── uploads/                      # Uploaded files (persisted via Docker volume)
│
└── frontend/
    ├── Dockerfile                    # Frontend container build
    ├── src/                          # React source code
    └── ...
```

---

## Environment Setup

### Root `.env` (PostgreSQL — used by docker-compose)

```env
POSTGRES_DB=hris_db
POSTGRES_USER=hris_user
POSTGRES_PASSWORD=<your_password>
```

### Backend `.env.docker` (Backend runtime in Docker)

Copy from `backend/.env.docker.example` and fill in:
- Database connection details
- JWT secret
- Other backend configuration

### Backend `.env` (Local development without Docker)

Copy from `backend/.env.example` and configure for local PostgreSQL connection.

### First-Time Setup on a New Machine

1. Copy `.env.example` → `.env` and fill in credentials
2. Copy `backend/.env.docker.example` → `backend/.env.docker` and fill in config
3. Run `start.bat` or `docker compose up -d --build`
4. Wait 30–60 seconds for initialization
5. Access at http://localhost:3002

---

## Docker Deployment

### Service Details

| Service    | Container Name   | Host Port | Internal Port | Health Check                |
|------------|------------------|-----------|---------------|-----------------------------|
| PostgreSQL | `hris_postgres`  | 5433      | 5432          | `pg_isready`                |
| Backend    | `hris_backend`   | 5001      | 5000          | `wget http://localhost:5000/health` |
| Frontend   | `hris_frontend`  | 3002      | 80            | `wget http://localhost`     |

### Useful Docker Commands

```bash
# Start everything
docker compose up -d --build

# Stop everything (keeps data)
docker compose down

# Stop and DELETE all data (fresh start)
docker compose down -v

# View logs
docker compose logs
docker compose logs postgres
docker compose logs backend

# Check running containers
docker compose ps

# Restart a single service
docker compose restart backend

# Access PostgreSQL console
docker exec -it hris_postgres psql -U hris_user -d hris_db

# Check database readiness
docker exec hris_postgres pg_isready -U hris_user -d hris_db

# List all tables
docker exec hris_postgres psql -U hris_user -d hris_db -c "\dt"
```

### Data Persistence

- **Database data** is stored in a Docker volume (`postgres_data`) — survives container restarts
- **Uploaded files** are mounted from `backend/uploads/` — survives container restarts
- Running `docker compose down` preserves data
- Running `docker compose down -v` **DESTROYS** all database data

---

## Database Auto-Initialization

### How It Works

The database schema is automatically created on first Docker startup:

1. PostgreSQL container detects `/docker-entrypoint-initdb.d/` directory
2. Runs `01-init-schema.sh` (alphabetically first)
3. Script checks if `employees` table exists
   - If **NOT found**: loads `schema.sql` (full schema creation)
   - If **found**: skips (idempotent — safe to restart)
4. Backend connects to initialized database

### Schema File

`backend/docker-entrypoint-initdb.d/schema.sql` contains:
- All table definitions (`CREATE TABLE IF NOT EXISTS`)
- Constraints, triggers, and functions
- Foreign key relationships
- Indexed sequences and defaults
- **No data** — structure only

### Modifying the Schema

1. Edit `backend/docker-entrypoint-initdb.d/schema.sql`
2. For a fresh environment: `docker compose down -v && docker compose up -d --build`
3. For an existing volume (without data loss):
   ```bash
   docker compose exec postgres psql -U hris_user -d hris_db -f /docker-entrypoint-initdb.d/schema.sql
   ```

---

## Batch Scripts Reference

| Script         | Purpose                                           | What It Does                                          |
|----------------|---------------------------------------------------|-------------------------------------------------------|
| `start.bat`    | Start the full system                             | Runs `docker compose up -d --build`, opens browser    |
| `stop.bat`     | Stop the full system                              | Runs `docker compose down` (keeps data)               |
| `backup.bat`   | Create a manual database backup                   | Runs `pg_dump` inside container, saves to `backups/`  |
| `reset-db.bat` | Reset database to demo data                       | Starts postgres, runs `npm run db:reset-seed` in backend |

### Backup File Format

```
hris_backup_YYYY-MM-DD_HHmmss_DayName.sql
```

Example: `hris_backup_2026-05-25_143015_Monday.sql`

### Backup Metadata

Each backup has a companion `.meta.json` file:

```json
{
  "filename": "hris_backup_2026-05-25_143015_Monday.sql",
  "timestamp": "2026-05-25T14:30:15.123Z",
  "readableTimestamp": "Sunday, May 25, 2026, 2:30:15 PM",
  "context": "manual",
  "description": "",
  "backupSize": 5242880,
  "backupSizeFormatted": "5 MB",
  "status": "completed",
  "completedAt": "2026-05-25T14:30:25.456Z"
}
```

### Backup Context Types

| Context      | Description                        | Triggered By        |
|--------------|------------------------------------|---------------------|
| `manual`     | User-initiated backup              | `backup.bat`        |
| `reset`      | Backup before database reset       | `reset-db.bat`      |

### Backup Utilities Module

**File:** `backend/src/utils/backupUtils.js`

Key functions:
- `getBackupsDirectory()` — Returns centralized backups folder path
- `generateBackupFilename()` — Creates standardized filename
- `createBackupMetadata()` / `updateBackupMetadata()` — Manages .meta.json files
- `listBackups(limit)` — Lists all backups sorted by date
- `cleanupOldBackups(keep)` — Auto-deletes backups beyond the retention limit (default: 15)
- `addBackupHeader()` — Adds SQL comment header with context info

---

## Export System

**File:** `backend/src/utils/excelExportUtil.js`

### Overview

The export system generates Excel (XLSX) files containing comprehensive Personal Data Sheet (PDS) information from 17+ related database tables.

### Key Functions

| Function                       | Purpose                                          |
|--------------------------------|--------------------------------------------------|
| `generateExcelFile()`          | Main function — builds XLSX from employee data   |
| `enrichEmployeeDataWithPDS()`  | Fetches all PDS data from related tables         |
| `buildFilterQuery()`           | Constructs SQL with filters and joins            |
| `extractName()`                | Converts JSONB name objects to readable strings  |
| `extractAddress()`             | Converts JSONB address objects to formatted text |
| `formatPHDate()`               | Formats dates as MM/DD/YYYY (Asia/Manila)        |

### Database Tables Used

employees, personal_data, employment_data, family_background, childrens, educational_qualifications, education_majors, education_minors, education_honors, education_scholarships, examinations_taken, training_programs, employment_history, other_information, employee_references, positions, designations

### Export Column Groups (50+ columns)

1. **Basic Info** (5): Employee No, Name fields
2. **Personal Data** (9): Sex, DOB, Civil Status, Address, Contact, etc.
3. **Employment** (10): Type, Status, Position Name, Designation Name, Salary, etc.
4. **Government IDs** (5): SSS, PAG-IBIG, TIN, PhilHealth, PERAA
5. **Family** (6): Spouse, Children, Nearest Kin
6. **Education** (5): Qualifications, Majors, Minors, Honors, Scholarships
7. **Exams & Training** (2): Aggregated with dates/ratings/hours
8. **Employment History** (1): Aggregated with positions, employers, dates
9. **Other Info** (3): Criminal case, Admin offense, Separation
10. **References** (1): Aggregated names and addresses

### Multi-Value Aggregation

Multiple records in a single cell are separated by `" | "`:
```
Juan (DOB: 01/15/2015) | Maria (DOB: 03/22/2017)
```

### Excel Styling

- Header: Bold white text on blue background (#366092)
- Text wrapping enabled on all data cells
- Column widths auto-adjusted (max 50 characters)
- Two sheets: "Employee PDS Report" + "Summary"

---

## API Reference

### Authentication

All protected endpoints require a JWT token:

```
Authorization: Bearer <jwt_token>
```

### Default Admin Login

```
POST /api/auth/login
Body: { "email": "admin@mabinicolleges.edu", "password": "Admin@2026" }
```

---

### Backup API

**Base URL:** `http://localhost:5001/api/backups`
**Access:** Admin and HR roles

#### GET /api/backups/summary

Returns a summary of recent backups.

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalBackups": 12,
    "latestBackup": {
      "filename": "hris_backup_2026-05-25_143015_Monday.sql",
      "size": "5.2 MB",
      "createdAt": "Sunday, May 25, 2026, 2:30:15 PM",
      "context": "manual"
    },
    "backupsDirectory": "...",
    "recentBackups": [...]
  }
}
```

#### GET /api/backups/list?limit=5

Returns a list of all backups with metadata. Optional `limit` query parameter.

**Response:**
```json
{
  "status": "success",
  "count": 12,
  "data": [
    {
      "filename": "...",
      "size": "5.2 MB",
      "createdAt": "...",
      "metadata": { ... }
    }
  ]
}
```

#### GET /api/backups/download/:filename

Downloads a specific backup file as binary (SQL dump).

**Security:**
- Only filenames matching `hris_backup_*.sql` are allowed
- Directory traversal attempts are blocked

---

### Employee Export API

**Access:** Admin and HR roles

#### GET /api/employees/export

Exports all employees matching filters as XLSX.

**Query Parameters:** `search`, `type`, `status`, `basis`, `sex`, `sort`, `record_status`

**Response:** Binary XLSX file (`employees-pds-report.xlsx`)

#### POST /api/employees/export-selected

Exports selected employees as XLSX.

**Body:**
```json
{ "ids": ["uuid-1", "uuid-2", "uuid-3"] }
```

**Response:** Binary XLSX file

---

### Error Responses

| Status | Meaning              | Example Message                                    |
|--------|----------------------|----------------------------------------------------|
| 400    | Bad Request          | `"Invalid backup filename"` / `"No employees found"` |
| 401    | Unauthorized         | `"Unauthorized"` (missing/invalid token)           |
| 403    | Forbidden            | `"You do not have permission to access this resource"` |
| 404    | Not Found            | `"Backup file not found"`                          |
| 500    | Internal Server Error| `"Failed to retrieve backup summary"`              |

---

## UAT Testing Checklist

Use this checklist when deploying to a new machine or after major changes.

### Pre-check

- [ ] Docker Desktop is installed and running
- [ ] `.env` file exists in project root with PostgreSQL credentials
- [ ] `backend/.env.docker` exists with backend config
- [ ] Run `start.bat` and wait for startup
- [ ] All 3 containers show as "healthy": `docker compose ps`

### Test 1: System Access

- [ ] Open http://localhost:3002 — frontend loads
- [ ] http://localhost:5001/health — returns OK

### Test 2: Authentication

- [ ] Login with default admin credentials
- [ ] Confirm landing on dashboard/protected page
- [ ] Refresh browser — session persists
- [ ] Logout — protected routes blocked

### Test 3: Employee CRUD

- [ ] Create a new employee with required fields
- [ ] Employee appears in list/search
- [ ] Update profile fields — changes persist after refresh
- [ ] Delete/archive employee — state changes correctly

### Test 4: Tabbed Detail Data

- [ ] Add Personal details
- [ ] Add Family and Children data
- [ ] Add Employment data
- [ ] Add Education and Examination data
- [ ] Add Training, History, Other info, and References
- [ ] Reload page — all tab data persists

### Test 5: File Uploads

- [ ] Upload a profile image/document
- [ ] Preview/avatar loads correctly
- [ ] Restart backend: `docker compose restart backend`
- [ ] Uploaded file still accessible (volume persistence)

### Test 6: Dashboard & Reporting

- [ ] Dashboard cards/charts load without API errors
- [ ] Export feature downloads Excel file
- [ ] Downloaded file opens correctly with expected data

### Test 7: Database Persistence

- [ ] Create a marker record (e.g., employee code `UAT-TEST-001`)
- [ ] Run: `docker compose restart postgres`
- [ ] Search for marker record — still exists

### Test 8: Backup & Restore

- [ ] Run `backup.bat` — creates file in `backups/`
- [ ] Backup file size is reasonable (not 0 bytes)
- [ ] `.meta.json` file created alongside backup

### Test 9: Failure Recovery

- [ ] Stop backend: `docker compose stop backend`
- [ ] Refresh frontend — error behavior is user-safe
- [ ] Start backend: `docker compose start backend`
- [ ] App recovers and operations continue

### Exit Criteria

UAT passes when:
1. All test sections pass
2. No container is crash-looping
3. Data persists across service restarts
4. No blocking API or UI errors for HR workflow

---

## Troubleshooting (Technical)

### "Cannot connect to database" on first run

```bash
docker compose ps postgres          # Check if postgres is running
docker compose logs postgres         # Check logs
# Wait longer — first start can take 30+ seconds
```

### "Tables don't exist" error

```bash
docker compose logs postgres | grep "schema\|initialization"
docker exec hris_postgres psql -U hris_user -d hris_db -c "\dt"
```

If tables are missing, force schema reload:
```bash
docker compose down -v
docker compose up -d --build
```

### Backend crashes on startup

```bash
docker compose logs backend          # Check error details
# Usually caused by database not ready yet — check postgres health
docker compose ps                    # All services should be "healthy"
```

### Force complete fresh start

```bash
docker compose down -v               # Removes all data!
docker compose up -d --build          # Rebuild everything
docker compose logs                   # Monitor startup
```

### Manually verify database

```bash
# Connect to PostgreSQL
docker exec -it hris_postgres psql -U hris_user -d hris_db

# Inside psql:
\dt                                   # List all tables
\d employees                          # View table structure
SELECT count(*) FROM employees;       # Count records
\q                                    # Exit
```

### Backend health check

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:5001/health
```

### Database readiness check

```bash
docker exec hris_postgres pg_isready -U hris_user -d hris_db
```

---

*MC HRIS v2.0 — Mabini Colleges Human Resource Information System*

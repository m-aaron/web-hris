# HRIS Database Setup Guide

This document explains how the HRIS system automatically initializes its database when deployed using Docker.

## Overview

The system now follows best practices for containerized database initialization:

1. **PostgreSQL starts** with a persistent volume
2. **Schema is automatically created** on first run (if not already present)
3. **Reference data can be seeded separately** after the schema exists
4. **Backend starts** only after the database is healthy
5. **Frontend starts** after the backend is healthy

This ensures that running the system on a fresh device requires **no manual database setup**.

## For Testing on Another Device

### First-Time Setup (Fresh Machine)

1. **Ensure Docker is installed:**
   ```bash
   docker --version
   docker compose version
   ```

2. **Fill in environment variables:**
   - Copy `.env.example` to `.env` and fill in PostgreSQL credentials
   - Copy `backend/.env.docker.example` to `backend/.env.docker` and fill in backend config

3. **Start the system:**
   ```bash
   # From the project root
   start.bat  (on Windows)
   # or
   docker compose up -d --build  (on any OS)
   ```

4. **Wait for startup:**
   - PostgreSQL initializes (~10 seconds)
   - Schema is created automatically on first run
   - Backend connects and verifies the database
   - Frontend becomes available

5. **Access the system:**
   - Frontend: http://localhost:3002
   - Backend health: http://localhost:5001/health
   - Database: localhost:5433

### Subsequent Restarts

- Just run `start.bat` or `docker compose up -d`
- The schema will **not be re-created** (idempotent check)
- Existing data persists in the Docker volume

### Resetting Data

If you want to clear all data and re-initialize:

```bash
# Option 1: Reset to empty schema with demo data
./reset-db.bat  (on Windows)
# or
npm run db:reset-seed  (from backend directory)

# Option 2: Completely wipe and start fresh
docker compose down -v  # Removes volumes!
docker compose up -d --build  # Fresh start
```

## How It Works

### Initialization Flow

1. **Docker start:** PostgreSQL container starts with an environment file
2. **First-run trigger:** PostgreSQL detects `/docker-entrypoint-initdb.d` directory
3. **Run init script:** `01-init-schema.sh` executes
   - Checks if `employees` table exists
   - If **NOT** found: loads `schema.sql`
   - If **FOUND**: skips (idempotent)
4. **Backend connects:** Node.js server connects to the initialized database
5. **Ready:** API is functional and frontend loads

### File Structure

```
backend/
├── docker-entrypoint-initdb.d/
│   ├── 01-init-schema.sh        # Initialization script (checks & loads schema)
│   └── schema.sql               # Database schema only (no data)
├── scripts/
│   └── seed.js                  # Demo data seeder (called separately)
└── db/
    └── (future migration files can go here)
```

## Key Points

✓ **Automatic:** No manual `psql` or SQL imports needed  
✓ **Idempotent:** Safe to restart multiple times  
✓ **Schema-versioned:** All schema changes tracked in `schema.sql`  
✓ **Data-optional:** Seed data is separate from schema initialization  
✓ **Production-ready:** Same pattern works for staging/production

## Troubleshooting

### "Tables don't exist" error

1. Check PostgreSQL is running:
   ```bash
   docker compose ps
   ```

2. Check initialization logs:
   ```bash
   docker compose logs postgres
   ```

3. Verify the init directory is mounted:
   ```bash
   docker exec hris_postgres ls -la /docker-entrypoint-initdb.d/
   ```

### Want to see what tables were created?

```bash
docker exec hris_postgres psql -U hris_user -d hris_db -c "\dt"
```

### Force schema reload (destructive!)

```bash
# This will wipe the database and re-initialize
docker compose down -v
docker compose up -d --build
```

## For Development

If you modify the schema:

1. **Update** `backend/docker-entrypoint-initdb.d/schema.sql`
2. **For a fresh start:** Run `docker compose down -v && docker compose up -d --build`
3. **For existing volume:** The schema won't reload (it's idempotent). To force reload:
   ```bash
   docker compose exec postgres psql -U hris_user -d hris_db -f /docker-entrypoint-initdb.d/schema.sql
   ```

## Related Commands

```bash
# View database structure
docker exec hris_postgres psql -U hris_user -d hris_db -c "\d employees"

# Backup current database
docker compose exec postgres pg_dump -U hris_user hris_db > backup.sql

# Restore from a backup
docker compose exec postgres psql -U hris_user -d hris_db < backup.sql

# Access PostgreSQL console
docker compose exec postgres psql -U hris_user -d hris_db
```

---

**Last Updated:** 2026-04-29

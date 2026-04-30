# Database Initialization System

This directory contains the automatic database initialization for HRIS when running with Docker.

## Directory Contents

- **`01-init-schema.sh`** - Initialization script that runs on PostgreSQL first startup
  - Checks if schema is already initialized
  - Loads `schema.sql` if database is empty
  - Idempotent: safe to run multiple times

- **`schema.sql`** - Complete database schema (structure only, no data)
  - All table definitions
  - All constraints, triggers, and functions
  - Foreign key relationships
  - Indexed sequences and defaults
  - **Does NOT contain any data**

## How It Works

1. When PostgreSQL container starts, Docker automatically runs all scripts in `/docker-entrypoint-initdb.d/`
2. Our init script checks if the database is already initialized
3. If not, it loads the schema SQL file
4. Backend connects and assumes tables exist

## Reference

- **Mounted location in container:** `/docker-entrypoint-initdb.d/`
- **Host mount point:** `./backend/docker-entrypoint-initdb.d/`
- **Defined in:** `docker-compose.yml` under postgres service volumes

## For Development

### Adding New Tables

1. Add the table definition to `schema.sql`
2. Make sure to use `CREATE TABLE IF NOT EXISTS` for idempotency
3. Restart Docker: `docker compose down -v && docker compose up -d --build`

### Viewing Current Schema

```bash
# List all tables
docker exec hris_postgres psql -U hris_user -d hris_db -c "\dt"

# View specific table structure
docker exec hris_postgres psql -U hris_user -d hris_db -c "\d tablename"

# View all triggers
docker exec hris_postgres psql -U hris_user -d hris_db -c "SELECT * FROM information_schema.triggers"
```

### Manual Schema Reload

If you need to force a schema reload without wiping data:

```bash
# WARNING: This may cause issues if dependencies have changed!
docker compose exec postgres psql -U hris_user -d hris_db -f /docker-entrypoint-initdb.d/schema.sql
```

---

**Last Updated:** 2026-04-29

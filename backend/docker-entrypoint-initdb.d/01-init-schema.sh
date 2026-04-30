#!/bin/bash
# Database initialization script for PostgreSQL
# This script runs automatically on first PostgreSQL container start
# It creates the schema if it doesn't already exist

set -e

# Load environment variables from .env
export PGUSER=${POSTGRES_USER}
export PGPASSWORD=${POSTGRES_PASSWORD}
export PGDATABASE=${POSTGRES_DB}

echo "=== HRIS Database Initialization ==="
echo "Database: $PGDATABASE"
echo "User: $PGUSER"
echo ""

# Check if schema is already initialized
SCHEMA_CHECK=$(psql -h localhost -U "$PGUSER" -d "$PGDATABASE" -t -c \
  "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='employees' LIMIT 1);" 2>/dev/null || echo "f")

if [ "$SCHEMA_CHECK" = "t" ]; then
    echo "[OK] Schema already exists. Skipping initialization."
    exit 0
fi

echo "[INFO] Schema not found. Initializing database..."

# Run the schema file
if [ -f "/docker-entrypoint-initdb.d/schema.sql" ]; then
    echo "[INFO] Loading schema from /docker-entrypoint-initdb.d/schema.sql..."
    psql -h localhost -U "$PGUSER" -d "$PGDATABASE" -f "/docker-entrypoint-initdb.d/schema.sql"
    
    if [ $? -eq 0 ]; then
        echo "[OK] Schema loaded successfully."
    else
        echo "[ERROR] Failed to load schema."
        exit 1
    fi
else
    echo "[ERROR] Schema file not found at /docker-entrypoint-initdb.d/schema.sql"
    exit 1
fi

echo "[OK] Database initialization completed."
echo ""

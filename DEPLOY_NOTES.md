# HR UAT Deploy Notes

## Scope

This checklist validates the Docker deployment for:

- Frontend container
- Backend container
- PostgreSQL container with persistent volume

## Environment

- Frontend URL: http://localhost:3000
- Backend URL: http://localhost:5001
- Backend health: http://localhost:5001/health
- Postgres host port: 5433

## Pre-check

1. Ensure containers are running:
   - docker compose ps
2. Confirm all services are healthy:
   - postgres: healthy
   - backend: healthy
   - frontend: healthy

## Test 1: Authentication

1. Open frontend and login with HR test user.
2. Confirm login succeeds and user lands on protected page.
3. Refresh browser page.
4. Confirm session remains valid (cookie/refresh flow still works).
5. Logout and confirm protected routes are blocked.

## Test 2: Employee CRUD (Core)

1. Create a new employee with minimum required fields.
2. Confirm employee appears in list/search.
3. Update key profile fields (e.g., status, contact, role-related field).
4. Confirm updated values persist after page refresh.
5. Delete or archive test employee (based on your app flow).
6. Confirm record state changes correctly in UI and backend.

## Test 3: Tabbed Detail Data

1. Add Personal details.
2. Add Family and Children data.
3. Add Employment data.
4. Add Education and Examination data.
5. Add Training, History, Other info, and References.
6. Reload page and confirm all tab data persists.

## Test 4: File Uploads

1. Upload profile image/document from employee form.
2. Confirm file preview or avatar loads.
3. Open uploaded asset URL from app and confirm backend static serving works.
4. Restart backend container only:
   - docker compose restart backend
5. Confirm uploaded file is still available (uploads volume persistence).

## Test 5: Dashboard and Reporting

1. Open dashboard page.
2. Verify key cards/charts load without API errors.
3. Trigger any export/report feature used by HR.
4. Validate exported file downloads and data shape is correct.

## Test 6: DB Persistence

1. Create one clear marker record (e.g., employee code UAT-DOCKER-001).
2. Restart postgres:
   - docker compose restart postgres
3. Re-open app and search marker record.
4. Confirm record still exists.

## Test 7: Basic Failure Recovery

1. Stop backend:
   - docker compose stop backend
2. Refresh frontend and verify API error behavior is user-safe.
3. Start backend:
   - docker compose start backend
4. Confirm app recovers and operations continue.

## Smoke API Checks (optional)

- Backend health:
  - Invoke-WebRequest -UseBasicParsing http://localhost:5001/health
- DB readiness:
  - docker exec hris_postgres pg_isready -U hris_user -d hris_db

## Exit Criteria

UAT can be marked PASS when:

1. All 7 test sections pass.
2. No container is restarting/crashing.
3. Data remains after service restarts.
4. No blocking API or UI errors for HR workflow.

# Docker Run Checklist

## 1. Prepare env files
- Root DB env is already used by docker-compose via .env.
- Create backend runtime env from template:
  - Copy backend/.env.docker.example -> backend/.env.docker
- Optional frontend template exists for local reference:
  - frontend/.env.docker.example

## 2. Start full stack
- Build and run: docker compose up -d --build
- Check status: docker compose ps

## 3. Verify health
- Backend health: http://localhost:5001/health
- Frontend: http://localhost:3002
- API base test: http://localhost:5001/api

## 4. Verify database
- Readiness check:
  - docker exec hris_postgres pg_isready -U hris_user -d hris_db
- Confirm persistence:
  - Add one record from app
  - docker compose restart postgres
  - Confirm record still exists

## 5. Stop stack
- docker compose down
- Keep data volume (default behavior)

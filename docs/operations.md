# FORNIX Operations

Phase 1 deploy, health, backup, and restore.

## Local data services

```bash
cp .env.example .env
docker compose up -d
```

Compose MongoDB: `localhost:27018` (mapped away from a host `mongod` on `27017`)  
MinIO API: `localhost:9000` · Console: `localhost:9001`

Dev `.env` may keep `MONGODB_URI=mongodb://localhost:27017/fornix` if you run a host MongoDB. To use Compose Mongo instead, set `MONGODB_URI=mongodb://localhost:27018/fornix`. Backup/restore read `MONGODB_URI` and call local `mongodump`/`mongorestore` when available.


## Full stack (production-shaped)

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

App: `http://localhost:8080`  
API via same origin: `/api/v1` · Swagger: `/api/docs`

Compose services: MongoDB, MinIO, Nest backend, Nginx-served Angular SPA (API proxied).

Set strong `JWT_*` and MinIO credentials in `.env` before any shared host.

## Health

- API: `GET /api/v1/health`
- Compose healthchecks on MongoDB, MinIO, backend, and frontend images

## Backup

```bash
./infrastructure/storage/backup.sh
```

Writes `backups/<UTC-timestamp>/mongo.archive.gz` and, if [MinIO Client](https://min.io/docs/minio/linux/reference/minio-mc.html) (`mc`) is installed, a `minio/` mirror. Path of the latest run is stored in `backups/LATEST`.

## Restore

```bash
./infrastructure/storage/restore.sh            # uses backups/LATEST
./infrastructure/storage/restore.sh backups/<timestamp>
```

Restores MongoDB with `mongorestore --drop` for the `fornix` namespace, then mirrors objects back when `mc` and a `minio/` folder exist.

## Tests

```bash
# Backend unit
cd backend && npm test

# Backend live API (authz + file reject) — API must be running
cd backend && npm run test:e2e

# Acceptance smoke (PRD §14 API path)
./scripts/acceptance-smoke.sh

# Frontend unit
cd frontend && npm run test:ci

# Playwright UI (dev servers on :4200 / :3000)
cd frontend && npx playwright install chromium && npm run e2e
```

## HTTPS

Terminate TLS at a host reverse proxy (Caddy, Nginx, or a load balancer) in front of port 8080. Application secrets stay in environment variables; do not commit `.env`.

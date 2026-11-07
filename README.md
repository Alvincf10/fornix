# FORNIX

Personal Research & Development Workspace.

**Engineer Your Knowledge.**

Phase 1 core stack (no AI):

| Path | Stack |
|---|---|
| `frontend/` | Angular 19, Tailwind, Angular Material, Tiptap |
| `backend/` | NestJS 12, REST `/api/v1`, MongoDB, MinIO |
| `infrastructure/` | Nginx, Dockerfiles, backup/restore |

Product requirements: [`prd/phase1.md`](prd/phase1.md)  
Implementation plan: [`docs/implementation-plan.md`](docs/implementation-plan.md)  
API & schema: [`docs/api-and-schema.md`](docs/api-and-schema.md)  
Operations: [`docs/operations.md`](docs/operations.md)  
Design: [`DESIGN.md`](DESIGN.md)

## Prerequisites

- Node.js 22+
- MongoDB 7+ and MinIO (via Docker Compose, or installed on the host)
- Two terminals for local app processes (backend + frontend)

## Dev setup

### 1. Env + data services

From the repo root:

```bash
cp .env.example .env
```

Backend also loads `backend/.env` if present (`envFilePath: ['.env', '../.env']`).

**Option A — Docker Compose (Mongo + MinIO only)**

```bash
docker compose up -d
```

MinIO: `:9000` (console `:9001`). Compose Mongo maps to host `27018`. Point env at it:

```bash
MONGODB_URI=mongodb://localhost:27018/fornix
```

**Option B — no Docker (host Mongo + MinIO)**

1. Install and start MongoDB so it listens on `27017` (default `.env` already uses `mongodb://localhost:27017/fornix`).
2. Install and start MinIO with API on `9000`. Example binary start:

```bash
mkdir -p ~/minio-data
minio server ~/minio-data --address ":9000" --console-address ":9001"
```

3. Match `.env` storage creds to your MinIO root user/password (defaults in `.env.example` are `minioadmin` / `minioadmin`). Create bucket `fornix` in the MinIO console if the API does not auto-create it on first upload.

You still run Nest + Angular on the host in both options; Docker here is only for data services.

### 2. Backend (NestJS)

```bash
cd backend
npm install
npm run start:dev
```

API listens on http://localhost:3000

| Endpoint | URL |
|---|---|
| REST | http://localhost:3000/api/v1 |
| Swagger | http://localhost:3000/api/docs |
| Health | http://localhost:3000/api/v1/health |

Other scripts: `npm run build`, `npm start` (no watch), `npm run start:prod` (needs `dist/`), `npm test`, `npm run test:e2e`.

### 3. Frontend (Angular)

In a second terminal:

```bash
cd frontend
npm install
npm start
```

App: http://localhost:4200  
Dev API base is set in `frontend/src/environments/environment.development.ts` (`http://localhost:3000/api/v1`).

Other scripts: `npm run build`, `npm run test:ci`, `npm run e2e` (Playwright; needs Chromium via `npx playwright install chromium` and both servers up).

## Production-shaped Compose

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Serves the SPA + proxied API on http://localhost:8080

## Verify Phase 1

```bash
./scripts/acceptance-smoke.sh
cd backend && npm test && npm run test:e2e
```

## Layout

```text
fornix/
├── frontend/
├── backend/
├── infrastructure/
│   ├── nginx/
│   ├── docker/
│   └── storage/
├── scripts/
├── docker-compose.yml
├── docker-compose.prod.yml
└── .env.example
```

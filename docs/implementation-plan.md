# FORNIX Implementation Plan

Source: `prd/phase1.md` v1.2  
Scope: Phase 1 Core Workspace (no AI)

## Delivery slices

| Slice | Goal | Exit criteria |
|---|---|---|
| **1.1 Foundation** | Runnable monorepo, auth, design base, Swagger | **Done** |
| **1.2 Dashboard & Workspace** | Research + Project CRUD, nav, archive | **Done** |
| **1.3 Checkpoint Engine** | Checkpoints + Progress Entries + progress math | **Done** |
| **1.4 Documentation Engine** | Tiptap editor | **Done** |
| **1.5 Search & Attachments** | Global search + MinIO files | **Done** |
| **1.6 Stabilization** | Tests + deploy hardening | **Done** — unit/e2e/acceptance, health, helmet, Nginx/Compose prod, backup/restore |

## Acceptance (PRD §14)

Covered by `scripts/acceptance-smoke.sh` plus authz/file e2e tests and Playwright shell smoke. Manual check: desktop + mobile nav in the running SPA.

## Non-goals for Phase 1

AI, multiplayer editing, knowledge graph, device/firmware registry, command library, external integrations (PRD §3.2).

## Ops

See [`docs/operations.md`](operations.md).

## Phase 2

Design-only until approved. See [`prd/phase2.md`](../prd/phase2.md) and [`PHASE2_IMPLEMENTATION_PLAN.md`](../PHASE2_IMPLEMENTATION_PLAN.md).

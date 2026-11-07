# FORNIX Phase 2 — Migration Plan

## Goals

- Ship Phase 2 without downtime for Phase 1 features.
- Prefer additive schema changes over destructive ones.
- Keep `scripts/acceptance-smoke.sh` green after every merged slice.

## Strategy

**Expand–contract** where needed:

1. Add new collections and optional fields.
2. Deploy API that reads/writes both old and new shapes.
3. Only after FE is updated, rely on new fields.
4. Do not remove Phase 1 fields in Phase 2 (e.g. checkpoint freeform `methodology` string stays).

No Mongo replica-set multi-doc transactions required for v1 (local Compose is standalone). Use single-document updates and careful ordering for promote/supersede flows.

## Per-slice data changes

| Slice | DB change | Backfill | Rollback |
|---|---|---|---|
| 2.0 Hardening | none (parent validator) | — | revert code |
| 2.1 Relations | +`knowledge_relations` | none | drop collection |
| 2.2 Methodologies | +`methodologies`; checkpoint.`methodologyId` optional | none | ignore field / drop collection |
| 2.3 Advanced checkpoints | +branch fields on checkpoints | default `branchRole=primary` for existing | ignore fields |
| 2.4 Revisions | +`documentation_revisions`; doc.`revision` default 1 | set `revision: 1` on existing docs (optional script) | drop revisions collection |
| 2.5 Devices | +`devices`, `firmware_builds` | none | drop collections |
| 2.6 Commands | +`commands` | none | drop collection |
| 2.7 Ideas + search | +`ideas`; search index use | none | drop collection; feature-flag search filters |
| 2.8 Stabilization | indexes review; backup scripts include new DBs | — | — |

## Progress calculation migration risk

Existing checkpoints have no `branchRole`. Treat missing as **eligible** (same as today).

When introducing alternatives:

- New code: exclude `branchRole === 'superseded'` (and keep excluding Draft/Cancelled).
- Parallel groups: include all `parallel` + `primary` with weights; document UX so users set weights intentionally.

Ship progress unit tests before enabling UI for branches.

## Attachment / enum alignment

Normalize parent type strings across attachments, docs, relations (`checkpoint` vs inconsistent names). Migration: map on read if any legacy values appear (Phase 1 uses consistent lowercase enums today—verify once in code audit before coding).

Extend attachment `parentType` allowlist for `device` and `firmware_build` when slice 2.5 lands.

## Index builds

Create indexes via Mongoose schema on module init (Phase 1 pattern). For large prod DBs later, switch to explicit `createIndexes` in a migrate script; not required for personal single-user v1.

## Backup / restore

Update `infrastructure/storage/backup.sh` notes: `mongodump` of full `fornix` DB already includes new collections automatically.

MinIO: firmware binaries already under attachments bucket layout—no change if using `attachmentId`.

## Feature flags (optional)

Env `PHASE2_MODULES=relations,methodologies,...` if gradual enablement is desired. Default for personal deploy: all on after each slice merges.

## Cutover checklist (each slice)

1. Migrated schemas deploy.
2. Backend tests + Phase 1 acceptance smoke.
3. Frontend for that slice only.
4. Slice acceptance criteria.
5. Backup smoke once after 2.4+ (revision growth).

## Risks summary

| Risk | Mitigation |
|---|---|
| Progress math changes break parent % | Unit tests + smoke with known 40/100 weights |
| Revision storage growth | Explicit snapshot default; retention later |
| Orphan relations | Delete edges when endpoint deletes entity |
| Search slower with more types | Cap per-type; use text indexes |
| FE bundle | Lazy-load Phase 2 routes; keep Tiptap on docs only |
| Dual Mongo (host :27017 vs Compose :27018) | Ops already documented; CI/dev use one URI |

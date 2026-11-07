# FORNIX Phase 2 — Architecture

Status: design (awaiting implementation approval)  
Baseline: Phase 1 complete (slices 1.1–1.6)  
Kickoff: `prd/phase2.md`

## 1. Current architecture findings

### Stack (unchanged)

```text
Angular 19 SPA  →  NestJS /api/v1  →  MongoDB + MinIO
```

- Auth: JWT access + refresh rotation (httpOnly cookie)
- Ownership: every domain document filtered by `ownerId`
- Polymorphic links today: `(parentType, parentId)` on checkpoints, documentations, attachments
- Docs: single Tiptap JSON blob + denormalized `searchText` + optimistic `baseUpdatedAt`
- Search: owner-scoped regex across collections (text indexes on research/project exist but unused)
- Progress: weighted average of eligible checkpoints → parent research/project

### Gaps that constrain Phase 2

| Gap | Impact |
|---|---|
| No generic relationship collection | Knowledge graph / checkpoint edges need a new store |
| No version/snapshot collection | Revision history cannot live inside `documentations.content` without violating “no duplicate content” if done naively |
| Attachment upload does not assert parent ownership | Registry and command parents must use a shared parent-validator |
| Hard delete without cascade | Graph edges and registry refs can orphan |
| Search in-memory merge | Advanced filters + more entity types need index-backed search |
| Flat FE routes, no lazy loading | New modules raise initial bundle (Tiptap already large) |
| `activity_logs` documented but unimplemented | Idea/audit trail can reuse this name or stay separate |

### Reusable components

**Backend:** Nest module layout, `JwtAuthGuard` + `@CurrentUser`, pagination DTO, slugify, `extractTiptapText`, `StorageService`, progress-math, polymorphic parent pattern, Vitest + live API e2e.

**Frontend:** App shell + tokens, auth interceptor/guards, `*Api` services, list/detail/form patterns, `doc-editor`, `attachments-panel`, parent query-param linking, docs autosave/409 UX.

## 2. Target architecture

Phase 2 adds **knowledge entities and edges** beside Phase 1 workspaces. It does not replace Research/Project/Checkpoint/Doc.

```text
Phase 1 core                  Phase 2 knowledge layer
─────────────────             ───────────────────────
Research / Project            Devices / Firmware builds
Checkpoint / Entry            Methodologies (templates + instances)
Documentation (live)          Doc revisions (snapshots)
Attachments / Search          Commands (library, never executed)
                              Ideas (inbox)
                              KnowledgeRelation (typed edges)
                              Advanced search (filters + facets)
```

### Design principles

1. **Extend, don’t rewrite** — new Nest modules + Angular features; keep `/api/v1` contracts for Phase 1 resources.
2. **Edges are first-class** — relationships live in `knowledge_relations`, not only embedded arrays.
3. **One live doc body** — `documentations.content` remains the current version; history is append-only snapshots.
4. **Commands are data** — store/copy/link only; API and UI never execute shell/commands.
5. **Ownership on every hop** — create/update/delete of edges and links validates both ends belong to the same owner.
6. **No AI** — no LLM packages or external model calls.

### Module map (Nest)

| Module | Collection(s) | Depends on |
|---|---|---|
| `relations` | `knowledge_relations` | research, projects, checkpoints, docs, devices, commands, methodologies, ideas |
| `methodologies` | `methodologies`, optional bind on checkpoint | checkpoints |
| `checkpoint-graph` (extend `checkpoints`) | checkpoint fields + relations | relations, progress calculator |
| `revisions` | `documentation_revisions` | documentations |
| `devices` | `devices`, `firmware_builds` | attachments (optional) |
| `commands` | `commands` | — |
| `ideas` | `ideas` | optional promote → research |
| `search` (extend) | — | all searchable collections |

Frontend: mirror under `features/` with lazy-loaded routes where possible.

## 3. Cross-cutting services

### `OwnershipService` / `ParentAccessService` (new)

Centralize “does this `ownerId` own `(type, id)`?” used by attachments, relations, revisions, and Phase 2 create DTOs. Backfill attachment upload to call it (Phase 2.0 hardening).

### Progress policy for advanced checkpoints

When alternative/parallel groups exist:

- Only **active branch** members (or explicitly weighted siblings) enter `averageCheckpointProgress`.
- Cancelled / superseded alternatives stay in history (Preserve Failure) but are ineligible—same as today’s Draft/Cancelled rule, extended with `branchRole` / `supersededBy`.

Exact rule is specified in the database design and implementation plan slice 2.3.

### Search evolution

1. Keep response shape `{ items, total, page, limit }` with `type` discriminant.
2. Prefer `$text` / existing text indexes for research & projects; keep `searchText` for docs.
3. Add filters: `category`, `status`, `tag`, `linkedDeviceId`, `relationType`, date range.
4. Cap per-collection fetch; avoid loading unbounded arrays into memory.

## 4. Frontend architecture notes

- Lazy-load Phase 2 feature routes (`loadComponent` / `loadChildren`).
- Keep shell nav; add Knowledge section (Devices, Commands, Ideas, Graph) without removing Phase 1 items.
- Expand mobile nav or add overflow “More” for new destinations.
- Graph UI: start with adjacency list + simple SVG/canvas; defer heavy graph libraries until needed.
- Command library UI: copy-to-clipboard only; no “Run”.

## 5. Security baseline (all Phase 2 APIs)

- JWT required except health.
- Owner check on every resource and both ends of every relation.
- Rate limit remains global; tighten write endpoints if abused.
- Command payloads treated as untrusted text (escape on display; never `eval` / `child_process`).
- Firmware binaries via existing attachment allowlist or dedicated allowlist (no executables).
- Secrets stay in env; no plaintext credentials in docs (Phase 1 rule).

## 6. Compatibility

| Phase 1 surface | Phase 2 rule |
|---|---|
| `/research`, `/projects`, `/checkpoints`, `/entries`, `/documentations`, `/attachments`, `/search`, `/dashboard`, `/auth` | Remain functional; additive fields only (optional) |
| Acceptance smoke script | Must keep passing after each slice |
| FE routes for Phase 1 entities | Unchanged paths |

Optional additive fields on checkpoints (e.g. `methodologyId`, `branchGroupId`) must be optional with defaults so old clients ignore them.

# FORNIX Phase 2 — Implementation Plan

Source: `prd/phase2.md`  
Design: `docs/phase2-architecture.md`, `docs/phase2-database-design.md`, `docs/phase2-api-specification.md`, `docs/phase2-migration-plan.md`  
Baseline: Phase 1 slices 1.1–1.6 (must stay green)

**Rule:** Do not implement until this plan is approved. Deliver independently testable slices in order.

Complexity scale: **S** (<1 day) · **M** (1–3 days) · **L** (3–5 days) · **XL** (5+ days) — single-engineer personal-project estimate.

---

## Recommended order

```text
2.0 Hardening → 2.1 Relations → 2.2 Methodologies → 2.3 Advanced Checkpoints
    → 2.4 Revisions → 2.5 Devices → 2.6 Commands → 2.7 Ideas + Advanced Search
    → 2.8 Stabilization
```

Rationale: shared parent validation and a generic relation store unlock graph/device/command links; methodologies and branch semantics build on checkpoints; revisions need stable docs; registry/library/inbox are mostly independent after relations exist; search last so new types are indexed once.

---

## Slice 2.0 — Ownership hardening

**Complexity:** S  
**Objective:** Shared parent ownership checks before Phase 2 entities multiply polymorphic links.

**Scope:** Backend helper used by attachments (and later relations). No new UI.

**Backend:** `ParentAccessService` (or equivalent) resolving `research|project|checkpoint|progress_entry|documentation` by id+owner; wire into `AttachmentsService.upload`.

**Frontend:** None (behavior-compatible; invalid parent → 404/400).

**Database:** None.

**API:** No new routes; stricter validation on `POST /attachments`.

**Security:** Close “upload to any parentId” gap.

**Tests:** Unit for resolver; e2e: cannot attach to another user’s research id.

**Acceptance:** Phase 1 smoke still passes; cross-owner parent rejected.

**Dependencies:** None.

---

## Slice 2.1 — Knowledge Relationship

**Complexity:** M  
**Objective:** Typed, owner-scoped edges between entities.

**Scope:** CRUD relations + shallow graph query; FE list on entity detail + simple graph page.

**Backend:** `relations` module; create validates both ends; delete; list filters; `GET /relations/graph`.

**Frontend:** Relation panel on research/project/checkpoint/doc detail; `/knowledge/graph` (root picker + depth 1–2). Lazy route.

**Database:** `knowledge_relations` + indexes.

**API:** `/relations` as in API spec.

**Security:** Dual-end ownership; unique edge constraint; no cross-tenant leaks (404).

**Tests:** Unit unique/self-edge; e2e create/list/delete; authz cross-owner.

**Acceptance:** User can link checkpoint→doc and see edge from both sides; graph returns nodes/edges for root.

**Dependencies:** 2.0 (reuse parent access; extend type map as modules land).

---

## Slice 2.2 — Methodology Management

**Complexity:** M  
**Objective:** First-class methodology templates reusable by checkpoints.

**Scope:** Methodology CRUD + archive; optional `methodologyId` on checkpoint; FE library + picker.

**Backend:** `methodologies` module; additive checkpoint DTO/schema field.

**Frontend:** `/methodologies` list/detail/form; checkpoint form select; detail shows linked template.

**Database:** `methodologies`; optional `checkpoints.methodologyId`.

**API:** `/methodologies`; checkpoint POST/PATCH additive field.

**Security:** Owner scope; archive hides from default pickers.

**Tests:** CRUD e2e; checkpoint with invalid methodologyId → 404.

**Acceptance:** Create methodology with steps; attach to new detailed checkpoint; freeform `methodology` string still works.

**Dependencies:** None blocking (2.1 optional for `uses_methodology` edges).

---

## Slice 2.3 — Advanced Checkpoints

**Complexity:** L  
**Objective:** Alternative / parallel branches + progress rules; relation types for alternatives.

**Scope:** Branch fields; supersede endpoint; branch listing; progress eligibility update; FE branch UI on parent detail.

**Backend:** Extend checkpoint schema/service; `POST /checkpoints/:id/supersede`; `GET /checkpoints/branches`; update `progress-math` / calculator.

**Frontend:** Parent detail: group checkpoints by `branchGroupId`; actions “Add alternative”, “Mark superseded”; show excluded-from-progress badge.

**Database:** Additive checkpoint fields only.

**API:** Additive + supersede + branches.

**Security:** Successor/predecessor same owner and same parent.

**Tests:** Progress unit tests for superseded/parallel/weights; e2e supersede.

**Acceptance:** Two alternatives under one group; superseding one recalculates parent progress excluding superseded; history retained.

**Dependencies:** 2.1 recommended for `alternative_of` / `parallel_with` edges; 2.2 optional.

---

## Slice 2.4 — Revision History

**Complexity:** M  
**Objective:** Append-only documentation snapshots without replacing live content store.

**Scope:** Snapshot/list/get/restore; FE history drawer on doc detail.

**Backend:** `documentation_revisions`; bump `documentations.revision`; restore via existing update path.

**Frontend:** “Save revision”, history list, view snapshot (read-only editor), restore confirm.

**Database:** `documentation_revisions`; `documentations.revision`.

**API:** nested `/documentations/:id/revisions`.

**Security:** Owner only; restore respects conflict token if provided.

**Tests:** Snapshot content equals live; restore creates newer revision; cannot read other owner’s revision.

**Acceptance:** Edit doc → save revision → edit again → restore prior → content matches; live doc remains single source.

**Dependencies:** None (docs Phase 1).

---

## Slice 2.5 — Device & Firmware Registry

**Complexity:** M–L  
**Objective:** Track devices and firmware builds; optional links to checkpoints/research.

**Scope:** Device + firmware CRUD; FE registry; attach firmware file via attachments; relations `uses_device`.

**Backend:** `devices`, `firmware_builds` modules; extend attachment parent types.

**Frontend:** `/devices`, detail with firmware list; link device from checkpoint detail.

**Database:** `devices`, `firmware_builds`.

**API:** `/devices`, nested firmware routes.

**Security:** Owner scope; firmware attachment parent ownership; no arbitrary file types beyond allowlist.

**Tests:** CRUD; firmware unique version per device; relation to checkpoint.

**Acceptance:** Register device, add firmware with file, link to checkpoint, visible on both sides.

**Dependencies:** 2.0, 2.1 (for links); attachments Phase 1.

---

## Slice 2.6 — Technical Command Library

**Complexity:** M  
**Objective:** Store reusable commands/scripts as data (never execute).

**Scope:** Command CRUD; FE library with copy-to-clipboard; link to entries/checkpoints via relations or `commandIds`.

**Backend:** `commands` module; **no execute endpoint**.

**Frontend:** `/commands`; detail with copy button; risk badge; optional insert-into-doc as code block (clipboard/manual).

**Database:** `commands`.

**API:** `/commands` only.

**Security:** Treat body as untrusted text; CSP/display escaping; explicit product copy: “FORNIX does not run these commands.”

**Tests:** CRUD; assert no `/run` route; authz.

**Acceptance:** Save high-risk command, copy body, link to checkpoint; no execution path in API surface.

**Dependencies:** 2.1 optional for edges.

---

## Slice 2.7 — Idea Inbox & Advanced Search

**Complexity:** M–L  
**Objective:** Capture ideas quickly; promote to research; richer search filters across Phase 1+2 types.

**Scope:** Ideas CRUD + promote; search query extensions + FE filters; dashboard inbox count.

**Backend:** `ideas` module; extend `SearchService` types/filters; optional `$text` for research/projects.

**Frontend:** `/ideas` inbox; promote action; search page filters (type multi, tag, status, category, dates).

**Database:** `ideas`.

**API:** `/ideas`, `POST …/promote`; extended `GET /search`.

**Security:** Promote creates research for same owner only.

**Tests:** Promote creates research + status Promoted; search returns commands/devices/ideas; Phase 1 search smoke still works.

**Acceptance:** Idea → promote → opens as Research Idea; search filters by type+tag find a command and a device.

**Dependencies:** 2.5–2.6 for those types in search; can ship ideas earlier with partial `include`.

---

## Slice 2.8 — Stabilization

**Complexity:** M  
**Objective:** Tests, ops, docs, performance pass for Phase 2.

**Scope:**

- Expand acceptance script for relations, revisions, devices, commands, ideas.
- Playwright smoke for inbox + command copy + doc revision.
- Backup verification with new collections.
- FE lazy routes audit; mobile nav “More” if needed.
- Update `docs/api-and-schema.md`, README, operations.

**Backend / Frontend / DB / API:** polish only.

**Security:** Authz sweep on new controllers; command non-execution review.

**Tests:** Full suite green; Phase 1 smoke green.

**Acceptance:** Checklist signed against Phase 2 modules 1–7; no AI deps in package.json.

**Dependencies:** 2.1–2.7.

---

## Out of scope (defer)

- Markdown export / knowledge backup pack (listed in phase1 “Future”; schedule after 2.8 or as 2.9 if required)
- Real-time collab, AI (Phase 3)
- Executing commands, remote agents
- Full force-directed graph productization

---

## Complexity rollup

| Slice | Complexity |
|---|---|
| 2.0 Hardening | S |
| 2.1 Relations | M |
| 2.2 Methodologies | M |
| 2.3 Advanced Checkpoints | L |
| 2.4 Revisions | M |
| 2.5 Devices & Firmware | M–L |
| 2.6 Commands | M |
| 2.7 Ideas + Advanced Search | M–L |
| 2.8 Stabilization | M |

**Overall:** ~L–XL program (order of a few weeks calendar time for one engineer, sequential).

---

## Approval gate

Implementation starts only after explicit approval of:

1. This plan’s slice order and scope  
2. `docs/phase2-database-design.md` enums/fields  
3. Non-execution rule for Command Library  

First code slice after approval: **2.0 Ownership hardening**.

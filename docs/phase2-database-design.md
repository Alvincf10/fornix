# FORNIX Phase 2 — Database Design

All collections remain owner-scoped (`ownerId` → `users`) unless noted.

## 1. Existing collections (baseline — do not break)

`users`, `research`, `projects`, `checkpoints`, `progress_entries`, `documentations`, `attachments`, `refresh_tokens`

### Additive fields (optional, backward compatible)

#### checkpoints

| Field | Type | Notes |
|---|---|---|
| `methodologyId` | ObjectId? | → `methodologies` |
| `branchGroupId` | string? | groups alternatives under one parent |
| `branchRole` | enum? | `primary` \| `alternative` \| `parallel` \| `superseded` |
| `supersededBy` | ObjectId? | → checkpoints |
| `deviceIds` | ObjectId[]? | → devices |

#### documentations

| Field | Type | Notes |
|---|---|---|
| `revision` | number | monotonic current revision counter, default 1 |
| `methodologyId` | ObjectId? | |

#### progress_entries

| Field | Type | Notes |
|---|---|---|
| `commandIds` | ObjectId[]? | → commands (link only) |

Wire existing unused `attachmentIds` in create/update paths (Phase 1 field already present).

---

## 2. New collections

### knowledge_relations

Typed edges between any two owner-owned entities.

| Field | Type | Notes |
|---|---|---|
| `ownerId` | ObjectId | required, indexed |
| `fromType` | enum | see entity types |
| `fromId` | ObjectId | required |
| `toType` | enum | |
| `toId` | ObjectId | required |
| `relationType` | enum | see below |
| `label` | string? | optional display |
| `metadata` | object? | small JSON only |
| `createdAt` / `updatedAt` | date | |

**Entity types (shared enum):**  
`research` | `project` | `checkpoint` | `progress_entry` | `documentation` | `device` | `firmware_build` | `command` | `methodology` | `idea`

**Relation types (v1):**  
`related_to` | `depends_on` | `blocks` | `derived_from` | `alternative_of` | `parallel_with` | `documents` | `uses_device` | `uses_command` | `uses_methodology` | `promoted_from`

**Indexes:**

- `{ ownerId: 1, fromType: 1, fromId: 1 }`
- `{ ownerId: 1, toType: 1, toId: 1 }`
- `{ ownerId: 1, relationType: 1 }`
- unique `{ ownerId: 1, fromType: 1, fromId: 1, toType: 1, toId: 1, relationType: 1 }`

**Rules:** no self-edge (`from` ≠ `to` same type+id); both ends must exist and match `ownerId`; deleting an entity soft-deletes or hard-deletes its edges (policy: hard-delete edges on hard-delete entity).

---

### methodologies

Reusable experiment / analysis templates.

| Field | Type | Notes |
|---|---|---|
| `ownerId` | ObjectId | |
| `title` | string | |
| `slug` | string | unique per owner |
| `summary` | string | |
| `steps` | array | `{ title, detail, order }[]` |
| `defaultTools` | string[] | |
| `category` | string? | |
| `tags` | string[] | |
| `status` | enum | `Draft` \| `Active` \| `Archived` |
| `createdAt` / `updatedAt` | date | |

**Indexes:** `{ ownerId: 1, slug: 1 }` unique, `{ ownerId: 1, status: 1 }`, text on `title summary tags`.

Checkpoint may reference `methodologyId` (instance link). Full step overrides stay on the checkpoint (`methodology` text field remains for freeform notes).

---

### documentation_revisions

Append-only snapshots. **Does not replace** live `documentations.content`.

| Field | Type | Notes |
|---|---|---|
| `ownerId` | ObjectId | |
| `documentationId` | ObjectId | indexed |
| `revision` | number | matches counter at snapshot time |
| `title` | string | title at snapshot |
| `content` | Mixed | Tiptap JSON copy |
| `searchText` | string | optional denorm for history search |
| `note` | string? | user message (“before refactor”) |
| `createdAt` | date | no updates |

**Indexes:** `{ documentationId: 1, revision: -1 }` unique compound, `{ ownerId: 1, documentationId: 1 }`.

**When to write:** explicit “Save revision” and/or automatic snapshot on successful PATCH when content hash changes (debounce policy in API slice—default: explicit + auto on publish/archive).

**Restore:** copies snapshot `content`/`title` into live doc as a new PATCH (creates another revision). Avoids dual-write of “current” outside `documentations`.

---

### devices

| Field | Type | Notes |
|---|---|---|
| `ownerId` | ObjectId | |
| `name` | string | |
| `slug` | string | unique per owner |
| `deviceType` | enum | `Router` \| `IoT` \| `SoC` \| `Board` \| `Phone` \| `Other` |
| `vendor` | string? | |
| `model` | string? | |
| `identifiers` | object? | e.g. `{ mac, serial, chipId }` |
| `notes` | string? | |
| `tags` | string[] | |
| `status` | enum | `Active` \| `Retired` \| `Archived` |
| `createdAt` / `updatedAt` | date | |

**Indexes:** `{ ownerId: 1, slug: 1 }` unique, `{ ownerId: 1, status: 1 }`, `{ ownerId: 1, vendor: 1, model: 1 }`.

---

### firmware_builds

| Field | Type | Notes |
|---|---|---|
| `ownerId` | ObjectId | |
| `deviceId` | ObjectId | → devices |
| `version` | string | |
| `buildLabel` | string? | |
| `source` | string? | URL or note |
| `hash` | string? | sha256 of artifact if known |
| `attachmentId` | ObjectId? | → attachments (binary in MinIO) |
| `notes` | string? | |
| `releasedAt` | date? | |
| `createdAt` / `updatedAt` | date | |

**Indexes:** `{ ownerId: 1, deviceId: 1, version: 1 }` unique, `{ deviceId: 1 }`.

---

### commands

Technical command library — **stored text only**.

| Field | Type | Notes |
|---|---|---|
| `ownerId` | ObjectId | |
| `title` | string | |
| `slug` | string | unique per owner |
| `body` | string | the command / script text |
| `shell` | enum? | `bash` \| `zsh` \| `powershell` \| `python` \| `other` |
| `riskLevel` | enum | `Low` \| `Medium` \| `High` \| `Critical` |
| `category` | string? | |
| `tags` | string[] | |
| `notes` | string? | warnings, expected output |
| `status` | enum | `Draft` \| `Active` \| `Archived` |
| `createdAt` / `updatedAt` | date | |

**Indexes:** `{ ownerId: 1, slug: 1 }` unique, `{ ownerId: 1, status: 1 }`, text on `title body tags notes`.

**Invariant:** no field implies execution; no worker consumes `body`.

---

### ideas

Idea inbox — lighter than full Research.

| Field | Type | Notes |
|---|---|---|
| `ownerId` | ObjectId | |
| `title` | string | |
| `body` | string | |
| `tags` | string[] | |
| `status` | enum | `Inbox` \| `Triaged` \| `Promoted` \| `Dismissed` |
| `promotedResearchId` | ObjectId? | set on promote |
| `createdAt` / `updatedAt` | date | |

**Indexes:** `{ ownerId: 1, status: 1 }`, `{ ownerId: 1, createdAt: -1 }`, text on `title body tags`.

Promote flow: create Research (status `Idea`) + set idea `Promoted` + optional `knowledge_relations` edge `promoted_from`.

---

## 3. Entity relationship overview

```text
User
 ├─ Research ─┬─ Checkpoint* ─┬─ ProgressEntry*
 │            │               └─ (relations, commands)
 │            ├─ Documentation* ── DocumentationRevision*
 │            └─ Attachment*
 ├─ Project ── (same as research children)
 ├─ Methodology
 ├─ Device ── FirmwareBuild ── Attachment?
 ├─ Command
 ├─ Idea ──(promote)── Research
 └─ KnowledgeRelation (from ↔ to any owned entity)
```

## 4. Index / migration notes

- Create new collections with indexes in Mongoose schema factories (same as Phase 1).
- Additive checkpoint/doc fields: ship with defaults; no backfill required.
- Backfill: none mandatory for v1; optional script to link existing `methodology` free text is out of scope.
- Disk: revision snapshots grow with doc size × revision count — document retention later if needed.

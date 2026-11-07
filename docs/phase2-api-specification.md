# FORNIX Phase 2 — API Specification

Base: `/api/v1`  
Auth: Bearer access JWT on all routes below (unless noted)  
Ownership: every handler scopes by `ownerId` from the token

Phase 1 routes remain as documented in `docs/api-and-schema.md`. This file lists **additive** Phase 2 surfaces.

Common list response:

```json
{ "items": [], "total": 0, "page": 1, "limit": 20 }
```

Error shape: Nest default `{ statusCode, message, error }`. Cross-owner → **404**. Validation → **400**. Conflict → **409**.

---

## Relations — `/relations`

| Method | Path | Notes |
|---|---|---|
| POST | `/relations` | Create edge; validates both ends |
| GET | `/relations` | Filter: `fromType`, `fromId`, `toType`, `toId`, `relationType`, pagination |
| GET | `/relations/:id` | |
| DELETE | `/relations/:id` | |

**POST body:**

```json
{
  "fromType": "checkpoint",
  "fromId": "...",
  "toType": "device",
  "toId": "...",
  "relationType": "uses_device",
  "label": "DUT",
  "metadata": {}
}
```

**GET `/relations/graph`:** query `rootType`, `rootId`, `depth` (default 1, max 3) → nodes + edges for UI.

---

## Methodologies — `/methodologies`

| Method | Path |
|---|---|
| POST | `/methodologies` |
| GET | `/methodologies` |
| GET | `/methodologies/:id` |
| PATCH | `/methodologies/:id` |
| DELETE | `/methodologies/:id` |
| POST | `/methodologies/:id/archive` |

List filters: `q`, `status`, `tag`, pagination.

Checkpoint create/update may accept optional `methodologyId` (Phase 1 DTO additive).

---

## Advanced checkpoints (extends `/checkpoints`)

Additive optional fields on create/update:

- `methodologyId`, `branchGroupId`, `branchRole`, `supersededBy`, `deviceIds`

New:

| Method | Path | Notes |
|---|---|---|
| POST | `/checkpoints/:id/supersede` | body `{ successorId }` — marks current superseded, links alternative |
| GET | `/checkpoints/branches` | query `parentType`, `parentId` — groups by `branchGroupId` |

Progress recalculation must use the Phase 2 eligibility rules (see architecture / migration).

---

## Revisions — `/documentations/:id/revisions`

| Method | Path | Notes |
|---|---|---|
| GET | `/documentations/:id/revisions` | List metadata (no full content by default) |
| GET | `/documentations/:id/revisions/:revision` | Full snapshot |
| POST | `/documentations/:id/revisions` | Snapshot current live doc; optional `{ note }` |
| POST | `/documentations/:id/revisions/:revision/restore` | Copy snapshot → live via normal update path |

List item: `{ revision, title, note, createdAt }` (omit `content` for bandwidth).

---

## Devices — `/devices`

| Method | Path |
|---|---|
| POST / GET | `/devices` |
| GET / PATCH / DELETE | `/devices/:id` |
| POST | `/devices/:id/archive` |

Filters: `q`, `status`, `deviceType`, `vendor`.

### Firmware — `/devices/:deviceId/firmware` or `/firmware`

Prefer nested:

| Method | Path |
|---|---|
| POST | `/devices/:deviceId/firmware` |
| GET | `/devices/:deviceId/firmware` |
| GET / PATCH / DELETE | `/firmware/:id` |

---

## Commands — `/commands`

| Method | Path |
|---|---|
| POST / GET | `/commands` |
| GET / PATCH / DELETE | `/commands/:id` |
| POST | `/commands/:id/archive` |

**Forbidden:** any route that executes `body`. No `/run`, no webhooks that shell out.

Filters: `q`, `status`, `shell`, `riskLevel`, `tag`.

---

## Ideas — `/ideas`

| Method | Path |
|---|---|
| POST / GET | `/ideas` |
| GET / PATCH / DELETE | `/ideas/:id` |
| POST | `/ideas/:id/promote` | Creates research; sets status Promoted |

Promote body optional: `{ category, priority }` overrides for new research.

---

## Search — extends `GET /search`

Existing: `q`, `type`, `category`, `status`, `page`, `limit`.

Additive query params:

| Param | Notes |
|---|---|
| `tag` | |
| `deviceId` | entities related via `uses_device` or checkpoint.deviceIds |
| `relationType` | filter hits that participate in this relation |
| `updatedFrom` / `updatedTo` | ISO dates |
| `include` | comma list of types: `idea,command,device,methodology,...` |

Response `items[].type` gains: `idea`, `command`, `device`, `methodology`, `firmware`.

---

## Dashboard — extends `GET /dashboard`

Additive counts (optional fields): `ideasInbox`, `devices`, `commands`, `methodologies`.  
Keep existing keys intact.

---

## Security notes (API)

- Validate ObjectId format; never trust client `ownerId`.
- Relation create: load both ends; 404 if missing/not owned.
- Command `body` returned as text; Content-Type JSON only.
- Revision restore uses same conflict token rules as doc PATCH when `baseUpdatedAt` provided.
- Attachment parent allowlist extended for `device` / `firmware_build` if binaries attach there.

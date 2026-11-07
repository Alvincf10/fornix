# FORNIX API & Schema Extract

Base URL: `/api/v1`  
Auth: Bearer access JWT; refresh via httpOnly cookie or body token (implementation uses httpOnly cookie + body fallback).

## Collections

### users

| Field | Type | Notes |
|---|---|---|
| email | string | unique, lowercase |
| displayName | string | |
| passwordHash | string | bcrypt |
| createdAt / updatedAt | date | timestamps |

### research

| Field | Type | Notes |
|---|---|---|
| title | string | required |
| slug | string | unique per owner |
| description | string | |
| objective | string | |
| category | enum | Cybersecurity, Hardware, Firmware, Reverse Engineering, Networking, Embedded Systems, Software, Infrastructure, Other |
| status | enum | Idea, Planned, In Progress, On Hold, Completed, Archived |
| priority | enum | Low, Medium, High, Critical |
| tags | string[] | |
| startDate / targetDate | date? | |
| progress | number | 0–100, computed |
| ownerId | ObjectId → users | required |
| createdAt / updatedAt | date | |

Indexes: `{ ownerId: 1, status: 1 }`, `{ ownerId: 1, slug: 1 }` unique, text on `title description tags`.

### projects

Same shape as research except:

- no `slug` required in PRD (optional for URLs)
- status: Planning, In Progress, On Hold, Completed, Cancelled, Archived

Indexes: `{ ownerId: 1, status: 1 }`, text on `title description tags`.

### checkpoints

| Field | Type | Notes |
|---|---|---|
| code | string | auto, e.g. `CP-001` |
| title | string | |
| description | string | |
| parentType | enum | research \| project |
| parentId | ObjectId | |
| objective | string | |
| methodology | string | detailed create |
| expectedResult | string | detailed create |
| tools | string[] | |
| status | enum | Draft, Planned, In Progress, Blocked, Completed, Cancelled, On Hold |
| outcome | enum | Not Evaluated, Success, Partial, Failed, Inconclusive |
| progress | number | 0–100 manual |
| weight | number? | for parent average |
| startDate / targetDate | date? | |
| ownerId | ObjectId | |
| createdAt / updatedAt | date | |

Indexes: `{ ownerId: 1, parentType: 1, parentId: 1 }`, `{ parentId: 1, code: 1 }`.

### progress_entries

| Field | Type | Notes |
|---|---|---|
| checkpointId | ObjectId | |
| title | string | |
| content | string/rich | |
| entryType | enum | Activity, Finding, Experiment, Issue, Note, Decision |
| occurredAt | date | |
| tools | string[] | |
| attachmentIds | ObjectId[] | |
| ownerId | ObjectId | |
| createdAt | date | |

Indexes: `{ checkpointId: 1, occurredAt: -1 }`.

### documentations

| Field | Type | Notes |
|---|---|---|
| title | string | |
| content | object/string | Tiptap JSON preferred |
| category | string | |
| tags | string[] | |
| parentType | enum? | research \| project \| checkpoint \| none |
| parentId | ObjectId? | |
| checkpointId | ObjectId? | |
| status | enum | Draft, Published, Archived |
| ownerId | ObjectId | |
| createdAt / updatedAt | date | |

Indexes: `{ ownerId: 1, status: 1 }`, text on `title tags content`.

### attachments

| Field | Type | Notes |
|---|---|---|
| originalName | string | |
| mimeType | string | allowlist |
| size | number | max from env |
| storageKey | string | MinIO key |
| parentType | enum | research \| project \| checkpoint \| progress_entry \| documentation |
| parentId | ObjectId | |
| ownerId | ObjectId | |
| createdAt | date | |

Binary stays in object storage; Mongo holds metadata only.

### activity_logs

| Field | Type | Notes |
|---|---|---|
| actorId | ObjectId | |
| action | string | |
| entityType | string | |
| entityId | ObjectId | |
| meta | object | |
| createdAt | date | |

### refresh_tokens (auth support)

| Field | Type | Notes |
|---|---|---|
| userId | ObjectId | |
| tokenHash | string | hashed refresh |
| expiresAt | date | |
| revokedAt | date? | |
| replacedByTokenHash | string? | rotation chain |
| createdAt | date | |

## HTTP surface (Phase 1)

### Auth

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register` | email, password, displayName |
| POST | `/auth/login` | returns accessToken; sets refresh cookie |
| POST | `/auth/refresh` | rotate refresh; new access |
| POST | `/auth/logout` | revoke refresh |
| GET | `/auth/me` | current user |

### Domain CRUD

| Resource | Paths |
|---|---|
| Research | `GET/POST /research`, `GET/PATCH/DELETE /research/:id` |
| Projects | `GET/POST /projects`, `GET/PATCH/DELETE /projects/:id` |
| Checkpoints | `GET/POST /checkpoints`, `GET/PATCH/DELETE /checkpoints/:id` |
| Progress Entries | `GET/POST /checkpoints/:id/entries`, `GET/PATCH/DELETE /entries/:id` |
| Documentation | `GET/POST /documentations`, `GET/PATCH/DELETE /documentations/:id` |
| Attachments | `GET/POST /attachments`, `GET/DELETE /attachments/:id`, download route |
| Search | `GET /search?q=&type=&category=&status=&page=&limit=` |

All mutating routes: JWT + `ownerId` authorization.  
List routes: paginated `{ items, total, page, limit }`.  
Errors: `{ statusCode, message, error, details? }`.

## Progress rules (backend)

- Checkpoint progress is manual 0–100.
- Research/Project progress = weighted average of eligible child checkpoints.
- Exclude Cancelled by default; Draft optional exclude.
- Blocked keeps progress; Failed outcome does not reset progress.

# FORNIX Phase 2 — Engineering Kickoff

You are working on FORNIX, a Personal Research & Development Workspace.

## Context

Phase 1 is marked complete across delivery slices 1.1–1.6.

Source of truth:
- `prd/phase1.md`
- `docs/implementation-plan.md` (Phase 1)
- `docs/operations.md`
- Design pack (this phase): `docs/phase2-*.md`, `PHASE2_IMPLEMENTATION_PLAN.md`

Phase 1 scope includes authentication, Research, Projects, Checkpoints, Progress Entries, Tiptap Documentation Editor, Global Search, Attachments, MinIO, testing, and deployment hardening.

## Objective

Prepare FORNIX Phase 2: Advanced Knowledge Management.

The goal is to transform FORNIX from a structured documentation workspace into an interconnected technical knowledge management system.

## Phase 2 Modules

1. Knowledge Relationship
2. Methodology Management
3. Advanced Checkpoints
4. Revision History
5. Device & Firmware Registry
6. Technical Command Library
7. Idea Inbox & Advanced Search
8. Stabilization

## Mandatory Engineering Rules

- Preserve the existing Angular + TypeScript frontend.
- Preserve NestJS backend.
- Preserve MongoDB + Mongoose.
- Preserve Tiptap editor.
- Preserve MinIO object storage.
- Do not rewrite the existing application architecture.
- Do not introduce AI or LLM dependencies.
- Maintain backward compatibility wherever practical.
- Validate ownership on every resource and relationship.
- Avoid duplicate storage of documentation content.
- Preserve all Phase 1 capabilities.
- Do not execute commands stored in the Command Library.

## Initial Task: Audit Before Implementation

Before coding:

1. Inspect the existing repository.
2. Read the Phase 1 PRD and implementation plan.
3. Inspect existing schemas, DTOs, controllers, services, and API routes.
4. Inspect frontend feature structure and routing.
5. Inspect current indexes and database relationships.
6. Inspect test coverage and current test execution.
7. Identify architectural constraints and potential migration risks.

## Required Deliverables

Create:

- `prd/phase2.md`
- `docs/phase2-architecture.md`
- `docs/phase2-database-design.md`
- `docs/phase2-api-specification.md`
- `docs/phase2-migration-plan.md`
- `PHASE2_IMPLEMENTATION_PLAN.md`

The implementation plan must break work into independently testable delivery slices.

Each slice must include:
- Objective.
- Scope.
- Backend changes.
- Frontend changes.
- Database changes.
- API changes.
- Security considerations.
- Test requirements.
- Acceptance criteria.
- Dependencies.

## Execution Constraint

Do not start implementing all modules immediately.

First complete the repository audit and produce the Phase 2 technical design.

Report:
1. Current architecture findings.
2. Existing components that can be reused.
3. Required schema changes.
4. New modules and dependencies.
5. Migration risks.
6. Recommended implementation order.
7. Estimated complexity per delivery slice.

Wait for implementation approval after presenting the audit and design.

The existing Phase 1 implementation is the baseline and must remain functional throughout Phase 2.
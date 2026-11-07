# FORNIX — Product Requirements Document (PRD)

**Version:** 1.2  
**Status:** Ready for Technical Implementation  
**Product Name:** FORNIX  
**Product Category:** Personal Research & Development Workspace  
**Tagline:** Engineer Your Knowledge.  
**Document Type:** Product Requirements Document

---

# 1. Product Identity

## 1.1 Product Name

**FORNIX**

FORNIX adalah nama resmi aplikasi Personal Research & Development Workspace.

Nama ini merepresentasikan tempat untuk membentuk, mengembangkan, menguji, dan menyimpan pengetahuan teknis melalui proses research dan engineering.

## 1.2 Brand Philosophy

FORNIX dibangun berdasarkan filosofi bahwa pengetahuan teknis tidak cukup hanya dikumpulkan. Pengetahuan harus melalui proses:

1. Explore — mengeksplorasi teknologi dan menemukan hal baru.
2. Investigate — melakukan investigasi dan memahami cara kerja suatu sistem.
3. Experiment — melakukan eksperimen dan pengujian.
4. Document — mendokumentasikan proses, hasil, dan temuan.
5. Evolve — mengembangkan pengetahuan menjadi kemampuan dan solusi baru.

## 1.3 Brand Positioning

FORNIX adalah personal technical workspace untuk seorang engineer dan researcher yang membutuhkan sistem terstruktur untuk mengelola research, eksperimen, project, dokumentasi, dan technical knowledge.

FORNIX bukan sekadar aplikasi pencatat atau task manager.

## 1.4 Brand Personality

- Technical
- Engineering-oriented
- Analytical
- Experimental
- Professional
- Minimalist
- Future-ready

## 1.5 Brand Tagline

**Primary:** Engineer Your Knowledge.

Alternatif:
- Research. Experiment. Build.
- Explore. Understand. Engineer.
- Every Experiment Leaves Knowledge.

---

# 2. Product Overview

## 2.1 Background

Aktivitas Research & Development menghasilkan banyak informasi yang tersebar, seperti:

- Research dan technical investigation.
- Firmware analysis dan reverse engineering.
- Cybersecurity research.
- Hardware dan embedded system experiments.
- Networking dan infrastructure projects.
- Troubleshooting dan problem solving.
- Technical documentation dan installation guides.
- Findings, experiment results, serta lessons learned.

Tanpa sistem dokumentasi yang terstruktur, informasi tersebut berisiko hilang, sulit ditemukan kembali, dan sulit digunakan sebagai referensi untuk pekerjaan berikutnya.

FORNIX dirancang untuk menjadi pusat penyimpanan dan pengelolaan seluruh aktivitas tersebut.

## 2.2 Product Vision

Menjadi personal technical knowledge workspace yang mengintegrasikan research management, project tracking, experiment tracking, documentation, dan knowledge organization dalam satu platform.

## 2.3 Primary Objectives

1. Mengorganisasi seluruh aktivitas research dan engineering.
2. Mencatat progress dan milestone setiap research/project.
3. Menyimpan hasil eksperimen, termasuk kegagalan dan troubleshooting.
4. Membuat dokumentasi teknis yang terstruktur.
5. Menghubungkan dokumentasi dengan research, project, dan checkpoint.
6. Memudahkan pencarian kembali informasi teknis.
7. Menyediakan fondasi untuk pengembangan AI research assistant pada fase berikutnya.

## 2.4 Target User

Primary user: Individual Research & Development Engineer.

Contoh domain pekerjaan:

- Cybersecurity Research
- Firmware Analysis
- Reverse Engineering
- Satellite Security Research
- Hardware Engineering
- RF & Wireless Research
- Networking
- Embedded Systems
- Software Engineering
- Infrastructure Engineering
- CCTV & Video Streaming Systems

---

# 3. Product Scope

## 3.1 Phase 1 — Core Workspace

Phase 1 mencakup enam modul utama:

1. Dashboard
2. Research Management
3. Project Management
4. Checkpoint System
5. Documentation Editor
6. Search & Attachments

## 3.2 Out of Scope Phase 1

- AI assistant dan AI-generated documentation.
- Multi-agent system.
- Team collaboration.
- Real-time collaborative editing.
- Knowledge graph visualization.
- Advanced device and firmware registry.
- Advanced command library.
- Automated experiment execution.
- External integrations.

**Prinsip:** seluruh fungsi utama FORNIX Phase 1 harus berjalan tanpa LLM, AI API, maupun layanan AI eksternal.

---

# 4. Technology Stack (Locked)

## 4.1 Frontend

| Component | Technology |
|---|---|
| Framework | Angular |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Angular Material + Custom Components |
| Rich Text Editor | Tiptap + ProseMirror |
| State Management | Angular Signals |
| Forms | Angular Reactive Forms |
| Routing | Angular Router |
| API Client | Angular HttpClient |

Catatan: integrasi Tiptap dengan Angular harus divalidasi melalui prototype teknis sebelum implementasi editor penuh.

## 4.2 Backend

| Component | Technology |
|---|---|
| Framework | NestJS |
| Language | TypeScript |
| API | REST API |
| API Versioning | `/api/v1` |
| API Documentation | Swagger / OpenAPI |
| Validation | class-validator |
| Transformation | class-transformer |

## 4.3 Database & Storage

| Component | Technology |
|---|---|
| Database | MongoDB |
| ODM | Mongoose |
| File Storage | S3-compatible Storage |
| Local Object Storage | MinIO |

## 4.4 Authentication

- JWT access token.
- Refresh token.
- Refresh token rotation.
- Refresh token revocation.
- Secure token storage.
- Password hashing.

## 4.5 Infrastructure

| Component | Technology |
|---|---|
| Containerization | Docker |
| Orchestration | Docker Compose |
| Reverse Proxy | Nginx |
| Deployment | VPS / Linux Server |
| Optional Cache | Redis |

Redis bukan dependency wajib Phase 1.

## 4.6 Testing

- Unit testing: Jest.
- E2E testing: Playwright.
- API integration testing.
- Frontend build validation.
- Security and authorization testing.

---

# 5. Application Architecture

## 5.1 High-Level Architecture

Angular Frontend → HTTPS REST API → NestJS Backend → MongoDB + Object Storage.

### Frontend Responsibilities

- User interface.
- Routing and navigation.
- Form handling.
- Client-side state.
- Rich text editor.
- API communication.
- Responsive layout.

### Backend Responsibilities

- Business logic.
- Authentication and authorization.
- Research and project management.
- Checkpoint and progress calculations.
- Documentation management.
- File coordination.
- Search.
- Data validation.

## 5.2 Repository Structure

```text
fornix/
├── frontend/
├── backend/
├── infrastructure/
│   ├── nginx/
│   ├── docker/
│   └── storage/
├── docker-compose.yml
├── .env.example
├── README.md
└── .gitignore
```

### Frontend

```text
frontend/src/app/
├── core/
│   ├── auth/
│   ├── guards/
│   ├── interceptors/
│   └── services/
├── shared/
│   ├── components/
│   ├── directives/
│   └── pipes/
├── features/
│   ├── dashboard/
│   ├── research/
│   ├── projects/
│   ├── checkpoints/
│   ├── documentation/
│   ├── search/
│   └── archive/
├── layouts/
└── app.routes.ts
```

### Backend

```text
backend/src/
├── auth/
├── users/
├── research/
├── projects/
├── checkpoints/
├── progress-entries/
├── documentations/
├── attachments/
├── search/
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   └── pipes/
├── database/
├── config/
├── app.module.ts
└── main.ts
```

Setiap domain module minimal memiliki Controller, Service, DTO, Schema, dan test. Business logic tidak boleh ditempatkan di Controller.

---

# 6. Navigation & User Experience

## 6.1 Desktop Navigation

Sidebar:

- Overview
- Research
- Projects
- Documentation
- Checkpoints
- Archive
- Settings

Header:

- Global Search
- Quick Capture
- User Profile

## 6.2 Mobile Navigation

Bottom navigation:

- Home
- Research
- Capture
- Docs
- Projects

Checkpoint, Archive, dan Settings tersedia melalui additional menu.

## 6.3 Design Direction

FORNIX menggunakan pendekatan Hybrid Workspace:

- Notion: simplicity dan content organization.
- Linear: progress tracking dan workflow.
- Obsidian: knowledge organization.
- GitBook: technical documentation reading experience.

Karakter desain:

- Minimalist.
- Technical.
- Professional.
- Clean typography.
- Tidak menyerupai dashboard admin yang terlalu padat.

## 6.4 Visual Identity

- Default theme: Light.
- Optional theme: Dark.
- Primary accent: Blue / Indigo.
- Typography: Inter atau Geist.
- Icon system: Lucide.
- Styling: Tailwind CSS.
- Component system: Angular Material dan custom components.

## 6.5 Responsive Requirements

Target:

- Mobile: 360–430px.
- Tablet: responsive.
- Desktop: 1440px.

Mobile harus mendukung navigation, Quick Capture, editing, autosave, search, attachment upload, dan pembacaan dokumentasi tanpa horizontal scrolling yang tidak diperlukan.

---

# 7. Functional Requirements

## 7.1 Dashboard

Dashboard menampilkan:

- Total Research.
- Active Projects.
- Active Checkpoints.
- Recent Activities.
- Recently Updated Documents.
- Research Progress.
- Project Progress.
- Quick Capture.

Dashboard harus memprioritaskan informasi yang relevan untuk aktivitas R&D, bukan sekadar angka statistik.

## 7.2 Research Management

Research merupakan wadah untuk aktivitas investigasi atau penelitian teknis.

### Research Fields

- title
- slug
- description
- objective
- category
- status
- priority
- tags
- startDate
- targetDate
- progress
- ownerId
- createdAt
- updatedAt

### Research Status

- Idea
- Planned
- In Progress
- On Hold
- Completed
- Archived

### Initial Categories

- Cybersecurity
- Hardware
- Firmware
- Reverse Engineering
- Networking
- Embedded Systems
- Software
- Infrastructure
- Other

### Research Detail Tabs

- Overview
- Checkpoints
- Documentation
- Activity
- Files

Progress dihitung berdasarkan checkpoint yang terkait dengan research.

## 7.3 Project Management

Project digunakan untuk mengelola implementasi atau pekerjaan teknis yang memiliki tujuan dan hasil tertentu.

### Project Fields

- title
- description
- objective
- category
- status
- priority
- tags
- startDate
- targetDate
- progress
- ownerId
- createdAt
- updatedAt

### Project Status

- Planning
- In Progress
- On Hold
- Completed
- Cancelled
- Archived

### Project Detail Tabs

- Overview
- Checkpoints
- Documentation
- Activity
- Files

Research dan Project merupakan dua entitas berbeda, tetapi dapat menggunakan sistem checkpoint dan dokumentasi yang sama.

## 7.4 Checkpoint System

Checkpoint merupakan milestone penting dalam proses research atau project.

Progress Entry merupakan catatan aktivitas, temuan, eksperimen, dan informasi yang terjadi dalam sebuah checkpoint.

Struktur:

```text
Research: Firmware Analysis

├── CP-001 Initial Investigation
│   ├── Device Identification
│   ├── Firmware Collection
│   └── Specification Review
│
├── CP-002 Firmware Extraction
│   ├── Binwalk Testing
│   ├── Extraction Error
│   └── Alternative Method
│
└── CP-003 Binary Analysis
    ├── Binary Identification
    └── Initial Findings
```

### Checkpoint Fields

- code (auto-generated)
- title
- description
- parentType
- parentId
- objective
- status
- outcome
- progress
- weight (optional)
- startDate
- targetDate
- ownerId
- createdAt
- updatedAt

### Checkpoint Status

- Draft
- Planned
- In Progress
- Blocked
- Completed
- Cancelled
- On Hold

### Checkpoint Outcome

- Not Evaluated
- Success
- Partial
- Failed
- Inconclusive

Status dan Outcome adalah dua hal berbeda.

Contoh: checkpoint dapat memiliki status Completed dengan outcome Failed. Artinya eksperimen telah selesai, tetapi metode yang diuji tidak berhasil.

Eksperimen yang gagal tetap harus mempertahankan progress, dokumentasi, attachment, dan seluruh hasil investigasinya.

### Checkpoint Creation

Tiga metode pembuatan:

**Quick Checkpoint**
- Title.
- Description.
- Status.
- Optional attachment.

**Detailed Checkpoint**
- Title.
- Objective.
- Methodology.
- Expected Result.
- Tools.
- Initial Notes.

**Branch Checkpoint**
- Parent Checkpoint.
- Title.
- Description.
- Methodology.
- Relation Type.

Advanced branching dan alternative checkpoint management dikembangkan lebih lanjut pada Phase 2.

## 7.5 Progress Entry

Progress Entry digunakan untuk mencatat aktivitas kecil di dalam checkpoint.

### Fields

- title
- content
- entryType
- occurredAt
- tools
- attachments
- ownerId
- createdAt

### Entry Types

- Activity
- Finding
- Experiment
- Issue
- Note
- Decision

Requirements:

- Chronological timeline.
- Rich text content.
- Attachment support.
- Timestamp.
- Tidak otomatis mengubah status checkpoint.
- Riwayat eksperimen gagal harus tetap tersedia.

## 7.6 Documentation Editor

Documentation Editor adalah salah satu fitur utama FORNIX.

Editor harus mendukung:

### Text Formatting

- Heading H1–H3.
- Paragraph.
- Bold.
- Italic.
- Bullet list.
- Numbered list.
- Checklist.
- Blockquote.
- Callout.
- Divider.

### Technical Content

- Inline code.
- Code blocks.
- Syntax highlighting.
- Language selector.
- Copy code button.
- Monospace formatting.
- Horizontal scrolling.
- Tables.

Initial supported languages:

- Bash
- Python
- JavaScript
- TypeScript
- PHP
- JSON
- YAML
- SQL
- C/C++

### Media & References

- Image embedding.
- File attachment.
- Internal links.
- Related Research.
- Related Project.
- Related Checkpoint.

### Documentation Metadata

- title
- content
- category
- tags
- parentType
- parentId
- checkpointId
- status
- ownerId
- createdAt
- updatedAt

### Documentation Status

- Draft
- Published
- Archived

Dokumentasi dapat berdiri sendiri atau terhubung ke Research, Project, maupun Checkpoint.

### Editing Experience

Dua mode:

- Read Mode.
- Edit Mode.

Autosave requirements:

- Save setelah jeda pengetikan.
- Saving indicator.
- Saved indicator.
- Save Failed indicator.
- Local draft persistence saat koneksi terputus.
- Safe conflict handling.

Full version history dikembangkan pada Phase 2.

## 7.7 Search

Global Search harus dapat mencari:

- Research.
- Projects.
- Checkpoints.
- Progress Entries.
- Documentation.

Searchable fields:

- Title.
- Description.
- Tags.
- Documentation content.

Requirements:

- Search by keyword.
- Filter by type.
- Filter by category.
- Filter by status.
- Pagination.
- Relevant MongoDB indexes.
- Tidak melakukan full collection scan untuk setiap pencarian.

## 7.8 Attachments

Supported formats:

- PNG
- JPG/JPEG
- WEBP
- PDF
- TXT
- MD
- JSON
- YAML
- ZIP
- LOG
- CSV

Attachment dapat terhubung ke:

- Research.
- Project.
- Checkpoint.
- Progress Entry.
- Documentation.

Requirements:

- Upload.
- Download.
- Image preview.
- PDF preview jika didukung.
- File metadata.
- File size validation.
- MIME/type validation.
- Secure file access.
- Delete confirmation.

Binary file disimpan di object storage. MongoDB hanya menyimpan metadata dan storage key.

---

# 8. Progress Calculation

Checkpoint memiliki progress manual antara 0–100%.

Research dan Project menggunakan weighted average apabila checkpoint memiliki weight.

Jika tidak ada weight, gunakan simple average dari checkpoint yang eligible.

Rules:

- Cancelled checkpoint dikecualikan secara default.
- Draft dapat dikecualikan.
- Blocked tetap mempertahankan progress.
- Failed outcome tidak mereset progress.
- Backend menjadi sumber perhitungan utama.
- Dashboard dan detail page harus menggunakan hasil perhitungan yang konsisten.

---

# 9. Database Design

MongoDB collections:

1. users
2. research
3. projects
4. checkpoints
5. progress_entries
6. documentations
7. attachments
8. activity_logs

Database rules:

- Gunakan ObjectId references.
- Setiap resource memiliki ownerId.
- Gunakan timestamps.
- Buat indexes berdasarkan query patterns.
- Archive menggunakan soft delete/status.
- Validasi parent-child references.
- Validasi ownership.
- Binary tidak disimpan di MongoDB.

Multi-document atomic operations menggunakan MongoDB transactions hanya apabila deployment mendukung replica set. MongoDB standalone tidak mendukung multi-document transactions.

---

# 10. API Specification

Base prefix:

`/api/v1`

## Authentication

- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/refresh`
- POST `/auth/logout`
- GET `/auth/me`

## Research

CRUD `/research`

## Projects

CRUD `/projects`

## Checkpoints

CRUD `/checkpoints`

## Progress Entries

- GET `/checkpoints/:id/entries`
- POST `/checkpoints/:id/entries`
- GET `/entries/:id`
- PATCH `/entries/:id`
- DELETE `/entries/:id`

## Documentation

CRUD `/documentations`

## Attachments

CRUD `/attachments`

## Search

GET `/search?q=...`

API requirements:

- Authentication.
- Ownership authorization.
- DTO validation.
- Pagination.
- Standardized error response.
- Rate limiting where relevant.
- Swagger/OpenAPI documentation.

---

# 11. Security Requirements

- Password hashing.
- Short-lived access token.
- Refresh token rotation.
- Refresh token revocation.
- Secure token storage.
- Resource ownership validation.
- File upload validation.
- Secure attachment access.
- Secrets stored in environment variables.
- Security headers.
- Rate limiting.
- Backup and restore procedures.

FORNIX tidak boleh menyimpan plaintext credentials di dokumentasi biasa. Informasi sensitif harus ditangani dengan mekanisme keamanan yang sesuai.

---

# 12. Deployment Architecture

Docker Compose services:

1. Angular Frontend.
2. NestJS Backend.
3. MongoDB.
4. MinIO / S3-compatible storage.
5. Nginx.

Redis bersifat optional.

Deployment requirements:

- Persistent volumes.
- Health checks.
- Restart policies.
- Structured logs.
- Backup and restore.
- HTTPS in production.
- Environment-based configuration.

Example environment variables:

```env
NODE_ENV=
FRONTEND_URL=
API_BASE_URL=
MONGODB_URI=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

MAX_UPLOAD_SIZE=
```

Secrets tidak boleh masuk ke repository.

---

# 13. Implementation Roadmap

## Phase 1.1 — Foundation

- Initialize Angular project.
- TypeScript strict mode.
- Tailwind CSS.
- Angular Material/custom component setup.
- NestJS initialization.
- MongoDB + Mongoose integration.
- Authentication.
- Docker Compose.
- Repository structure.
- Base design system.
- Swagger.
- Validation framework.

## Phase 1.2 — Dashboard & Workspace

- Dashboard.
- Desktop navigation.
- Mobile navigation.
- Research CRUD.
- Project CRUD.
- Detail pages.
- Status management.
- Archive.

## Phase 1.3 — Checkpoint Engine

- Checkpoint CRUD.
- Quick Checkpoint.
- Detailed Checkpoint.
- Progress Entry.
- Status and outcome.
- Chronological timeline.
- Progress calculation.

## Phase 1.4 — Documentation Engine

- Tiptap integration.
- Formatting.
- Code blocks.
- Syntax highlighting.
- Tables.
- Images.
- Internal links.
- Autosave.
- Read Mode.
- Edit Mode.
- Metadata.

## Phase 1.5 — Search & Attachments

- Global search.
- Search indexing.
- Attachment uploads.
- File previews.
- File linking.
- Access control.

## Phase 1.6 — Testing & Stabilization

- Unit tests.
- Integration tests.
- UI tests.
- Responsive testing.
- Authorization testing.
- File security testing.
- Data integrity testing.
- Backup and restore testing.
- Production deployment.

---

# 14. Acceptance Criteria

Phase 1 dinyatakan selesai apabila:

1. User dapat melakukan registrasi dan login.
2. User dapat membuat dan mengelola Research.
3. User dapat membuat dan mengelola Projects.
4. Research dan Project dapat memiliki Checkpoints.
5. Checkpoint dapat memiliki Progress Entries.
6. Status dan Outcome bekerja secara terpisah.
7. Progress calculation konsisten.
8. User dapat membuat dan mengedit dokumentasi teknis.
9. Editor mendukung technical code blocks.
10. Autosave dan error handling berjalan.
11. File dapat di-upload dan diakses secara aman.
12. Global Search dapat menemukan informasi yang relevan.
13. Data tetap tersedia setelah restart service.
14. Backup dan restore telah diuji.
15. Tidak ada critical authorization vulnerability.
16. Seluruh modul utama dapat digunakan pada desktop dan mobile.
17. Tidak ada dependency AI untuk menjalankan fitur Phase 1.

---

# 15. Future Development

## Phase 2 — Advanced Knowledge Management

- Methodology Management.
- Alternative/Parallel Checkpoints.
- Checkpoint Relation Graph.
- Revision History.
- Advanced Documentation Library.
- Device & Firmware Registry.
- Command Library.
- Advanced Search.
- Idea Inbox.
- Markdown Export.
- Knowledge Backup/Export.

## Phase 3 — AI Research Workspace

- AI Documentation Assistant.
- Research Summarization.
- Finding Analysis.
- Knowledge Retrieval.
- Research Planning.
- Technical Advisor.
- Context-aware Research Assistant.

AI harus berfungsi sebagai pendukung analisis dan pengambilan informasi, bukan menggantikan kontrol user terhadap data.

---

# 16. Product Principles

Seluruh pengembangan FORNIX harus mengikuti prinsip berikut:

1. **Documentation First** — setiap research dan eksperimen harus dapat didokumentasikan.
2. **Preserve Failure** — kegagalan adalah bagian dari pengetahuan dan tidak boleh dihapus dari histori.
3. **Structured Knowledge** — informasi harus dapat dihubungkan dan ditemukan kembali.
4. **User Control** — user memiliki kontrol terhadap data dan perubahan.
5. **Engineering Focus** — fitur harus mendukung pekerjaan teknis, bukan sekadar menambah kompleksitas.
6. **AI Optional** — fungsi inti harus tetap berjalan tanpa AI.
7. **Future-ready Architecture** — arsitektur harus dapat dikembangkan tanpa membangun ulang fondasi utama.

---

**Final Product Identity**

# FORNIX
### Engineer Your Knowledge.

Personal Research & Development Workspace.

**PRD Version 1.2 — Product Name & Brand Identity Updated.**
# FORNIX UI/UX Audit — 5 Nov 2026

Method: Playwright Chromium headless crawl (`frontend/e2e/ui-ux-audit.spec.ts`)  
Viewports: desktop 1280×800, mobile 390×844  
Screenshots: `frontend/test-results/ui-ux-audit/`  
Against: `DESIGN.md` (ENERGY 1 / RHYTHM 2 / MOTION 1) + Phase 1 acceptance (desktop + mobile usable)

## Follow-up (same day)

P0–P1 applied and re-crawled (`npx playwright test e2e/ui-ux-audit.spec.ts`, 2 passed):

- Material outline notch CSS vs Tailwind preflight; primary indigo CTAs
- Mobile shell padding + Checks in bottom nav; Sign out only in sidebar (desktop) / topbar (mobile)
- Lucide on shell nav + dashboard quick actions
- Dashboard: Continue stays; duplicate recent columns replaced with browse links

Still open (P2): form visual language vs auth/dashboard rhythm; thinner list pages; docs editor smoke.

## Verdict

**Belum fully sesuai.** Auth + dashboard empty/filled sudah naik kelas. Shell CRUD (form/list/detail), Material field rendering, mobile overflow, dan konsistensi visual masih di bawah bar DESIGN.md / UX yang nyaman.

Overall score (rough): **6.5 / 10** → after P0–P1 pass ~**7.5 / 10**


| Area | Status |
|---|---|
| Login / Register desktop | Mostly OK |
| Login / Register mobile | Needs work (Material label look) |
| Dashboard empty + filled | Mostly OK |
| Research / Project / Docs forms | Not OK (basic + broken-looking fields) |
| Detail pages | Thin but usable |
| Search | Usable, sparse |
| Mobile shell | Partial fail (overlap + incomplete nav) |
| Design system consistency | Not OK |

---

## What already fits

1. **Auth desktop** — brand hero + form split; FORNIX + tagline jelas; indigo dari DESIGN.md; Show password; CTAs jelas.
2. **Dashboard empty** — greeting, copy kosong yang actionable, 3-step onboarding.
3. **Dashboard filled** — quick actions, pulse metrics, Continue, recent lists + progress bars; data real (bukan fake feed).
4. **Search** — query `SPI` menemukan research; type filter ada.
5. **Sidebar desktop** — nav lengkap, active state terbaca.
6. **Palette** — netral + indigo; bukan purple-glow / cream-terracotta slop defaults.

---

## Gaps (prioritas)

### P0 — Rusak / menghalangi

1. **Material outline labels terlihat “patah”**  
   Di form research/docs/login mobile, label sering tampak sebagai blok kiri + garis vertikal di dalam field (bukan floating outline bersih). Ini konflik klasik Tailwind preflight × Angular Material.  
   **Impact:** form terasa murahan dan membingungkan.

2. **Mobile bottom nav menabrak konten**  
   Screenshot `m02-dashboard-mobile`: step 3 onboarding terpotong oleh bottom nav.  
   **Fix:** tambah `padding-bottom` di `.content` cukup untuk tinggi nav (+ safe area).

3. **Primary CTA kadang terlihat disabled (abu)**  
   “Create research” / “Create and edit” tampak grey di screenshot meski seharusnya primary indigo.  
   **Impact:** user ragu apakah bisa submit.

### P1 — UX kurang nyaman

4. **Sign out dobel** — sidebar + topbar. Cukup satu (sidebar desktop; topbar mobile).

5. **Dashboard: Continue ≈ Recent** — item yang sama muncul dua kali. Continue OK; recent sections bisa dipangkas atau dibedakan (mis. hanya research+projects di bawah).

6. **Mobile nav tidak lengkap** — Home / Research / Projects / Docs / Search. Checkpoints & Archive tidak ada → PRD “modul utama usable on mobile” masih longgar.

7. **Global search + page search** di `/search` terasa redundant tanpa perbedaan peran yang jelas.

8. **DESIGN.md Icons = Lucide** — belum dipakai di UI; shell/dashboard masih text-only → kurang affordance.

### P2 — Polish / konsistensi

9. **RHYTHM** — auth (brand plane) vs shell pages (Material forms) vs dashboard (custom panels) masih tiga bahasa visual.

10. **List pages** (projects/checkpoints/docs) masih sangat tipis: sedikit hierarchy, sedikit empty guidance selain teks pendek.

11. **Docs detail** di audit crawl menangkap form create, bukan editor Tiptap penuh — perlu smoke terpisah untuk read/edit/autosave UI.

12. **A11y selector quirk** — `getByLabel('Password')` bentrok dengan tombol “Show password” (Material field). Tombol punya `aria-label` sendiri; tetap perlu dicek di screen reader.

---

## Checklist vs DESIGN.md

| Expectation | Result |
|---|---|
| Light theme, indigo accent | Pass |
| Geist Sans | Pass (loaded) |
| Not dense admin dashboard | Pass on overview; forms still “admin form” |
| Lucide icons | Fail (unused) |
| ENERGY 1 | Pass |
| RHYTHM 2 | Partial |
| MOTION 1 | Pass (no endless motion) |

---

## Rekomendasi urutan fix

1. Fix Material × Tailwind field styles (global).
2. Mobile content padding + nav “More” (Checkpoints/Archive).
3. Dedupe Sign out; restore primary button color contrast.
4. Soften dashboard duplication (Continue vs Recent).
5. Introduce Lucide sparingly on nav / quick actions / empty states.
6. Pass kedua: research detail (checkpoints list, attachments), docs editor read/edit.

---

## Artefacts

- Screenshots: `frontend/test-results/ui-ux-audit/*.png`
- Crawl: `npx playwright test e2e/ui-ux-audit.spec.ts`

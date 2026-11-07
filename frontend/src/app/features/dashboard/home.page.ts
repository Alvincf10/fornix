import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {
  LucideDynamicIcon,
  LucideFileText,
  LucideFlaskConical,
  LucideFolderKanban,
  LucideSearch,
  type LucideIcon,
} from '@lucide/angular';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardApi } from '../../core/services/dashboard.api';
import {
  CheckpointItem,
  DashboardOverview,
  DocumentationItem,
  ProjectItem,
  ResearchItem,
} from '../../core/models/workspace.models';

type ContinueItem = {
  kind: 'research' | 'project' | 'checkpoint' | 'doc';
  id: string;
  title: string;
  meta: string;
  progress?: number;
  updatedAt: string;
  link: string[];
};

type QuickAction = {
  path: string;
  label: string;
  hint: string;
  icon: LucideIcon;
};

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, MatButtonModule, LucideDynamicIcon],
  template: `
    <section class="page">
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      } @else if (!data()) {
        <div class="loading" aria-busy="true">
          <p class="muted">Loading your workspace…</p>
        </div>
      } @else {
        <header class="hero">
          <div class="hero-copy">
            <p class="eyebrow">{{ greeting() }}</p>
            <h1>{{ displayName() }}</h1>
            <p class="lede">{{ summaryLine() }}</p>
          </div>
          <div class="hero-actions">
            <a mat-flat-button color="primary" routerLink="/research/new">New research</a>
            <a mat-stroked-button routerLink="/projects/new">New project</a>
          </div>
        </header>

        @if (isEmpty()) {
          <section class="empty" aria-labelledby="empty-title">
            <h2 id="empty-title">Start your workspace</h2>
            <p class="muted">
              FORNIX works best when research, checkpoints, and docs stay linked.
              Three steps get you moving:
            </p>
            <ol class="steps">
              <li>
                <a routerLink="/research/new">Open a research thread</a>
                <span>Capture the question you are investigating.</span>
              </li>
              <li>
                <a routerLink="/checkpoints/new">Add a checkpoint</a>
                <span>Log what you tried — including what failed.</span>
              </li>
              <li>
                <a routerLink="/docs/new">Write a technical note</a>
                <span>Keep commands, dumps, and findings searchable.</span>
              </li>
            </ol>
          </section>
        } @else {
          <nav class="quick" aria-label="Quick actions">
            @for (action of quickActions; track action.path) {
              <a class="quick-link" [routerLink]="action.path">
                <svg lucideIcon [lucideIcon]="action.icon" [size]="18" aria-hidden="true"></svg>
                <span class="quick-label">{{ action.label }}</span>
                <span class="quick-hint">{{ action.hint }}</span>
              </a>
            }
          </nav>

          <section class="pulse" aria-label="Workspace pulse">
            <a class="pulse-item" routerLink="/research">
              <span class="pulse-value">{{ data()!.totals.activeResearch }}</span>
              <span class="pulse-label">Active research</span>
              <span class="pulse-sub">of {{ data()!.totals.research }} total</span>
            </a>
            <a class="pulse-item" routerLink="/projects">
              <span class="pulse-value">{{ data()!.totals.activeProjects }}</span>
              <span class="pulse-label">Active projects</span>
              <span class="pulse-sub">implementation tracks</span>
            </a>
            <a class="pulse-item" routerLink="/checkpoints">
              <span class="pulse-value">{{ data()!.totals.activeCheckpoints }}</span>
              <span class="pulse-label">Open checkpoints</span>
              <span class="pulse-sub">in progress or blocked</span>
            </a>
            <a class="pulse-item" routerLink="/docs">
              <span class="pulse-value">{{ data()!.totals.documents ?? data()!.recentDocuments.length }}</span>
              <span class="pulse-label">Documents</span>
              <span class="pulse-sub">notes &amp; write-ups</span>
            </a>
          </section>

          @if (continueItems().length > 0) {
            <section class="continue" aria-labelledby="continue-title">
              <div class="section-head">
                <h2 id="continue-title">Continue</h2>
                <p class="section-lede">Most recently touched items.</p>
              </div>
              <ul class="continue-list">
                @for (item of continueItems(); track item.kind + item.id) {
                  <li>
                    <a [routerLink]="item.link" class="continue-row">
                      <span class="kind">{{ kindLabel(item.kind) }}</span>
                      <span class="continue-main">
                        <span class="continue-title">{{ item.title }}</span>
                        <span class="continue-meta">{{ item.meta }} · {{ relative(item.updatedAt) }}</span>
                      </span>
                      @if (item.progress !== undefined) {
                        <span class="continue-progress" [attr.aria-label]="item.progress + '% complete'">
                          {{ item.progress }}%
                        </span>
                      }
                    </a>
                    @if (item.progress !== undefined) {
                      <div class="bar" aria-hidden="true">
                        <span [style.width.%]="item.progress"></span>
                      </div>
                    }
                  </li>
                }
              </ul>
            </section>
          }

          <nav class="browse" aria-label="Browse workspace">
            <a routerLink="/research">All research</a>
            <a routerLink="/projects">All projects</a>
            <a routerLink="/checkpoints">All checkpoints</a>
            <a routerLink="/docs">All docs</a>
          </nav>
        }

      }
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 1.75rem;
        max-width: 58rem;
      }

      .hero {
        display: flex;
        flex-wrap: wrap;
        gap: 1.25rem;
        justify-content: space-between;
        align-items: end;
        padding-bottom: 0.25rem;
        border-bottom: 1px solid var(--fx-line);
      }

      .eyebrow {
        margin: 0;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--fx-accent);
      }

      h1 {
        margin: 0.35rem 0 0;
        font-size: clamp(1.65rem, 3vw, 2rem);
        letter-spacing: -0.03em;
        line-height: 1.15;
      }

      h2 {
        margin: 0;
        font-size: 1.05rem;
      }

      .lede,
      .muted,
      .section-lede {
        margin: 0.45rem 0 0;
        color: var(--fx-ink-muted);
        line-height: 1.45;
      }

      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .quick {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.65rem;
      }

      @media (min-width: 720px) {
        .quick {
          grid-template-columns: repeat(4, 1fr);
        }
      }

      .quick-link {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto auto;
        column-gap: 0.55rem;
        row-gap: 0.15rem;
        align-items: center;
        padding: 0.85rem 0.9rem;
        border: 1px solid var(--fx-line);
        border-radius: var(--fx-radius-control);
        background: var(--fx-paper-raised);
        text-decoration: none;
        color: inherit;
        transition: border-color 120ms ease, background 120ms ease;
      }

      .quick-link svg {
        grid-row: 1 / span 2;
        color: var(--fx-accent);
      }

      .quick-link:hover {
        border-color: #c7d2fe;
        background: var(--fx-accent-soft);
      }

      .quick-label {
        font-weight: 650;
        font-size: 0.92rem;
      }


      .quick-hint {
        font-size: 0.78rem;
        color: var(--fx-ink-muted);
      }

      .pulse {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.65rem;
      }

      @media (min-width: 800px) {
        .pulse {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }

      .pulse-item {
        display: grid;
        gap: 0.15rem;
        padding: 0.95rem 1rem;
        border-left: 3px solid var(--fx-accent);
        background: var(--fx-paper-raised);
        border-top: 1px solid var(--fx-line);
        border-right: 1px solid var(--fx-line);
        border-bottom: 1px solid var(--fx-line);
        border-radius: 0 var(--fx-radius-control) var(--fx-radius-control) 0;
        text-decoration: none;
        color: inherit;
      }

      .pulse-item:hover {
        background: #f8fafc;
      }

      .pulse-value {
        font-size: 1.55rem;
        font-weight: 700;
        letter-spacing: -0.03em;
        line-height: 1;
      }

      .pulse-label {
        margin-top: 0.35rem;
        font-size: 0.86rem;
        font-weight: 600;
      }

      .pulse-sub {
        font-size: 0.75rem;
        color: var(--fx-ink-muted);
      }

      .continue,
      .empty {
        display: grid;
        gap: 0.75rem;
      }

      .empty {
        padding: 1.25rem 1.15rem;
        margin-bottom: 0.5rem;
        border: 1px dashed #c7d2fe;
        border-radius: var(--fx-radius-panel);
        background: linear-gradient(180deg, #eef2ff 0%, var(--fx-paper-raised) 55%);
      }

      @media (max-width: 899px) {
        .hero {
          gap: 0.85rem;
        }

        .hero h1 {
          font-size: 1.55rem;
        }

        .lede {
          font-size: 0.92rem;
        }

        .empty {
          padding: 1rem 0.95rem;
        }

        .steps {
          gap: 0.65rem;
        }

        .steps span {
          font-size: 0.82rem;
        }
      }


      .browse {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem 1rem;
      }

      .browse a {
        color: var(--fx-accent-strong);
        font-size: 0.9rem;
        font-weight: 600;
        text-decoration: none;
      }

      .browse a:hover {
        text-decoration: underline;
      }


      .steps {
        margin: 0.5rem 0 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 0.85rem;
        counter-reset: step;
      }

      .steps li {
        display: grid;
        gap: 0.2rem;
        padding-left: 2.1rem;
        position: relative;
        counter-increment: step;
      }

      .steps li::before {
        content: counter(step);
        position: absolute;
        left: 0;
        top: 0.1rem;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 999px;
        background: var(--fx-accent);
        color: #fff;
        font-size: 0.75rem;
        font-weight: 700;
        display: grid;
        place-items: center;
      }

      .steps a {
        font-weight: 650;
        color: var(--fx-accent-strong);
        text-decoration: none;
      }

      .steps a:hover {
        text-decoration: underline;
      }

      .steps span {
        color: var(--fx-ink-muted);
        font-size: 0.88rem;
      }

      .section-head.row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 0.75rem;
        margin-bottom: 0.65rem;
      }

      .section-head.row a {
        color: var(--fx-accent-strong);
        font-size: 0.85rem;
        font-weight: 600;
        text-decoration: none;
      }

      .continue-list,
      .entity-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.55rem;
      }

      .continue-list li {
        border: 1px solid var(--fx-line);
        border-radius: var(--fx-radius-control);
        background: var(--fx-paper-raised);
        overflow: hidden;
      }

      .continue-row {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 0.75rem;
        align-items: center;
        padding: 0.8rem 0.9rem 0.55rem;
        text-decoration: none;
        color: inherit;
      }

      .kind {
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--fx-accent);
      }

      .continue-main {
        display: grid;
        gap: 0.15rem;
        min-width: 0;
      }

      .continue-title,
      .entity-title {
        font-weight: 650;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .continue-meta,
      .entity-meta,
      .entity-foot {
        font-size: 0.8rem;
        color: var(--fx-ink-muted);
      }

      .continue-progress {
        font-size: 0.85rem;
        font-weight: 650;
        font-variant-numeric: tabular-nums;
      }

      .bar {
        display: block;
        height: 0.28rem;
        margin: 0 0.9rem 0.7rem;
        border-radius: 999px;
        background: var(--fx-line);
        overflow: hidden;
      }

      .entity .bar {
        margin: 0.45rem 0 0.25rem;
      }

      .bar > span {
        display: block;
        height: 100%;
        background: var(--fx-accent);
        border-radius: inherit;
      }

      .columns {
        display: grid;
        gap: 1.35rem;
      }

      @media (min-width: 900px) {
        .columns {
          grid-template-columns: 1fr 1fr;
        }
      }

      .entity {
        display: grid;
        gap: 0.25rem;
        padding: 0.85rem 0.9rem;
        border: 1px solid var(--fx-line);
        border-radius: var(--fx-radius-control);
        background: var(--fx-paper-raised);
        text-decoration: none;
        color: inherit;
      }

      .entity:hover {
        border-color: #c7d2fe;
      }

      .entity-top {
        display: flex;
        gap: 0.5rem;
        justify-content: space-between;
        align-items: start;
      }

      .chip {
        flex: none;
        padding: 0.12rem 0.45rem;
        border-radius: 0.25rem;
        background: var(--fx-accent-soft);
        color: var(--fx-accent-strong);
        font-size: 0.7rem;
        font-weight: 650;
        white-space: nowrap;
      }

      .pad {
        padding: 0.5rem 0;
      }

      .error {
        color: #b91c1c;
      }

      .loading {
        padding: 2rem 0;
      }
    `,
  ],
})
export class HomePage implements OnInit {
  private readonly dashboardApi = inject(DashboardApi);
  private readonly auth = inject(AuthService);

  readonly data = signal<DashboardOverview | null>(null);
  readonly error = signal<string | null>(null);

  readonly quickActions: QuickAction[] = [
    {
      path: '/research/new',
      label: 'Research',
      hint: 'Start an investigation',
      icon: LucideFlaskConical,
    },
    {
      path: '/projects/new',
      label: 'Project',
      hint: 'Track implementation',
      icon: LucideFolderKanban,
    },
    {
      path: '/docs/new',
      label: 'Doc',
      hint: 'Write a technical note',
      icon: LucideFileText,
    },
    {
      path: '/search',
      label: 'Search',
      hint: 'Find across the workspace',
      icon: LucideSearch,
    },
  ];


  readonly displayName = computed(
    () => this.auth.user()?.displayName?.trim() || 'Workspace',
  );

  readonly isEmpty = computed(() => {
    const d = this.data();
    if (!d) return false;
    return (
      d.totals.research === 0 &&
      d.totals.activeProjects === 0 &&
      d.totals.activeCheckpoints === 0 &&
      (d.totals.documents ?? d.recentDocuments.length) === 0
    );
  });

  readonly continueItems = computed(() => {
    const d = this.data();
    if (!d) return [] as ContinueItem[];

    const items: ContinueItem[] = [
      ...d.recentResearch.map((r) => this.fromResearch(r)),
      ...d.recentProjects.map((p) => this.fromProject(p)),
      ...(d.recentCheckpoints ?? []).map((c) => this.fromCheckpoint(c)),
      ...d.recentDocuments.map((doc) => this.fromDoc(doc)),
    ];

    return items
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
      .slice(0, 4);
  });

  ngOnInit() {
    this.dashboardApi.overview().subscribe({
      next: (overview) => this.data.set(overview),
      error: () => this.error.set('Could not load the dashboard.'),
    });
  }

  greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  summaryLine(): string {
    const d = this.data();
    if (!d) return '';
    if (this.isEmpty()) {
      return 'Your R&D workspace is empty. Create the first research thread when you are ready.';
    }
    const parts: string[] = [];
    if (d.totals.activeResearch > 0) {
      parts.push(
        `${d.totals.activeResearch} active research thread${d.totals.activeResearch === 1 ? '' : 's'}`,
      );
    }
    if (d.totals.activeCheckpoints > 0) {
      parts.push(
        `${d.totals.activeCheckpoints} open checkpoint${d.totals.activeCheckpoints === 1 ? '' : 's'}`,
      );
    }
    if (d.totals.activeProjects > 0) {
      parts.push(
        `${d.totals.activeProjects} active project${d.totals.activeProjects === 1 ? '' : 's'}`,
      );
    }
    if (parts.length === 0) {
      return 'Nothing marked active right now — browse recent work below or start something new.';
    }
    return parts.join(' · ');
  }

  kindLabel(kind: ContinueItem['kind']): string {
    switch (kind) {
      case 'research':
        return 'Research';
      case 'project':
        return 'Project';
      case 'checkpoint':
        return 'Checkpoint';
      case 'doc':
        return 'Doc';
    }
  }

  relative(iso: string): string {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const delta = Date.now() - then;
    const mins = Math.round(delta / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days < 14) return `${days}d ago`;
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }

  private fromResearch(item: ResearchItem): ContinueItem {
    return {
      kind: 'research',
      id: item._id,
      title: item.title,
      meta: item.status,
      progress: item.progress,
      updatedAt: item.updatedAt,
      link: ['/research', item._id],
    };
  }

  private fromProject(item: ProjectItem): ContinueItem {
    return {
      kind: 'project',
      id: item._id,
      title: item.title,
      meta: item.status,
      progress: item.progress,
      updatedAt: item.updatedAt,
      link: ['/projects', item._id],
    };
  }

  private fromCheckpoint(item: CheckpointItem): ContinueItem {
    return {
      kind: 'checkpoint',
      id: item._id,
      title: `${item.code} · ${item.title}`,
      meta: item.status,
      progress: item.progress,
      updatedAt: item.updatedAt,
      link: ['/checkpoints', item._id],
    };
  }

  private fromDoc(item: DocumentationItem): ContinueItem {
    return {
      kind: 'doc',
      id: item._id,
      title: item.title,
      meta: item.status,
      updatedAt: item.updatedAt,
      link: ['/docs', item._id],
    };
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocumentationsApi } from '../../core/services/documentations.api';
import { ProjectsApi } from '../../core/services/projects.api';
import { ResearchApi } from '../../core/services/research.api';
import {
  DocumentationItem,
  ProjectItem,
  ResearchItem,
} from '../../core/models/workspace.models';

@Component({
  selector: 'app-archive-page',
  imports: [RouterLink],
  template: `
    <section class="page">
      <header>
        <h1>Archive</h1>
        <p class="lede">Soft-archived research, projects, and docs.</p>
      </header>

      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      } @else if (loading()) {
        <p class="muted">Loading archive…</p>
      } @else {
        <section>
          <h2>Research</h2>
          @if (research().length === 0) {
            <p class="muted">No archived research.</p>
          } @else {
            <ul>
              @for (item of research(); track item._id) {
                <li>
                  <a [routerLink]="['/research', item._id]">{{ item.title }}</a>
                </li>
              }
            </ul>
          }
        </section>

        <section>
          <h2>Projects</h2>
          @if (projects().length === 0) {
            <p class="muted">No archived projects.</p>
          } @else {
            <ul>
              @for (item of projects(); track item._id) {
                <li>
                  <a [routerLink]="['/projects', item._id]">{{ item.title }}</a>
                </li>
              }
            </ul>
          }
        </section>

        <section>
          <h2>Documentation</h2>
          @if (docs().length === 0) {
            <p class="muted">No archived documentation.</p>
          } @else {
            <ul>
              @for (item of docs(); track item._id) {
                <li>
                  <a [routerLink]="['/docs', item._id]">{{ item.title }}</a>
                </li>
              }
            </ul>
          }
        </section>
      }
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 1.5rem;
      }

      h1,
      h2 {
        margin: 0;
      }

      h1 {
        font-size: 1.75rem;
      }

      h2 {
        margin-bottom: 0.75rem;
        font-size: 1.05rem;
      }

      .lede,
      .muted {
        margin: 0.35rem 0 0;
        color: var(--fx-ink-muted);
      }

      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.45rem;
      }

      li {
        padding: 0.75rem 0.9rem;
        border: 1px solid var(--fx-line);
        border-radius: var(--fx-radius-control);
        background: var(--fx-paper-raised);
      }

      a {
        color: var(--fx-ink);
        text-decoration: none;
        font-weight: 600;
      }

      .error {
        color: #b91c1c;
      }
    `,
  ],
})
export class ArchivePage implements OnInit {
  private readonly researchApi = inject(ResearchApi);
  private readonly projectsApi = inject(ProjectsApi);
  private readonly docsApi = inject(DocumentationsApi);

  readonly research = signal<ResearchItem[]>([]);
  readonly projects = signal<ProjectItem[]>([]);
  readonly docs = signal<DocumentationItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    let pending = 3;
    const done = () => {
      pending -= 1;
      if (pending === 0) {
        this.loading.set(false);
      }
    };

    this.researchApi.list({ archived: true, limit: 50 }).subscribe({
      next: (res) => {
        this.research.set(res.items);
        done();
      },
      error: () => {
        this.error.set('Could not load archive.');
        done();
      },
    });

    this.projectsApi.list({ archived: true, limit: 50 }).subscribe({
      next: (res) => {
        this.projects.set(res.items);
        done();
      },
      error: () => {
        this.error.set('Could not load archive.');
        done();
      },
    });

    this.docsApi.list({ archived: true, limit: 50 }).subscribe({
      next: (res) => {
        this.docs.set(res.items);
        done();
      },
      error: () => {
        this.error.set('Could not load archive.');
        done();
      },
    });
  }
}

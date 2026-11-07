import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ProjectsApi } from '../../core/services/projects.api';
import { ProjectItem } from '../../core/models/workspace.models';

@Component({
  selector: 'app-project-list-page',
  imports: [RouterLink, MatButtonModule],
  template: `
    <section class="page">
      <header class="page-head">
        <div>
          <h1>Projects</h1>
          <p class="lede">Implementation tracks with clear outcomes.</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/projects/new">New project</a>
      </header>

      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      } @else if (loading()) {
        <p class="muted">Loading projects…</p>
      } @else if (items().length === 0) {
        <p class="muted">No active projects. Create one for an implementation effort.</p>
      } @else {
        <ul>
          @for (item of items(); track item._id) {
            <li>
              <div>
                <a [routerLink]="['/projects', item._id]">{{ item.title }}</a>
                <p>{{ item.category }} · {{ item.status }} · {{ item.priority }}</p>
              </div>
              <span>{{ item.progress }}%</span>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 1.25rem;
      }

      .page-head {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: space-between;
        align-items: end;
      }

      h1 {
        margin: 0;
        font-size: 1.75rem;
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
        gap: 0.55rem;
      }

      li {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
        padding: 0.9rem 1rem;
        border: 1px solid var(--fx-line);
        border-radius: var(--fx-radius-panel);
        background: var(--fx-paper-raised);
      }

      a {
        color: var(--fx-ink);
        text-decoration: none;
        font-weight: 600;
      }

      p,
      span {
        margin: 0.25rem 0 0;
        color: var(--fx-ink-muted);
        font-size: 0.85rem;
      }

      .error {
        color: #b91c1c;
      }
    `,
  ],
})
export class ProjectListPage implements OnInit {
  private readonly api = inject(ProjectsApi);

  readonly items = signal<ProjectItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    this.api.list({ limit: 50 }).subscribe({
      next: (res) => {
        this.items.set(res.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load projects.');
        this.loading.set(false);
      },
    });
  }
}

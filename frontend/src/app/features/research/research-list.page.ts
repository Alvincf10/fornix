import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ResearchApi } from '../../core/services/research.api';
import { ResearchItem } from '../../core/models/workspace.models';

@Component({
  selector: 'app-research-list-page',
  imports: [RouterLink, MatButtonModule],
  template: `
    <section class="page">
      <header class="page-head">
        <div>
          <h1>Research</h1>
          <p class="lede">Investigations and technical inquiries.</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/research/new">New research</a>
      </header>

      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      } @else if (loading()) {
        <p class="muted">Loading research…</p>
      } @else if (items().length === 0) {
        <p class="muted">No active research. Create one to track an investigation.</p>
      } @else {
        <ul>
          @for (item of items(); track item._id) {
            <li>
              <div>
                <a [routerLink]="['/research', item._id]">{{ item.title }}</a>
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
export class ResearchListPage implements OnInit {
  private readonly api = inject(ResearchApi);

  readonly items = signal<ResearchItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    this.api.list({ limit: 50 }).subscribe({
      next: (res) => {
        this.items.set(res.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load research.');
        this.loading.set(false);
      },
    });
  }
}

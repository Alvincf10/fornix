import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CheckpointsApi } from '../../core/services/checkpoints.api';
import {
  CheckpointItem,
  CheckpointParentType,
} from '../../core/models/workspace.models';

@Component({
  selector: 'app-checkpoint-list-page',
  imports: [RouterLink, MatButtonModule],
  template: `
    <section class="page">
      <header class="page-head">
        <div>
          <h1>Checkpoints</h1>
          <p class="lede">
            @if (parentLabel()) {
              For {{ parentLabel() }}
            } @else {
              Milestones across research and projects.
            }
          </p>
        </div>
        <a
          mat-flat-button
          color="primary"
          [routerLink]="['/checkpoints/new']"
          [queryParams]="createQuery()"
          >New checkpoint</a
        >
      </header>

      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      } @else if (loading()) {
        <p class="muted">Loading checkpoints…</p>
      } @else if (items().length === 0) {
        <p class="muted">No checkpoints yet. Capture a milestone to start the timeline.</p>
      } @else {
        <ul>
          @for (item of items(); track item._id) {
            <li>
              <div>
                <a [routerLink]="['/checkpoints', item._id]"
                  >{{ item.code }} · {{ item.title }}</a
                >
                <p>
                  {{ item.status }} · outcome {{ item.outcome }} · {{ item.progress }}%
                </p>
              </div>
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

      p {
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
export class CheckpointListPage implements OnInit {
  private readonly api = inject(CheckpointsApi);
  private readonly route = inject(ActivatedRoute);

  readonly items = signal<CheckpointItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly parentType = signal<CheckpointParentType | null>(null);
  readonly parentId = signal<string | null>(null);

  ngOnInit() {
    const parentType = this.route.snapshot.queryParamMap.get('parentType') as
      | CheckpointParentType
      | null;
    const parentId = this.route.snapshot.queryParamMap.get('parentId');
    this.parentType.set(parentType);
    this.parentId.set(parentId);

    this.api
      .list({
        limit: 100,
        parentType: parentType ?? undefined,
        parentId: parentId ?? undefined,
      })
      .subscribe({
        next: (res) => {
          this.items.set(res.items);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Could not load checkpoints.');
          this.loading.set(false);
        },
      });
  }

  parentLabel() {
    if (!this.parentType() || !this.parentId()) {
      return null;
    }
    return `${this.parentType()} ${this.parentId()}`;
  }

  createQuery() {
    return {
      parentType: this.parentType() ?? undefined,
      parentId: this.parentId() ?? undefined,
    };
  }
}

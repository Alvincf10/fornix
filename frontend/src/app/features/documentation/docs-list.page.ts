import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { DocumentationsApi } from '../../core/services/documentations.api';
import {
  DocumentationItem,
  DocumentationParentType,
} from '../../core/models/workspace.models';

@Component({
  selector: 'app-docs-list-page',
  imports: [RouterLink, MatButtonModule],
  template: `
    <section class="page">
      <header class="page-head">
        <div>
          <h1>Documentation</h1>
          <p class="lede">Technical notes linked to research, projects, or checkpoints.</p>
        </div>
        <a
          mat-flat-button
          color="primary"
          [routerLink]="['/docs/new']"
          [queryParams]="createQuery()"
          >New doc</a
        >
      </header>

      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      } @else if (loading()) {
        <p class="muted">Loading documentation…</p>
      } @else if (items().length === 0) {
        <p class="muted">No docs yet. Capture a procedure or finding.</p>
      } @else {
        <ul>
          @for (item of items(); track item._id) {
            <li>
              <a [routerLink]="['/docs', item._id]">{{ item.title }}</a>
              <p>{{ item.status }} · {{ item.category || 'Uncategorized' }}</p>
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
      .muted,
      li p {
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

      .error {
        color: #b91c1c;
      }
    `,
  ],
})
export class DocsListPage implements OnInit {
  private readonly api = inject(DocumentationsApi);
  private readonly route = inject(ActivatedRoute);

  readonly items = signal<DocumentationItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly parentType = signal<DocumentationParentType | null>(null);
  readonly parentId = signal<string | null>(null);

  ngOnInit() {
    const parentType = this.route.snapshot.queryParamMap.get('parentType') as
      | DocumentationParentType
      | null;
    const parentId = this.route.snapshot.queryParamMap.get('parentId');
    this.parentType.set(parentType);
    this.parentId.set(parentId);

    this.api
      .list({
        limit: 50,
        parentType: parentType ?? undefined,
        parentId: parentId ?? undefined,
      })
      .subscribe({
        next: (res) => {
          this.items.set(res.items);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Could not load documentation.');
          this.loading.set(false);
        },
      });
  }

  createQuery() {
    return {
      parentType: this.parentType() ?? undefined,
      parentId: this.parentId() ?? undefined,
    };
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SearchApi, SearchHit, SearchHitType } from '../../core/services/search.api';

@Component({
  selector: 'app-search-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <section class="page">
      <header>
        <h1>Search</h1>
        <p class="lede">Find research, projects, checkpoints, entries, and docs.</p>
      </header>

      <form class="form" [formGroup]="form" (ngSubmit)="run()">
        <mat-form-field appearance="outline" class="query">
          <mat-label>Keyword</mat-label>
          <input matInput formControlName="q" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <mat-select formControlName="type">
            <mat-option value="all">All</mat-option>
            <mat-option value="research">Research</mat-option>
            <mat-option value="projects">Projects</mat-option>
            <mat-option value="checkpoints">Checkpoints</mat-option>
            <mat-option value="entries">Entries</mat-option>
            <mat-option value="documentation">Documentation</mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-flat-button color="primary" type="submit">Search</button>
      </form>

      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      } @else if (loading()) {
        <p class="muted">Searching…</p>
      } @else if (searched() && items().length === 0) {
        <p class="muted">No matches for “{{ lastQuery() }}”.</p>
      } @else if (items().length) {
        <p class="muted">{{ total() }} result(s)</p>
        <ul>
          @for (hit of items(); track hit.type + hit.id) {
            <li>
              <a [routerLink]="routeFor(hit)">{{ hit.title }}</a>
              <p>
                {{ hit.type }}
                @if (hit.status) {
                  · {{ hit.status }}
                }
                @if (hit.category) {
                  · {{ hit.category }}
                }
              </p>
              @if (hit.snippet) {
                <p class="snippet">{{ hit.snippet }}</p>
              }
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
        gap: 1.1rem;
        max-width: 48rem;
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

      .form {
        display: grid;
        gap: 0.75rem;
      }

      @media (min-width: 720px) {
        .form {
          grid-template-columns: 1fr 11rem auto;
          align-items: start;
        }
      }

      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.55rem;
      }

      li {
        padding: 0.85rem 1rem;
        border: 1px solid var(--fx-line);
        border-radius: var(--fx-radius-panel);
        background: var(--fx-paper-raised);
      }

      a {
        color: var(--fx-ink);
        text-decoration: none;
        font-weight: 600;
      }

      li p {
        margin: 0.25rem 0 0;
        color: var(--fx-ink-muted);
        font-size: 0.85rem;
      }

      .snippet {
        color: var(--fx-ink) !important;
      }

      .error {
        color: #b91c1c;
      }
    `,
  ],
})
export class SearchPage implements OnInit {
  private readonly api = inject(SearchApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly items = signal<SearchHit[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly searched = signal(false);
  readonly lastQuery = signal('');
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    q: [''],
    type: this.fb.nonNullable.control<'all' | SearchHitType>('all'),
  });

  ngOnInit() {
    const q = this.route.snapshot.queryParamMap.get('q') ?? '';
    const type = (this.route.snapshot.queryParamMap.get('type') as
      | 'all'
      | SearchHitType
      | null) ?? 'all';
    this.form.patchValue({ q, type });
    if (q.trim()) {
      this.run();
    }
  }

  run() {
    const raw = this.form.getRawValue();
    if (!raw.q.trim()) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.lastQuery.set(raw.q.trim());
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: raw.q.trim(), type: raw.type },
      replaceUrl: true,
    });

    this.api
      .search({
        q: raw.q.trim(),
        type: raw.type,
        limit: 50,
      })
      .subscribe({
        next: (res) => {
          this.items.set(res.items);
          this.total.set(res.total);
          this.loading.set(false);
          this.searched.set(true);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Search failed.');
        },
      });
  }

  routeFor(hit: SearchHit): string[] {
    switch (hit.type) {
      case 'research':
        return ['/research', hit.id];
      case 'projects':
        return ['/projects', hit.id];
      case 'checkpoints':
        return ['/checkpoints', hit.id];
      case 'entries':
        return hit.parentId ? ['/checkpoints', hit.parentId] : ['/checkpoints'];
      case 'documentation':
        return ['/docs', hit.id];
      default:
        return ['/'];
    }
  }
}

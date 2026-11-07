import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CheckpointsApi } from '../../core/services/checkpoints.api';
import { DocumentationsApi } from '../../core/services/documentations.api';
import { ProjectsApi } from '../../core/services/projects.api';
import {
  CheckpointItem,
  DocumentationItem,
  ProjectItem,
} from '../../core/models/workspace.models';
import { AttachmentsPanelComponent } from '../../shared/components/attachments-panel.component';

@Component({
  selector: 'app-project-detail-page',
  imports: [RouterLink, MatButtonModule, AttachmentsPanelComponent],
  template: `
    <section class="page">
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      } @else if (!item()) {
        <p class="muted">Loading project…</p>
      } @else {
        <header class="page-head">
          <div>
            <p class="eyebrow">{{ item()!.category }}</p>
            <h1>{{ item()!.title }}</h1>
            <p class="meta">
              {{ item()!.status }} · {{ item()!.priority }} · {{ item()!.progress }}%
            </p>
          </div>
          <div class="actions">
            <a mat-stroked-button [routerLink]="['/projects', item()!._id, 'edit']">Edit</a>
            <button mat-stroked-button type="button" (click)="archive()">Archive</button>
          </div>
        </header>

        <section class="block">
          <h2>Objective</h2>
          <p>{{ item()!.objective || 'No objective set.' }}</p>
        </section>

        <section class="block">
          <h2>Description</h2>
          <p>{{ item()!.description || 'No description yet.' }}</p>
        </section>

        @if (item()!.tags.length) {
          <section class="block">
            <h2>Tags</h2>
            <p>{{ item()!.tags.join(', ') }}</p>
          </section>
        }

        <section class="block">
          <div class="section-head">
            <h2>Checkpoints</h2>
            <a
              mat-stroked-button
              [routerLink]="['/checkpoints/new']"
              [queryParams]="{ parentType: 'project', parentId: item()!._id }"
              >Add checkpoint</a
            >
          </div>
          @if (checkpoints().length === 0) {
            <p>No checkpoints yet.</p>
          } @else {
            <ul>
              @for (cp of checkpoints(); track cp._id) {
                <li>
                  <a [routerLink]="['/checkpoints', cp._id]">{{ cp.code }} · {{ cp.title }}</a>
                  <span>{{ cp.status }} · {{ cp.outcome }} · {{ cp.progress }}%</span>
                </li>
              }
            </ul>
          }
        </section>

        <section class="block">
          <div class="section-head">
            <h2>Documentation</h2>
            <a
              mat-stroked-button
              [routerLink]="['/docs/new']"
              [queryParams]="{ parentType: 'project', parentId: item()!._id }"
              >Add doc</a
            >
          </div>
          @if (docs().length === 0) {
            <p>No documentation linked yet.</p>
          } @else {
            <ul>
              @for (doc of docs(); track doc._id) {
                <li>
                  <a [routerLink]="['/docs', doc._id]">{{ doc.title }}</a>
                  <span>{{ doc.status }}</span>
                </li>
              }
            </ul>
          }
        </section>

        <app-attachments-panel parentType="project" [parentId]="item()!._id" />
      }
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 1.25rem;
        max-width: 48rem;
      }

      .page-head {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: space-between;
        align-items: start;
      }

      .eyebrow {
        margin: 0;
        color: var(--fx-accent);
        font-size: 0.75rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-weight: 600;
      }

      h1,
      h2 {
        margin: 0.35rem 0 0;
      }

      h1 {
        font-size: 1.75rem;
      }

      h2 {
        font-size: 0.95rem;
      }

      .meta,
      .muted,
      .note,
      .block p {
        margin: 0.4rem 0 0;
        color: var(--fx-ink-muted);
      }

      .actions {
        display: flex;
        gap: 0.5rem;
      }

      .block {
        padding: 1rem;
        border: 1px solid var(--fx-line);
        border-radius: var(--fx-radius-panel);
        background: var(--fx-paper-raised);
      }

      .section-head {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        justify-content: space-between;
        align-items: center;
      }

      ul {
        list-style: none;
        margin: 0.75rem 0 0;
        padding: 0;
        display: grid;
        gap: 0.45rem;
      }

      li {
        display: grid;
        gap: 0.15rem;
      }

      li a {
        color: var(--fx-ink);
        text-decoration: none;
        font-weight: 600;
      }

      li span {
        color: var(--fx-ink-muted);
        font-size: 0.85rem;
      }

      .error {
        color: #b91c1c;
      }
    `,
  ],
})
export class ProjectDetailPage implements OnInit {
  private readonly api = inject(ProjectsApi);
  private readonly checkpointsApi = inject(CheckpointsApi);
  private readonly docsApi = inject(DocumentationsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly item = signal<ProjectItem | null>(null);
  readonly checkpoints = signal<CheckpointItem[]>([]);
  readonly docs = signal<DocumentationItem[]>([]);
  readonly error = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Missing project id.');
      return;
    }

    this.api.get(id).subscribe({
      next: (item) => {
        this.item.set(item);
        this.checkpointsApi
          .list({ parentType: 'project', parentId: id, limit: 100 })
          .subscribe({
            next: (res) => this.checkpoints.set(res.items),
          });
        this.docsApi
          .list({ parentType: 'project', parentId: id, limit: 50 })
          .subscribe({
            next: (res) => this.docs.set(res.items),
          });
      },
      error: () => this.error.set('Could not load project.'),
    });
  }

  archive() {
    const current = this.item();
    if (!current) {
      return;
    }

    this.api.archive(current._id).subscribe({
      next: () => void this.router.navigateByUrl('/archive'),
      error: () => this.error.set('Could not archive project.'),
    });
  }
}

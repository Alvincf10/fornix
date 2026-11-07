import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DocumentationsApi } from '../../core/services/documentations.api';
import { ProjectsApi } from '../../core/services/projects.api';
import { ResearchApi } from '../../core/services/research.api';
import { CheckpointsApi } from '../../core/services/checkpoints.api';
import {
  DOC_PARENT_TYPES,
  DOC_STATUSES,
  DocumentationParentType,
  DocumentationStatus,
  EMPTY_TIPTAP_DOC,
} from '../../core/models/workspace.models';

@Component({
  selector: 'app-docs-form-page',
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
        <p class="eyebrow">New documentation</p>
        <h1>Create technical doc</h1>
      </header>

      <form class="form" [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" />
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <input matInput formControlName="category" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              @for (s of statuses; track s) {
                <mat-option [value]="s">{{ s }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Tags (comma separated)</mat-label>
          <input matInput formControlName="tagsText" />
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Link to</mat-label>
            <mat-select formControlName="parentType">
              @for (t of parentTypes; track t) {
                <mat-option [value]="t">{{ t }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          @if (form.controls.parentType.value !== 'none') {
            <mat-form-field appearance="outline">
              <mat-label>Parent</mat-label>
              <mat-select formControlName="parentId">
                @for (p of parents(); track p.id) {
                  <mat-option [value]="p.id">{{ p.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          }
        </div>

        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }

        <div class="actions">
          <a mat-button routerLink="/docs">Cancel</a>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || busy()">
            Create and edit
          </button>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 1rem;
        max-width: 42rem;
      }

      .eyebrow {
        margin: 0;
        color: var(--fx-accent);
        letter-spacing: 0.08em;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
      }

      h1 {
        margin: 0.35rem 0 0;
        font-size: 1.6rem;
      }

      .form {
        display: grid;
        gap: 0.75rem;
      }

      .row {
        display: grid;
        gap: 0.75rem;
      }

      @media (min-width: 720px) {
        .row {
          grid-template-columns: 1fr 1fr;
        }
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }

      .error {
        color: #b91c1c;
      }
    `,
  ],
})
export class DocsFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(DocumentationsApi);
  private readonly researchApi = inject(ResearchApi);
  private readonly projectsApi = inject(ProjectsApi);
  private readonly checkpointsApi = inject(CheckpointsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly statuses = DOC_STATUSES.filter((s) => s !== 'Archived');
  readonly parentTypes = DOC_PARENT_TYPES;
  readonly parents = signal<Array<{ id: string; label: string }>>([]);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    category: [''],
    status: this.fb.nonNullable.control<DocumentationStatus>('Draft'),
    tagsText: [''],
    parentType: this.fb.nonNullable.control<DocumentationParentType>('none'),
    parentId: [''],
  });

  ngOnInit() {
    const qType = this.route.snapshot.queryParamMap.get('parentType') as
      | DocumentationParentType
      | null;
    const qId = this.route.snapshot.queryParamMap.get('parentId');
    if (qType) {
      this.form.controls.parentType.setValue(qType);
    }
    this.loadParents(this.form.controls.parentType.value, qId ?? undefined);

    this.form.controls.parentType.valueChanges.subscribe((type) => {
      this.form.controls.parentId.setValue('');
      this.loadParents(type);
    });
  }

  submit() {
    if (this.form.invalid || this.busy()) {
      return;
    }

    const raw = this.form.getRawValue();
    if (raw.parentType !== 'none' && !raw.parentId) {
      this.error.set('Select a parent item.');
      return;
    }

    this.busy.set(true);
    this.error.set(null);

    this.api
      .create({
        title: raw.title,
        category: raw.category,
        status: raw.status,
        tags: raw.tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        parentType: raw.parentType,
        parentId: raw.parentType === 'none' ? undefined : raw.parentId,
        checkpointId: raw.parentType === 'checkpoint' ? raw.parentId : undefined,
        content: EMPTY_TIPTAP_DOC,
      })
      .subscribe({
        next: (doc) => {
          this.busy.set(false);
          void this.router.navigate(['/docs', doc._id], { queryParams: { mode: 'edit' } });
        },
        error: () => {
          this.busy.set(false);
          this.error.set('Could not create documentation.');
        },
      });
  }

  private loadParents(type: DocumentationParentType, selectedId?: string) {
    if (type === 'none') {
      this.parents.set([]);
      return;
    }

    if (type === 'research') {
      this.researchApi.list({ limit: 100 }).subscribe({
        next: (res) => {
          this.parents.set(res.items.map((i) => ({ id: i._id, label: i.title })));
          if (selectedId) this.form.controls.parentId.setValue(selectedId);
        },
      });
      return;
    }

    if (type === 'project') {
      this.projectsApi.list({ limit: 100 }).subscribe({
        next: (res) => {
          this.parents.set(res.items.map((i) => ({ id: i._id, label: i.title })));
          if (selectedId) this.form.controls.parentId.setValue(selectedId);
        },
      });
      return;
    }

    this.checkpointsApi.list({ limit: 100 }).subscribe({
      next: (res) => {
        this.parents.set(
          res.items.map((i) => ({ id: i._id, label: `${i.code} · ${i.title}` })),
        );
        if (selectedId) this.form.controls.parentId.setValue(selectedId);
      },
    });
  }
}

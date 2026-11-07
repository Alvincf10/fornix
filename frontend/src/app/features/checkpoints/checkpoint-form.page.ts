import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CheckpointsApi } from '../../core/services/checkpoints.api';
import { ProjectsApi } from '../../core/services/projects.api';
import { ResearchApi } from '../../core/services/research.api';
import {
  CHECKPOINT_OUTCOMES,
  CHECKPOINT_STATUSES,
  CheckpointParentType,
  CheckpointStatus,
  ProjectItem,
  ResearchItem,
} from '../../core/models/workspace.models';
import { RichTextFieldComponent } from '../../shared/components/rich-text-field.component';

@Component({
  selector: 'app-checkpoint-form-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RichTextFieldComponent,
  ],
  template: `
    <section class="page">
      <header>
        <p class="eyebrow">{{ id() ? 'Edit checkpoint' : 'New checkpoint' }}</p>
        <h1>{{ id() ? 'Update milestone' : 'Add milestone' }}</h1>
      </header>

      @if (!id()) {
        <mat-button-toggle-group
          [value]="mode()"
          (change)="mode.set($event.value)"
          aria-label="Checkpoint mode"
        >
          <mat-button-toggle value="quick">Quick</mat-button-toggle>
          <mat-button-toggle value="detailed">Detailed</mat-button-toggle>
        </mat-button-toggle-group>
      }

      <form class="form" [formGroup]="form" (ngSubmit)="submit()">
        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Parent type</mat-label>
            <mat-select formControlName="parentType" [disabled]="!!id()">
              <mat-option value="research">Research</mat-option>
              <mat-option value="project">Project</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Parent</mat-label>
            <mat-select formControlName="parentId" [disabled]="!!id()">
              @for (p of parents(); track p._id) {
                <mat-option [value]="p._id">{{ p.title }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" />
        </mat-form-field>

        <label class="rich-label" for="checkpoint-description">Description</label>
        <app-rich-text-field
          id="checkpoint-description"
          formControlName="description"
          label="Description"
          placeholder="Paste notes, keep paragraphs and lists…"
        />

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              @for (s of statuses; track s) {
                <mat-option [value]="s">{{ s }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Outcome</mat-label>
            <mat-select formControlName="outcome">
              @for (o of outcomes; track o) {
                <mat-option [value]="o">{{ o }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Progress %</mat-label>
            <input matInput type="number" min="0" max="100" formControlName="progress" />
          </mat-form-field>
        </div>

        @if (mode() === 'detailed' || id()) {
          <mat-form-field appearance="outline">
            <mat-label>Objective</mat-label>
            <textarea matInput rows="2" formControlName="objective"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Methodology</mat-label>
            <textarea matInput rows="3" formControlName="methodology"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Expected result</mat-label>
            <textarea matInput rows="2" formControlName="expectedResult"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Tools (comma separated)</mat-label>
            <input matInput formControlName="toolsText" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Initial notes</mat-label>
            <textarea matInput rows="3" formControlName="initialNotes"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Weight (optional)</mat-label>
            <input matInput type="number" min="0" formControlName="weight" />
          </mat-form-field>
        }

        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }

        <div class="actions">
          <a mat-button routerLink="/checkpoints">Cancel</a>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || busy()">
            {{ id() ? 'Save changes' : 'Create checkpoint' }}
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
        max-width: 46rem;
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
          grid-template-columns: repeat(3, 1fr);
        }

        .row:first-of-type {
          grid-template-columns: 1fr 2fr;
        }
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }

      .rich-label {
        margin: 0.15rem 0 0;
        font-size: 0.8rem;
        font-weight: 500;
        color: var(--fx-ink-muted);
      }

      .error {
        color: #b91c1c;
      }
    `,
  ],
})
export class CheckpointFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CheckpointsApi);
  private readonly researchApi = inject(ResearchApi);
  private readonly projectsApi = inject(ProjectsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly statuses = CHECKPOINT_STATUSES;
  readonly outcomes = CHECKPOINT_OUTCOMES;

  readonly id = signal<string | null>(null);
  readonly mode = signal<'quick' | 'detailed'>('quick');
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly parents = signal<Array<ResearchItem | ProjectItem>>([]);

  readonly form = this.fb.nonNullable.group({
    parentType: this.fb.nonNullable.control<CheckpointParentType>('research'),
    parentId: ['', Validators.required],
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    status: this.fb.nonNullable.control<CheckpointStatus>('Draft'),
    outcome: this.fb.nonNullable.control(CHECKPOINT_OUTCOMES[0]),
    progress: this.fb.nonNullable.control(0),
    objective: [''],
    methodology: [''],
    expectedResult: [''],
    toolsText: [''],
    initialNotes: [''],
    weight: this.fb.control<number | null>(null),
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const qParentType = this.route.snapshot.queryParamMap.get('parentType') as
      | CheckpointParentType
      | null;
    const qParentId = this.route.snapshot.queryParamMap.get('parentId');

    this.form.controls.parentType.valueChanges.subscribe((type) => {
      if (this.id()) {
        return;
      }
      this.loadParents(type);
      this.form.controls.parentId.setValue('');
    });

    if (qParentType) {
      this.form.controls.parentType.setValue(qParentType);
    }
    this.loadParents(this.form.controls.parentType.value, qParentId ?? undefined);

    if (!id || id === 'new') {
      return;
    }

    this.id.set(id);
    this.mode.set('detailed');
    this.api.get(id).subscribe({
      next: (item) => {
        this.loadParents(item.parentType, item.parentId);
        this.form.patchValue({
          parentType: item.parentType,
          parentId: item.parentId,
          title: item.title,
          description: item.description,
          status: item.status,
          outcome: item.outcome,
          progress: item.progress,
          objective: item.objective,
          methodology: item.methodology,
          expectedResult: item.expectedResult,
          toolsText: item.tools.join(', '),
          initialNotes: item.initialNotes,
          weight: item.weight ?? null,
        });
      },
      error: () => this.error.set('Could not load checkpoint.'),
    });
  }

  submit() {
    if (this.form.invalid || this.busy()) {
      return;
    }

    const raw = this.form.getRawValue();
    if (this.mode() === 'detailed' && !raw.objective.trim() && !this.id()) {
      this.error.set('Detailed checkpoint needs an objective.');
      return;
    }

    const payload = {
      mode: this.mode(),
      parentType: raw.parentType,
      parentId: raw.parentId,
      title: raw.title,
      description: raw.description,
      status: raw.status,
      outcome: raw.outcome,
      progress: Number(raw.progress) || 0,
      objective: raw.objective,
      methodology: raw.methodology,
      expectedResult: raw.expectedResult,
      tools: raw.toolsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      initialNotes: raw.initialNotes,
      weight: raw.weight ?? undefined,
    };

    this.busy.set(true);
    this.error.set(null);

    const req = this.id()
      ? this.api.update(this.id()!, payload)
      : this.api.create(payload);

    req.subscribe({
      next: (item) => {
        this.busy.set(false);
        void this.router.navigate(['/checkpoints', item._id]);
      },
      error: () => {
        this.busy.set(false);
        this.error.set('Could not save checkpoint.');
      },
    });
  }

  private loadParents(type: CheckpointParentType, selectedId?: string) {
    const apply = (items: Array<ResearchItem | ProjectItem>) => {
      this.parents.set(items);
      if (selectedId) {
        this.form.controls.parentId.setValue(selectedId);
      }
    };

    if (type === 'research') {
      this.researchApi.list({ limit: 100 }).subscribe({
        next: (res) => apply(res.items),
      });
      return;
    }

    this.projectsApi.list({ limit: 100 }).subscribe({
      next: (res) => apply(res.items),
    });
  }
}

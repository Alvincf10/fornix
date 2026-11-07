import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ProjectsApi } from '../../core/services/projects.api';
import {
  PRIORITIES,
  PROJECT_STATUSES,
  ProjectStatus,
  RESEARCH_CATEGORIES,
} from '../../core/models/workspace.models';

@Component({
  selector: 'app-project-form-page',
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
        <p class="eyebrow">{{ id() ? 'Edit project' : 'New project' }}</p>
        <h1>{{ id() ? 'Update project' : 'Start project' }}</h1>
      </header>

      <form class="form" [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Objective</mat-label>
          <textarea matInput rows="2" formControlName="objective"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput rows="4" formControlName="description"></textarea>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category">
              @for (c of categories; track c) {
                <mat-option [value]="c">{{ c }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              @for (s of statuses; track s) {
                <mat-option [value]="s">{{ s }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              @for (p of priorities; track p) {
                <mat-option [value]="p">{{ p }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Tags (comma separated)</mat-label>
          <input matInput formControlName="tagsText" />
        </mat-form-field>

        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }

        <div class="actions">
          <a mat-button [routerLink]="id() ? ['/projects', id()] : '/projects'">Cancel</a>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || busy()">
            {{ id() ? 'Save changes' : 'Create project' }}
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
        max-width: 44rem;
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
export class ProjectFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ProjectsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly categories = RESEARCH_CATEGORIES;
  readonly statuses = PROJECT_STATUSES.filter((s) => s !== 'Archived');
  readonly priorities = PRIORITIES;

  readonly id = signal<string | null>(null);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    objective: [''],
    description: [''],
    category: this.fb.nonNullable.control(RESEARCH_CATEGORIES[0]),
    status: this.fb.nonNullable.control<ProjectStatus>('Planning'),
    priority: this.fb.nonNullable.control(PRIORITIES[1]),
    tagsText: [''],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new') {
      return;
    }

    this.id.set(id);
    this.api.get(id).subscribe({
      next: (item) => {
        this.form.patchValue({
          title: item.title,
          objective: item.objective,
          description: item.description,
          category: item.category,
          status: item.status === 'Archived' ? 'On Hold' : item.status,
          priority: item.priority,
          tagsText: item.tags.join(', '),
        });
      },
      error: () => this.error.set('Could not load project.'),
    });
  }

  submit() {
    if (this.form.invalid || this.busy()) {
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      title: raw.title,
      objective: raw.objective,
      description: raw.description,
      category: raw.category,
      status: raw.status,
      priority: raw.priority,
      tags: raw.tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    this.busy.set(true);
    this.error.set(null);

    const req = this.id()
      ? this.api.update(this.id()!, payload)
      : this.api.create(payload);

    req.subscribe({
      next: (item) => {
        this.busy.set(false);
        void this.router.navigate(['/projects', item._id]);
      },
      error: () => {
        this.busy.set(false);
        this.error.set('Could not save project.');
      },
    });
  }
}

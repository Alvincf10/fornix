import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CheckpointsApi } from '../../core/services/checkpoints.api';
import {
  CheckpointItem,
  ENTRY_TYPES,
  ProgressEntryItem,
  ProgressEntryType,
} from '../../core/models/workspace.models';
import { AttachmentsPanelComponent } from '../../shared/components/attachments-panel.component';
import { RichTextFieldComponent } from '../../shared/components/rich-text-field.component';

@Component({
  selector: 'app-checkpoint-detail-page',
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    DatePipe,
    AttachmentsPanelComponent,
    RichTextFieldComponent,
  ],
  template: `
    <section class="page">
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      } @else if (!item()) {
        <p class="muted">Loading checkpoint…</p>
      } @else {
        <header class="page-head">
          <div>
            <p class="eyebrow">{{ item()!.code }} · {{ item()!.parentType }}</p>
            <h1>{{ item()!.title }}</h1>
            <p class="meta">
              {{ item()!.status }} · outcome {{ item()!.outcome }} · {{ item()!.progress }}%
            </p>
          </div>
          <div class="actions">
            <a mat-stroked-button [routerLink]="['/checkpoints', item()!._id, 'edit']">Edit</a>
            <button mat-stroked-button type="button" (click)="remove()">Delete</button>
          </div>
        </header>

        <section class="block">
          <h2>Description</h2>
          @if (item()!.description) {
            <app-rich-text-field
              [ngModel]="item()!.description"
              [readonly]="true"
              label="Description"
            />
          } @else {
            <p>No description.</p>
          }
        </section>

        @if (item()!.objective) {
          <section class="block">
            <h2>Objective</h2>
            <p>{{ item()!.objective }}</p>
          </section>
        }

        @if (item()!.methodology || item()!.expectedResult || item()!.tools.length) {
          <section class="block">
            <h2>Method</h2>
            @if (item()!.methodology) {
              <p><strong>Methodology:</strong> {{ item()!.methodology }}</p>
            }
            @if (item()!.expectedResult) {
              <p><strong>Expected:</strong> {{ item()!.expectedResult }}</p>
            }
            @if (item()!.tools.length) {
              <p><strong>Tools:</strong> {{ item()!.tools.join(', ') }}</p>
            }
          </section>
        }

        <app-attachments-panel parentType="checkpoint" [parentId]="item()!._id" />

        <section class="timeline">
          <div class="section-head">
            <h2>Progress timeline</h2>
          </div>

          <form class="entry-form" [formGroup]="entryForm" (ngSubmit)="addEntry()">
            <mat-form-field appearance="outline">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Type</mat-label>
              <mat-select formControlName="entryType">
                @for (t of entryTypes; track t) {
                  <mat-option [value]="t">{{ t }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Content</mat-label>
              <textarea matInput rows="3" formControlName="content"></textarea>
            </mat-form-field>
            <button
              mat-flat-button
              color="primary"
              type="submit"
              [disabled]="entryForm.invalid || entryBusy()"
            >
              Add entry
            </button>
          </form>

          @if (entries().length === 0) {
            <p class="muted">No entries yet. Failed experiments stay on this timeline.</p>
          } @else {
            <ol>
              @for (entry of entries(); track entry._id) {
                <li>
                  <div class="entry-head">
                    <strong>{{ entry.title }}</strong>
                    <span>{{ entry.entryType }} · {{ entry.occurredAt | date: 'medium' }}</span>
                  </div>
                  @if (entry.content) {
                    <p>{{ entry.content }}</p>
                  }
                  <button mat-button type="button" (click)="deleteEntry(entry._id)">Remove</button>
                </li>
              }
            </ol>
          }
        </section>
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
      .block p {
        margin: 0.4rem 0 0;
        color: var(--fx-ink-muted);
      }

      .actions {
        display: flex;
        gap: 0.5rem;
      }

      .block,
      .timeline {
        padding: 1rem;
        border: 1px solid var(--fx-line);
        border-radius: var(--fx-radius-panel);
        background: var(--fx-paper-raised);
      }

      .timeline {
        display: grid;
        gap: 1rem;
      }

      .entry-form {
        display: grid;
        gap: 0.65rem;
      }

      @media (min-width: 720px) {
        .entry-form {
          grid-template-columns: 2fr 1fr;
        }

        .entry-form .full,
        .entry-form button {
          grid-column: 1 / -1;
        }
      }

      ol {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.75rem;
      }

      li {
        padding: 0.75rem 0;
        border-top: 1px solid var(--fx-line);
      }

      .entry-head {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem 1rem;
        justify-content: space-between;
      }

      .entry-head span,
      li p {
        margin: 0.35rem 0 0;
        color: var(--fx-ink-muted);
        font-size: 0.85rem;
      }

      .error {
        color: #b91c1c;
      }
    `,
  ],
})
export class CheckpointDetailPage implements OnInit {
  private readonly api = inject(CheckpointsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly entryTypes = ENTRY_TYPES;
  readonly item = signal<CheckpointItem | null>(null);
  readonly entries = signal<ProgressEntryItem[]>([]);
  readonly error = signal<string | null>(null);
  readonly entryBusy = signal(false);

  readonly entryForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    entryType: this.fb.nonNullable.control<ProgressEntryType>('Note'),
    content: [''],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Missing checkpoint id.');
      return;
    }

    this.api.get(id).subscribe({
      next: (item) => {
        this.item.set(item);
        this.loadEntries(id);
      },
      error: () => this.error.set('Could not load checkpoint.'),
    });
  }

  addEntry() {
    const current = this.item();
    if (!current || this.entryForm.invalid || this.entryBusy()) {
      return;
    }

    this.entryBusy.set(true);
    this.api.createEntry(current._id, this.entryForm.getRawValue()).subscribe({
      next: () => {
        this.entryBusy.set(false);
        this.entryForm.reset({ title: '', entryType: 'Note', content: '' });
        this.loadEntries(current._id);
      },
      error: () => {
        this.entryBusy.set(false);
        this.error.set('Could not add entry.');
      },
    });
  }

  deleteEntry(id: string) {
    const current = this.item();
    if (!current) {
      return;
    }

    this.api.removeEntry(id).subscribe({
      next: () => this.loadEntries(current._id),
      error: () => this.error.set('Could not remove entry.'),
    });
  }

  remove() {
    const current = this.item();
    if (!current) {
      return;
    }

    this.api.remove(current._id).subscribe({
      next: () => void this.router.navigateByUrl('/checkpoints'),
      error: () => this.error.set('Could not delete checkpoint.'),
    });
  }

  private loadEntries(checkpointId: string) {
    this.api.listEntries(checkpointId).subscribe({
      next: (entries) => this.entries.set(entries),
      error: () => this.error.set('Could not load timeline.'),
    });
  }
}

import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { DocumentationsApi } from '../../core/services/documentations.api';
import { AttachmentsPanelComponent } from '../../shared/components/attachments-panel.component';
import { DocEditorComponent } from '../../shared/components/doc-editor.component';
import {
  DOC_STATUSES,
  DocumentationItem,
  DocumentationStatus,
  EMPTY_TIPTAP_DOC,
} from '../../core/models/workspace.models';

type SaveState = 'idle' | 'saving' | 'saved' | 'failed' | 'conflict';

@Component({
  selector: 'app-docs-detail-page',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    DocEditorComponent,
    AttachmentsPanelComponent,
  ],
  template: `
    <section class="page">
      @if (error() && !item()) {
        <p class="error" role="alert">{{ error() }}</p>
      } @else if (!item()) {
        <p class="muted">Loading documentation…</p>
      } @else {
        <header class="page-head">
          <div>
            <p class="eyebrow">{{ item()!.status }} · {{ item()!.category || 'Uncategorized' }}</p>
            @if (editMode()) {
              <mat-form-field appearance="outline" class="title-field">
                <mat-label>Title</mat-label>
                <input matInput [formControl]="metaForm.controls.title" />
              </mat-form-field>
            } @else {
              <h1>{{ item()!.title }}</h1>
            }
            <p class="save" [attr.data-state]="saveState()">{{ saveLabel() }}</p>
          </div>
          <div class="actions">
            @if (editMode()) {
              <mat-form-field appearance="outline" class="status-field">
                <mat-label>Status</mat-label>
                <mat-select [formControl]="metaForm.controls.status">
                  @for (s of statuses; track s) {
                    <mat-option [value]="s">{{ s }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <button mat-stroked-button type="button" (click)="setMode(false)">Read mode</button>
            } @else {
              <button mat-flat-button color="primary" type="button" (click)="setMode(true)">
                Edit mode
              </button>
            }
            <button mat-stroked-button type="button" (click)="archive()">Archive</button>
            <a mat-button routerLink="/docs">Back</a>
          </div>
        </header>

        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }

        <app-doc-editor
          [content]="content()"
          [readonly]="!editMode()"
          (contentChange)="onContentChange($event)"
        />

        <app-attachments-panel parentType="documentation" [parentId]="item()!._id" />
      }
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 1rem;
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

      h1 {
        margin: 0.35rem 0 0;
        font-size: 1.75rem;
      }

      .title-field {
        width: min(100%, 28rem);
        margin-top: 0.35rem;
      }

      .status-field {
        width: 9rem;
      }

      .save {
        margin: 0.4rem 0 0;
        font-size: 0.8rem;
        color: var(--fx-ink-muted);
      }

      .save[data-state='failed'],
      .save[data-state='conflict'],
      .error {
        color: #b91c1c;
      }

      .save[data-state='saved'] {
        color: #166534;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      }

      .muted {
        color: var(--fx-ink-muted);
      }
    `,
  ],
})
export class DocsDetailPage implements OnInit, OnDestroy {
  private readonly api = inject(DocumentationsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly statuses = DOC_STATUSES.filter((s) => s !== 'Archived');
  readonly item = signal<DocumentationItem | null>(null);
  readonly content = signal<Record<string, unknown>>(EMPTY_TIPTAP_DOC);
  readonly editMode = signal(false);
  readonly saveState = signal<SaveState>('idle');
  readonly error = signal<string | null>(null);

  readonly metaForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    status: this.fb.nonNullable.control<DocumentationStatus>('Draft'),
  });

  private readonly content$ = new Subject<Record<string, unknown>>();
  private subs = new Subscription();
  private draftKey = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Missing documentation id.');
      return;
    }

    this.draftKey = `fornix-doc-draft:${id}`;
    this.editMode.set(this.route.snapshot.queryParamMap.get('mode') === 'edit');

    this.api.get(id).subscribe({
      next: (doc) => this.hydrate(doc),
      error: () => this.error.set('Could not load documentation.'),
    });

    this.subs.add(
      this.content$.pipe(debounceTime(1200), distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))).subscribe((content) => {
        this.persistLocal(content);
        this.save({ content });
      }),
    );

    this.subs.add(
      this.metaForm.valueChanges.pipe(debounceTime(800)).subscribe(() => {
        if (!this.editMode() || this.metaForm.invalid) {
          return;
        }
        const raw = this.metaForm.getRawValue();
        this.save({ title: raw.title, status: raw.status });
      }),
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  setMode(edit: boolean) {
    this.editMode.set(edit);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: edit ? { mode: 'edit' } : {},
      replaceUrl: true,
    });
  }

  onContentChange(content: Record<string, unknown>) {
    if (!this.editMode()) {
      return;
    }
    this.content.set(content);
    this.saveState.set('idle');
    this.content$.next(content);
  }

  archive() {
    const current = this.item();
    if (!current) {
      return;
    }
    this.api.archive(current._id).subscribe({
      next: () => void this.router.navigateByUrl('/docs'),
      error: () => this.error.set('Could not archive documentation.'),
    });
  }

  saveLabel() {
    switch (this.saveState()) {
      case 'saving':
        return 'Saving…';
      case 'saved':
        return 'Saved';
      case 'failed':
        return 'Save failed';
      case 'conflict':
        return 'Conflict: refreshed from server';
      default:
        return this.editMode() ? 'Edits autosave after a short pause' : 'Read mode';
    }
  }

  private hydrate(doc: DocumentationItem) {
    const local = this.readLocal();
    const preferLocal =
      !!local &&
      !!local.updatedAtHint &&
      new Date(local.updatedAtHint).getTime() > new Date(doc.updatedAt).getTime();

    this.item.set(doc);
    this.metaForm.patchValue(
      { title: doc.title, status: doc.status === 'Archived' ? 'Draft' : doc.status },
      { emitEvent: false },
    );
    this.content.set(
      preferLocal && local
        ? local.content
        : ((doc.content as Record<string, unknown>) ?? EMPTY_TIPTAP_DOC),
    );
    if (preferLocal) {
      this.error.set('Restored a newer local draft after a connectivity issue.');
    }
  }

  private save( partial: {
    title?: string;
    status?: DocumentationStatus;
    content?: Record<string, unknown>;
  }) {
    const current = this.item();
    if (!current) {
      return;
    }

    this.saveState.set('saving');
    this.api
      .update(current._id, {
        ...partial,
        baseUpdatedAt: current.updatedAt,
      })
      .subscribe({
        next: (doc) => {
          this.item.set(doc);
          this.saveState.set('saved');
          this.clearLocal();
          this.error.set(null);
        },
        error: (err: { status?: number; error?: { serverUpdatedAt?: string } }) => {
          if (err.status === 409) {
            this.saveState.set('conflict');
            this.api.get(current._id).subscribe({
              next: (doc) => this.hydrate(doc),
            });
            return;
          }
          this.saveState.set('failed');
          this.persistLocal(partial.content ?? this.content());
          this.error.set('Could not save. Draft kept locally.');
        },
      });
  }

  private persistLocal(content: Record<string, unknown>) {
    if (!this.draftKey) {
      return;
    }
    localStorage.setItem(
      this.draftKey,
      JSON.stringify({
        content,
        updatedAtHint: new Date().toISOString(),
      }),
    );
  }

  private readLocal():
    | { content: Record<string, unknown>; updatedAtHint: string }
    | null {
    if (!this.draftKey) {
      return null;
    }
    try {
      const raw = localStorage.getItem(this.draftKey);
      return raw ? (JSON.parse(raw) as { content: Record<string, unknown>; updatedAtHint: string }) : null;
    } catch {
      return null;
    }
  }

  private clearLocal() {
    if (this.draftKey) {
      localStorage.removeItem(this.draftKey);
    }
  }
}

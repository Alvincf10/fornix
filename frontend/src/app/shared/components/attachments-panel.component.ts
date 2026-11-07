import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';
import {
  AttachmentItem,
  AttachmentParentType,
  AttachmentsApi,
} from '../../core/services/attachments.api';

@Component({
  selector: 'app-attachments-panel',
  imports: [MatButtonModule],
  template: `
    <section class="panel">
      <div class="head">
        <h2>Attachments</h2>
        <label class="upload">
          Upload
          <input type="file" (change)="onFile($event)" [disabled]="busy()" />
        </label>
      </div>

      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }

      @if (loading()) {
        <p class="muted">Loading files…</p>
      } @else if (items().length === 0) {
        <p class="muted">No attachments yet.</p>
      } @else {
        <ul>
          @for (item of items(); track item._id) {
            <li>
              <div>
                <strong>{{ item.originalName }}</strong>
                <p>{{ item.mimeType }} · {{ formatSize(item.size) }}</p>
              </div>
              <div class="actions">
                @if (isPreviewable(item)) {
                  <button mat-button type="button" (click)="preview(item)">Preview</button>
                }
                <button mat-button type="button" (click)="download(item)">Download</button>
                <button mat-button type="button" (click)="remove(item)">Delete</button>
              </div>
            </li>
          }
        </ul>
      }

      @if (previewItem()) {
        <div class="preview" role="dialog" aria-label="Attachment preview">
          <div class="preview-head">
            <strong>{{ previewItem()!.originalName }}</strong>
            <button mat-button type="button" (click)="previewItem.set(null)">Close</button>
          </div>
          @if (previewItem()!.mimeType.startsWith('image/')) {
            <img [src]="previewSrc()" [alt]="previewItem()!.originalName" />
          } @else if (previewItem()!.mimeType === 'application/pdf') {
            <iframe [src]="previewSrc()" title="PDF preview"></iframe>
          } @else {
            <pre>{{ previewText() }}</pre>
          }
        </div>
      }
    </section>
  `,
  styles: [
    `
      .panel {
        display: grid;
        gap: 0.85rem;
        padding: 1rem;
        border: 1px solid var(--fx-line);
        border-radius: var(--fx-radius-panel);
        background: var(--fx-paper-raised);
      }

      .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
      }

      h2 {
        margin: 0;
        font-size: 0.95rem;
      }

      .upload {
        position: relative;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--fx-line);
        border-radius: var(--fx-radius-control);
        padding: 0.35rem 0.7rem;
        font-size: 0.85rem;
        cursor: pointer;
      }

      .upload input {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
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
        flex-wrap: wrap;
        gap: 0.5rem 1rem;
        justify-content: space-between;
        align-items: center;
        padding-top: 0.55rem;
        border-top: 1px solid var(--fx-line);
      }

      p,
      .muted {
        margin: 0.2rem 0 0;
        color: var(--fx-ink-muted);
        font-size: 0.85rem;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.15rem;
      }

      .error {
        color: #b91c1c;
      }

      .preview {
        border: 1px solid var(--fx-line);
        border-radius: var(--fx-radius-control);
        padding: 0.75rem;
        display: grid;
        gap: 0.75rem;
      }

      .preview-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      img,
      iframe {
        width: 100%;
        min-height: 18rem;
        border: 0;
        border-radius: 0.35rem;
        background: #0f172a10;
      }

      pre {
        margin: 0;
        white-space: pre-wrap;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.85rem;
      }
    `,
  ],
})
export class AttachmentsPanelComponent implements OnChanges {
  @Input({ required: true }) parentType!: AttachmentParentType;
  @Input({ required: true }) parentId!: string;

  private readonly api = inject(AttachmentsApi);
  private readonly auth = inject(AuthService);

  readonly items = signal<AttachmentItem[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly previewItem = signal<AttachmentItem | null>(null);
  readonly previewSrc = signal<string>('');
  readonly previewText = signal<string>('');

  ngOnChanges() {
    if (this.parentType && this.parentId) {
      this.reload();
    }
  }

  onFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    this.busy.set(true);
    this.error.set(null);
    this.api.upload(this.parentType, this.parentId, file).subscribe({
      next: () => {
        this.busy.set(false);
        this.reload();
      },
      error: () => {
        this.busy.set(false);
        this.error.set('Upload failed. Check file type and size.');
      },
    });
  }

  download(item: AttachmentItem) {
    void this.fetchBlob(this.api.downloadUrl(item._id)).then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.originalName;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  async preview(item: AttachmentItem) {
    this.error.set(null);
    try {
      const blob = await this.fetchBlob(this.api.previewUrl(item._id));
      if (item.mimeType.startsWith('text/') || item.mimeType === 'application/json') {
        this.previewText.set(await blob.text());
        this.previewSrc.set('');
      } else {
        this.previewSrc.set(URL.createObjectURL(blob));
        this.previewText.set('');
      }
      this.previewItem.set(item);
    } catch {
      this.error.set('Could not preview file.');
    }
  }

  remove(item: AttachmentItem) {
    if (!window.confirm(`Delete ${item.originalName}?`)) {
      return;
    }
    this.api.remove(item._id).subscribe({
      next: () => this.reload(),
      error: () => this.error.set('Could not delete attachment.'),
    });
  }

  isPreviewable(item: AttachmentItem) {
    return (
      item.mimeType.startsWith('image/') ||
      item.mimeType === 'application/pdf' ||
      item.mimeType.startsWith('text/') ||
      item.mimeType === 'application/json'
    );
  }

  formatSize(size: number) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  private reload() {
    this.loading.set(true);
    this.api.list({ parentType: this.parentType, parentId: this.parentId, limit: 50 }).subscribe({
      next: (res) => {
        this.items.set(res.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load attachments.');
        this.loading.set(false);
      },
    });
  }

  private async fetchBlob(url: string) {
    const token = this.auth.accessToken();
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error('fetch failed');
    }
    return res.blob();
  }
}

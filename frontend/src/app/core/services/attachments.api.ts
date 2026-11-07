import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paginated } from '../models/workspace.models';

export type AttachmentParentType =
  | 'research'
  | 'project'
  | 'checkpoint'
  | 'progress_entry'
  | 'documentation';

export type AttachmentItem = {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  parentType: AttachmentParentType;
  parentId: string;
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class AttachmentsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/attachments`;

  list(opts: {
    parentType?: AttachmentParentType;
    parentId?: string;
    page?: number;
    limit?: number;
  } = {}): Observable<Paginated<AttachmentItem>> {
    let params = new HttpParams();
    if (opts.parentType) params = params.set('parentType', opts.parentType);
    if (opts.parentId) params = params.set('parentId', opts.parentId);
    if (opts.page) params = params.set('page', opts.page);
    if (opts.limit) params = params.set('limit', opts.limit);
    return this.http.get<Paginated<AttachmentItem>>(this.base, { params });
  }

  upload(parentType: AttachmentParentType, parentId: string, file: File) {
    const body = new FormData();
    body.append('parentType', parentType);
    body.append('parentId', parentId);
    body.append('file', file);
    return this.http.post<AttachmentItem>(this.base, body);
  }

  remove(id: string) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/${id}`);
  }

  downloadUrl(id: string) {
    return `${this.base}/${id}/download`;
  }

  previewUrl(id: string) {
    return `${this.base}/${id}/preview`;
  }
}

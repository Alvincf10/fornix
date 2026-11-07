import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DocumentationItem,
  DocumentationParentType,
  DocumentationStatus,
  Paginated,
} from '../models/workspace.models';

export type DocumentationPayload = {
  title: string;
  content?: Record<string, unknown>;
  category?: string;
  tags?: string[];
  parentType?: DocumentationParentType;
  parentId?: string;
  checkpointId?: string;
  status?: DocumentationStatus;
  baseUpdatedAt?: string;
};

@Injectable({ providedIn: 'root' })
export class DocumentationsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/documentations`;

  list(opts: {
    page?: number;
    limit?: number;
    q?: string;
    status?: DocumentationStatus;
    parentType?: DocumentationParentType;
    parentId?: string;
    checkpointId?: string;
    archived?: boolean;
  } = {}): Observable<Paginated<DocumentationItem>> {
    let params = new HttpParams();
    if (opts.page) params = params.set('page', opts.page);
    if (opts.limit) params = params.set('limit', opts.limit);
    if (opts.q) params = params.set('q', opts.q);
    if (opts.status) params = params.set('status', opts.status);
    if (opts.parentType) params = params.set('parentType', opts.parentType);
    if (opts.parentId) params = params.set('parentId', opts.parentId);
    if (opts.checkpointId) params = params.set('checkpointId', opts.checkpointId);
    if (opts.archived) params = params.set('archived', 'true');
    return this.http.get<Paginated<DocumentationItem>>(this.base, { params });
  }

  get(id: string) {
    return this.http.get<DocumentationItem>(`${this.base}/${id}`);
  }

  create(payload: DocumentationPayload) {
    return this.http.post<DocumentationItem>(this.base, payload);
  }

  update(id: string, payload: Partial<DocumentationPayload>) {
    return this.http.patch<DocumentationItem>(`${this.base}/${id}`, payload);
  }

  archive(id: string) {
    return this.http.post<DocumentationItem>(`${this.base}/${id}/archive`, {});
  }

  remove(id: string) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/${id}`);
  }
}

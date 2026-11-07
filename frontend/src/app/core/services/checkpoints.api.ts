import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CheckpointItem,
  CheckpointOutcome,
  CheckpointParentType,
  CheckpointStatus,
  Paginated,
  ProgressEntryItem,
  ProgressEntryType,
} from '../models/workspace.models';

export type CheckpointPayload = {
  mode?: 'quick' | 'detailed';
  title: string;
  description?: string;
  parentType: CheckpointParentType;
  parentId: string;
  status?: CheckpointStatus;
  outcome?: CheckpointOutcome;
  objective?: string;
  methodology?: string;
  expectedResult?: string;
  tools?: string[];
  initialNotes?: string;
  progress?: number;
  weight?: number;
};

export type ProgressEntryPayload = {
  title: string;
  content?: string;
  entryType?: ProgressEntryType;
  occurredAt?: string;
  tools?: string[];
};

@Injectable({ providedIn: 'root' })
export class CheckpointsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/checkpoints`;

  list(opts: {
    page?: number;
    limit?: number;
    parentType?: CheckpointParentType;
    parentId?: string;
    status?: CheckpointStatus;
    q?: string;
  } = {}): Observable<Paginated<CheckpointItem>> {
    let params = new HttpParams();
    if (opts.page) params = params.set('page', opts.page);
    if (opts.limit) params = params.set('limit', opts.limit);
    if (opts.parentType) params = params.set('parentType', opts.parentType);
    if (opts.parentId) params = params.set('parentId', opts.parentId);
    if (opts.status) params = params.set('status', opts.status);
    if (opts.q) params = params.set('q', opts.q);
    return this.http.get<Paginated<CheckpointItem>>(this.base, { params });
  }

  get(id: string) {
    return this.http.get<CheckpointItem>(`${this.base}/${id}`);
  }

  create(payload: CheckpointPayload) {
    return this.http.post<CheckpointItem>(this.base, payload);
  }

  update(id: string, payload: Partial<CheckpointPayload>) {
    return this.http.patch<CheckpointItem>(`${this.base}/${id}`, payload);
  }

  remove(id: string) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/${id}`);
  }

  listEntries(checkpointId: string) {
    return this.http.get<ProgressEntryItem[]>(`${this.base}/${checkpointId}/entries`);
  }

  createEntry(checkpointId: string, payload: ProgressEntryPayload) {
    return this.http.post<ProgressEntryItem>(
      `${this.base}/${checkpointId}/entries`,
      payload,
    );
  }

  updateEntry(id: string, payload: Partial<ProgressEntryPayload>) {
    return this.http.patch<ProgressEntryItem>(
      `${environment.apiBaseUrl}/entries/${id}`,
      payload,
    );
  }

  removeEntry(id: string) {
    return this.http.delete<{ ok: boolean }>(`${environment.apiBaseUrl}/entries/${id}`);
  }
}

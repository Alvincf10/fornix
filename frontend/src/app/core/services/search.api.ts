import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export type SearchHitType =
  | 'research'
  | 'projects'
  | 'checkpoints'
  | 'entries'
  | 'documentation';

export type SearchHit = {
  type: SearchHitType;
  id: string;
  title: string;
  snippet?: string;
  status?: string;
  category?: string;
  parentType?: string;
  parentId?: string;
};

export type SearchResponse = {
  items: SearchHit[];
  total: number;
  page: number;
  limit: number;
  q: string;
};

@Injectable({ providedIn: 'root' })
export class SearchApi {
  private readonly http = inject(HttpClient);

  search(opts: {
    q: string;
    type?: 'all' | SearchHitType;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    let params = new HttpParams().set('q', opts.q);
    if (opts.type) params = params.set('type', opts.type);
    if (opts.category) params = params.set('category', opts.category);
    if (opts.status) params = params.set('status', opts.status);
    if (opts.page) params = params.set('page', opts.page);
    if (opts.limit) params = params.set('limit', opts.limit);
    return this.http.get<SearchResponse>(`${environment.apiBaseUrl}/search`, { params });
  }
}

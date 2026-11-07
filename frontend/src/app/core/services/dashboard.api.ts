import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DashboardOverview } from '../models/workspace.models';

@Injectable({ providedIn: 'root' })
export class DashboardApi {
  private readonly http = inject(HttpClient);

  overview() {
    return this.http.get<DashboardOverview>(`${environment.apiBaseUrl}/dashboard`);
  }
}

import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { AppShellLayout } from './layouts/app-shell.layout';
import { ArchivePage } from './features/archive/archive.page';
import { CheckpointDetailPage } from './features/checkpoints/checkpoint-detail.page';
import { CheckpointFormPage } from './features/checkpoints/checkpoint-form.page';
import { CheckpointListPage } from './features/checkpoints/checkpoint-list.page';
import { DocsDetailPage } from './features/documentation/docs-detail.page';
import { DocsFormPage } from './features/documentation/docs-form.page';
import { DocsListPage } from './features/documentation/docs-list.page';
import { HomePage } from './features/dashboard/home.page';
import { SearchPage } from './features/search/search.page';
import { LoginPage } from './features/auth/login.page';
import { RegisterPage } from './features/auth/register.page';
import { ProjectDetailPage } from './features/projects/project-detail.page';
import { ProjectFormPage } from './features/projects/project-form.page';
import { ProjectListPage } from './features/projects/project-list.page';
import { ResearchDetailPage } from './features/research/research-detail.page';
import { ResearchFormPage } from './features/research/research-form.page';
import { ResearchListPage } from './features/research/research-list.page';

export const routes: Routes = [
  { path: 'login', component: LoginPage, canActivate: [guestGuard] },
  { path: 'register', component: RegisterPage, canActivate: [guestGuard] },
  {
    path: '',
    component: AppShellLayout,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomePage },
      { path: 'research', component: ResearchListPage },
      { path: 'research/new', component: ResearchFormPage },
      { path: 'research/:id/edit', component: ResearchFormPage },
      { path: 'research/:id', component: ResearchDetailPage },
      { path: 'projects', component: ProjectListPage },
      { path: 'projects/new', component: ProjectFormPage },
      { path: 'projects/:id/edit', component: ProjectFormPage },
      { path: 'projects/:id', component: ProjectDetailPage },
      { path: 'checkpoints', component: CheckpointListPage },
      { path: 'checkpoints/new', component: CheckpointFormPage },
      { path: 'checkpoints/:id/edit', component: CheckpointFormPage },
      { path: 'checkpoints/:id', component: CheckpointDetailPage },
      { path: 'docs', component: DocsListPage },
      { path: 'docs/new', component: DocsFormPage },
      { path: 'docs/:id', component: DocsDetailPage },
      { path: 'search', component: SearchPage },
      { path: 'archive', component: ArchivePage },
    ],
  },
  { path: '**', redirectTo: '' },
];

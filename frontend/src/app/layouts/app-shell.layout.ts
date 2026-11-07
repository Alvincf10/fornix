import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {
  LucideArchive,
  LucideDynamicIcon,
  LucideFileText,
  LucideFlag,
  LucideFlaskConical,
  LucideFolderKanban,
  LucideLayoutDashboard,
  LucideLogOut,
  LucideSearch,
  type LucideIcon,
} from '@lucide/angular';
import { AuthService } from '../core/auth/auth.service';

type NavItem = {
  path: string;
  label: string;
  exact: boolean;
  icon: LucideIcon;
};

@Component({
  selector: 'app-shell-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    FormsModule,
    LucideDynamicIcon,
    LucideLogOut,
  ],
  template: `
    <div class="shell">
      <aside class="sidebar" aria-label="Primary">
        <div class="brand-block">
          <p class="brand">FORNIX</p>
          <p class="tag">Engineer Your Knowledge.</p>
        </div>

        <nav class="nav">
          @for (item of desktopNav; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.exact }"
            >
              <svg lucideIcon [lucideIcon]="item.icon" [size]="16" aria-hidden="true"></svg>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="sidebar-foot">
          <p class="user">{{ auth.user()?.displayName || 'Workspace' }}</p>
          <button mat-stroked-button type="button" class="signout" (click)="logout()">
            <svg lucideLogOut [size]="15" aria-hidden="true"></svg>
            Sign out
          </button>
        </div>
      </aside>

      <div class="main">
        <header class="topbar">
          <p class="mobile-brand">FORNIX</p>
          <form class="quick-search" (ngSubmit)="goSearch()">
            <input
              type="search"
              name="q"
              [(ngModel)]="query"
              placeholder="Search workspace"
              aria-label="Search workspace"
            />
          </form>
          <button
            mat-stroked-button
            type="button"
            class="mobile-signout"
            (click)="logout()"
          >
            Sign out
          </button>
        </header>

        <main class="content">
          <router-outlet />
        </main>
      </div>

      <nav class="mobile-nav" aria-label="Mobile">
        @for (item of mobileNav; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.exact }"
          >
            <svg lucideIcon [lucideIcon]="item.icon" [size]="18" aria-hidden="true"></svg>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>
    </div>
  `,
  styles: [
    `
      .shell {
        min-height: 100vh;
        min-height: 100dvh;
        display: grid;
        grid-template-columns: 15rem 1fr;
        background: var(--fx-paper);
      }

      .sidebar {
        display: none;
        flex-direction: column;
        gap: 1.5rem;
        padding: 1.5rem 1rem;
        border-right: 1px solid var(--fx-line);
        background: var(--fx-paper-raised);
      }

      .brand {
        margin: 0;
        letter-spacing: 0.16em;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--fx-accent);
      }

      .tag {
        margin: 0.35rem 0 0;
        font-size: 0.8rem;
        color: var(--fx-ink-muted);
      }

      .nav {
        display: grid;
        gap: 0.25rem;
      }

      .nav a {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        text-decoration: none;
        color: var(--fx-ink-muted);
        border-radius: var(--fx-radius-control);
        padding: 0.55rem 0.7rem;
        font-size: 0.925rem;
      }

      .nav a.active {
        background: var(--fx-accent-soft);
        color: var(--fx-accent-strong);
        font-weight: 600;
      }

      .sidebar-foot {
        margin-top: auto;
        display: grid;
        gap: 0.75rem;
      }

      .user {
        margin: 0;
        font-size: 0.85rem;
        color: var(--fx-ink-muted);
      }

      .signout {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }

      .main {
        min-width: 0;
        display: grid;
        grid-template-rows: auto 1fr;
        padding-bottom: calc(4.75rem + env(safe-area-inset-bottom, 0px));
      }


      .topbar {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.85rem 1rem;
        border-bottom: 1px solid var(--fx-line);
        background: var(--fx-paper-raised);
      }

      .mobile-brand {
        margin: 0;
        letter-spacing: 0.14em;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--fx-accent);
      }

      .quick-search {
        flex: 1;
      }

      .quick-search input {
        width: 100%;
        border: 1px solid var(--fx-line);
        border-radius: var(--fx-radius-control);
        padding: 0.5rem 0.7rem;
        font: inherit;
        background: var(--fx-paper);
        color: var(--fx-ink);
      }

      .content {
        padding: 1.25rem 1rem calc(2.75rem + env(safe-area-inset-bottom, 0px));
      }

      .mobile-nav {
        position: fixed;
        inset: auto 0 0 0;
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 0.1rem;
        padding: 0.45rem 0.25rem calc(0.45rem + env(safe-area-inset-bottom, 0px));
        border-top: 1px solid var(--fx-line);
        background: var(--fx-paper-raised);
        z-index: 20;
      }


      .mobile-nav a {
        display: grid;
        justify-items: center;
        gap: 0.15rem;
        text-decoration: none;
        color: var(--fx-ink-muted);
        border-radius: var(--fx-radius-control);
        padding: 0.35rem 0.2rem;
        font-size: 0.68rem;
        line-height: 1.1;
      }

      .mobile-nav a.active {
        background: var(--fx-accent-soft);
        color: var(--fx-accent-strong);
        font-weight: 600;
      }

      .mobile-signout {
        flex: none;
      }

      @media (min-width: 900px) {
        .sidebar {
          display: flex;
        }

        .mobile-brand,
        .mobile-nav,
        .mobile-signout {
          display: none;
        }

        .main {
          padding-bottom: 0;
        }

        .content {
          padding: 1.75rem 2rem 2.5rem;
        }

        .topbar {
          padding: 0.85rem 2rem;
        }
      }
    `,
  ],
})
export class AppShellLayout {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  query = '';

  readonly desktopNav: NavItem[] = [
    { path: '/', label: 'Overview', exact: true, icon: LucideLayoutDashboard },
    { path: '/research', label: 'Research', exact: false, icon: LucideFlaskConical },
    { path: '/projects', label: 'Projects', exact: false, icon: LucideFolderKanban },
    { path: '/checkpoints', label: 'Checkpoints', exact: false, icon: LucideFlag },
    { path: '/docs', label: 'Documentation', exact: false, icon: LucideFileText },
    { path: '/search', label: 'Search', exact: false, icon: LucideSearch },
    { path: '/archive', label: 'Archive', exact: false, icon: LucideArchive },
  ];

  readonly mobileNav: NavItem[] = [
    { path: '/', label: 'Home', exact: true, icon: LucideLayoutDashboard },
    { path: '/research', label: 'Research', exact: false, icon: LucideFlaskConical },
    { path: '/checkpoints', label: 'Checks', exact: false, icon: LucideFlag },
    { path: '/docs', label: 'Docs', exact: false, icon: LucideFileText },
    { path: '/search', label: 'Search', exact: false, icon: LucideSearch },
  ];

  goSearch() {
    const q = this.query.trim();
    if (!q) {
      void this.router.navigateByUrl('/search');
      return;
    }
    void this.router.navigate(['/search'], { queryParams: { q } });
  }

  logout() {
    this.auth.logout().subscribe();
  }
}

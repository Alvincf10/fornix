import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LucideEye, LucideEyeOff } from '@lucide/angular';
import { AuthService } from '../../core/auth/auth.service';
import { AuthFrameComponent } from '../../shared/components/auth-frame.component';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    AuthFrameComponent,
    LucideEye,
    LucideEyeOff,
  ],

  template: `
    <app-auth-frame>
      <form class="panel" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <header class="head">
          <h1>Sign in</h1>
          <p class="lede">Welcome back. Pick up where you left your notes and checkpoints.</p>
        </header>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Email</mat-label>
          <input
            matInput
            type="email"
            formControlName="email"
            autocomplete="username"
            inputmode="email"
            [attr.aria-invalid]="showError('email')"
          />
          @if (showError('email')) {
            <mat-error>{{ emailError() }}</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Password</mat-label>
          <input
            matInput
            [type]="showPassword() ? 'text' : 'password'"
            formControlName="password"
            autocomplete="current-password"
            [attr.aria-invalid]="showError('password')"
          />
          <button
            mat-icon-button
            type="button"
            matSuffix
            class="reveal"
            (click)="showPassword.set(!showPassword())"
            [attr.aria-pressed]="showPassword()"
            [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
          >
            @if (showPassword()) {
              <svg lucideEyeOff [size]="18" aria-hidden="true"></svg>
            } @else {
              <svg lucideEye [size]="18" aria-hidden="true"></svg>
            }
          </button>

          @if (showError('password')) {
            <mat-error>{{ passwordError() }}</mat-error>
          }
        </mat-form-field>

        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }

        <button
          mat-flat-button
          color="primary"
          class="submit"
          type="submit"
          [disabled]="busy()"
        >
          {{ busy() ? 'Signing in…' : 'Sign in' }}
        </button>

        <p class="footer">
          No account yet?
          <a routerLink="/register">Create one</a>
        </p>
      </form>
    </app-auth-frame>
  `,
  styles: [
    `
      .panel {
        display: grid;
        gap: 0.35rem;
      }

      .head {
        margin-bottom: 0.85rem;
      }

      h1 {
        margin: 0;
        font-size: 1.65rem;
        letter-spacing: -0.02em;
        line-height: 1.2;
      }

      .lede {
        margin: 0.45rem 0 0;
        color: var(--fx-ink-muted);
        font-size: 0.95rem;
        line-height: 1.45;
      }

      .full {
        width: 100%;
      }

      .reveal {
        min-width: auto;
        padding: 0 0.5rem;
        font-size: 0.8rem;
        line-height: 1;
        color: var(--fx-accent-strong);
      }

      .submit {
        margin-top: 0.35rem;
        height: 2.75rem;
        font-weight: 600;
      }

      .error {
        margin: 0.15rem 0 0.35rem;
        padding: 0.65rem 0.75rem;
        border-radius: var(--fx-radius-control);
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #991b1b;
        font-size: 0.875rem;
        line-height: 1.4;
      }

      .footer {
        margin: 1rem 0 0;
        color: var(--fx-ink-muted);
        font-size: 0.925rem;
      }

      a {
        color: var(--fx-accent-strong);
        font-weight: 600;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  showError(control: 'email' | 'password'): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.touched || this.submitted());
  }

  emailError(): string {
    const c = this.form.controls.email;
    if (c.hasError('required')) return 'Enter your email.';
    if (c.hasError('email')) return 'That email does not look valid.';
    return 'Check your email.';
  }

  passwordError(): string {
    const c = this.form.controls.password;
    if (c.hasError('required')) return 'Enter your password.';
    if (c.hasError('minlength')) return 'Password must be at least 8 characters.';
    return 'Check your password.';
  }

  submit() {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) {
      return;
    }

    this.busy.set(true);
    this.error.set(null);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.busy.set(false);
        void this.router.navigateByUrl('/');
      },
      error: () => {
        this.busy.set(false);
        this.error.set('Email or password is wrong. Try again, or create an account.');
      },
    });
  }
}

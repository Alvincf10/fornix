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
  selector: 'app-register-page',
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
    <app-auth-frame [points]="registerPoints">
      <form class="panel" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <header class="head">
          <h1>Create account</h1>
          <p class="lede">
            One workspace for experiments, notes, and the trails that did not work.
          </p>
        </header>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Display name</mat-label>
          <input
            matInput
            formControlName="displayName"
            autocomplete="nickname"
            [attr.aria-invalid]="showError('displayName')"
          />
          @if (showError('displayName')) {
            <mat-error>{{ nameError() }}</mat-error>
          }
        </mat-form-field>

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
            autocomplete="new-password"
            [attr.aria-describedby]="passwordHintId"
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
          } @else {
            <mat-hint [id]="passwordHintId">At least 8 characters.</mat-hint>
          }
        </mat-form-field>

        <p class="strength" [class.ok]="passwordReady()" aria-live="polite">
          {{
            passwordReady()
              ? 'Password length looks good.'
              : 'Keep typing — 8+ characters.'
          }}
        </p>


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
          {{ busy() ? 'Creating account…' : 'Create account' }}
        </button>

        <p class="footer">
          Already registered?
          <a routerLink="/login">Sign in</a>
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

      .strength {
        margin: -0.15rem 0 0.35rem;
        font-size: 0.8rem;
        color: var(--fx-ink-muted);
      }

      .strength.ok {
        color: #166534;
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
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly passwordHintId = 'register-password-hint';
  readonly registerPoints = [
    'Start from a blank workspace — nothing to configure first',
    'Keep failed experiments in the timeline, not in a trash pile',
    'Search across research, docs, and attachments later',
  ];

  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  passwordReady(): boolean {
    return (this.form.controls.password.value?.length ?? 0) >= 8;
  }

  showError(control: 'displayName' | 'email' | 'password'): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.touched || this.submitted());
  }

  nameError(): string {
    const c = this.form.controls.displayName;
    if (c.hasError('required')) return 'Enter a display name.';
    if (c.hasError('minlength')) return 'Use at least 2 characters.';
    return 'Check your display name.';
  }

  emailError(): string {
    const c = this.form.controls.email;
    if (c.hasError('required')) return 'Enter your email.';
    if (c.hasError('email')) return 'That email does not look valid.';
    return 'Check your email.';
  }

  passwordError(): string {
    const c = this.form.controls.password;
    if (c.hasError('required')) return 'Choose a password.';
    if (c.hasError('minlength')) return 'Use at least 8 characters.';
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
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.busy.set(false);
        void this.router.navigateByUrl('/');
      },
      error: (err: { status?: number }) => {
        this.busy.set(false);
        this.error.set(
          err.status === 409
            ? 'That email is already registered. Sign in instead.'
            : 'Could not create the account. Check the form and try again.',
        );
      },
    });
  }
}

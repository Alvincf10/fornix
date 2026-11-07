import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../auth/auth.service';

describe('authGuard', () => {
  it('allows authenticated users', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { isAuthenticated: () => true },
        },
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/research' } as never),
    );
    expect(result).toBe(true);
  });

  it('redirects anonymous users to login', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { isAuthenticated: () => false },
        },
      ],
    });

    const router = TestBed.inject(Router);
    const createUrlTree = spyOn(router, 'createUrlTree').and.callThrough();

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/research' } as never),
    );

    expect(createUrlTree).toHaveBeenCalled();
    expect(result).not.toBe(true);
  });
});

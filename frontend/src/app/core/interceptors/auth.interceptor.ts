import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken();

  const withAuth =
    token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')
      ? req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        })
      : req.clone({ withCredentials: true });

  return next(withAuth).pipe(
    catchError((error: HttpErrorResponse) => {
      const isRefreshCall = req.url.includes('/auth/refresh');
      if (error.status !== 401 || isRefreshCall || !auth.accessToken()) {
        return throwError(() => error);
      }

      return auth.refreshAccessToken().pipe(
        switchMap((accessToken) =>
          next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${accessToken}` },
              withCredentials: true,
            }),
          ),
        ),
      );
    }),
  );
};

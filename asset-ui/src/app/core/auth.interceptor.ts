import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { API_URL } from './config';

/** Adds the JWT to every API call; logs out when the server says the token is no longer valid. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isLogin = req.url === `${API_URL}/auth/login`;
  const token = auth.token;

  const authReq = token && req.url.startsWith(API_URL) && !isLogin
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isLogin) {
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};

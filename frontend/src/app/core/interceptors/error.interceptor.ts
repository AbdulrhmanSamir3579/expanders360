import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, throwError, timer } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({
      count: 2,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        if (error.status >= 500 && error.status < 600) {
          console.warn(`[Interceptor] Retrying request ${req.url} (Attempt ${retryCount})...`);
          return timer(1000 * retryCount);
        }
        return throwError(() => error);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status >= 500) {
        console.error('[Interceptor] Server Error:', error);
      }
      return throwError(() => error);
    })
  );
};

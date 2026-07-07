import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { isDebug } from '../utils/string.util';

@Injectable()
export class AuthHeaderInterceptor implements HttpInterceptor {
  constructor(private oidcSecurityService: OidcSecurityService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isApiRequest = req.url.includes('api.digital-trails.org') || req.url.startsWith('/api');
    if (!isApiRequest) {
      return next.handle(req);
    }

    const isDebugHeader = isDebug ? 'True' : 'False';

    return this.oidcSecurityService.getAccessToken().pipe(
      switchMap(token => {
        const setHeaders: Record<string, string> = { 'x-debug': isDebugHeader, 'x-portal': 'True' };
        if (token) {
          setHeaders['Authorization'] = `Bearer ${token}`;
        }
        return next.handle(req.clone({ setHeaders }));
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { isDebug } from '../utils/string.util';

@Injectable()
export class AuthHeaderInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (!req.url.includes('api.digital-trails.org')) {
      return next.handle(req);
    }

    const isDebugHeader = isDebug ? 'True' : 'False';
    const modified = req.clone({
      setHeaders: {
        'x-debug': isDebugHeader
      }
    });
    return next.handle(modified);
  }
}
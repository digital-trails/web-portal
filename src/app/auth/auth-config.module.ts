import { NgModule } from '@angular/core';
import { AuthModule } from 'angular-auth-oidc-client';
import { isDebug } from '../utils/string.util';

@NgModule({
  imports: [AuthModule.forRoot({
    config: {
      authority: isDebug
        ? 'https://sterling-jaguar-76.clerk.accounts.dev'
        : 'https://clerk.digital-trails.org',
      redirectUrl: `${window.location.origin}/`,
      postLogoutRedirectUri: `${window.location.origin}/`,
      clientId: isDebug
        ? 'bUe25ot2qfw6UO4o'
        : 'dqUYbyEs1bzczje4',
      scope: 'profile email openid offline_access',
      responseType: 'code',
      silentRenew: true,
      useRefreshToken: true,
      renewTimeBeforeTokenExpiresInSeconds: 30,
      secureRoutes: ['https://api.digital-trails.org/api/v2.1'],
      customParamsAuthRequest: {
        prompt: 'login',
      }
    }
  })],
  exports: [AuthModule],
})
export class AuthConfigModule {}
import { NgModule } from '@angular/core';
import { AuthModule } from 'angular-auth-oidc-client';
import { isDebug } from '../utils/string.util';

@NgModule({
  imports: [AuthModule.forRoot({
    config: {
      authority: isDebug
        ? 'https://supreme-haddock-40.clerk.accounts.dev'
        : 'https://clerk.portal.digital-trails.org',
      redirectUrl: `${window.location.origin}/`,
      postLogoutRedirectUri: `${window.location.origin}/`,
      clientId: isDebug
        ? 'cp7lBKyHOl6L9uJx'
        : 'LUiM4MwGIce25pqj',
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
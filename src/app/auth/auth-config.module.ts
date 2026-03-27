import { NgModule } from '@angular/core';
import { AuthModule } from 'angular-auth-oidc-client';


@NgModule({
    imports: [AuthModule.forRoot({
        config: {
              authority: 'https://sterling-jaguar-76.clerk.accounts.dev',
              redirectUrl:`${window.location.origin}/`,
              postLogoutRedirectUri: `${window.location.origin}/`,
              clientId: 'bUe25ot2qfw6UO4o',
              scope: 'profile email openid offline_access',
              responseType: 'code',
              silentRenew: true,
              useRefreshToken: true,
              renewTimeBeforeTokenExpiresInSeconds: 30,
              secureRoutes: ['https://digital-trails.org/api/v2'],
          }
      })],
    exports: [AuthModule],
})
export class AuthConfigModule {}

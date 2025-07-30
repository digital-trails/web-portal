import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MsalBroadcastService,
  MsalGuard,
  MsalGuardConfiguration,
  MsalModule,
  MsalRedirectComponent,
  MsalService
} from '@azure/msal-angular';
import {
  InteractionType,
  IPublicClientApplication,
  PublicClientApplication
} from '@azure/msal-browser';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { loginRequest, msalConfig } from './auth.config';
import { UserReducer, UserState } from './store/user/user.reducer';


export const appState = (state: AppState) => state;

export interface AppState {
  userState?: UserState;
}

export const initialState: AppState = {
  userState: undefined,
};

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig);
}


export function MsalGuardConfigurationFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: loginRequest
  };
}


export function initializeMSAL(msalInstance: IPublicClientApplication) {
  return () => msalInstance.initialize();
}


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MsalModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideStore({
      userState: UserReducer
    }),
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeMSAL,
      deps: [MSAL_INSTANCE],
      multi: true
  },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MsalGuardConfigurationFactory,
    },
    MsalService,
    MsalBroadcastService,
    MsalGuard
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule { }
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserReducer, UserState } from './store/user/user.reducer';
import { LoadingComponent } from './components/loading/loading.component';
import { CommonModule } from '@angular/common';
import { ProtocolReducer, ProtocolState } from './store/protocol/protocol.reducer';
import { StudyReducer, StudyState } from './store/study/study.reducer';
import { AuthConfigModule } from './auth/auth-config.module';
import { AuthInterceptor } from 'angular-auth-oidc-client';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthHeaderInterceptor } from './auth/auth-http-interceptor';


export const appState = (state: AppState) => state;

export interface AppState {
  userState?: UserState;
  protocolState?: ProtocolState;
  studyState?: StudyState;
}

export const initialState: AppState = {
  userState: undefined,
  protocolState: undefined
};


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    LoadingComponent,
    AuthConfigModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHeaderInterceptor,
      multi: true
    },
    provideStore({
      userState: UserReducer,
      protocolState: ProtocolReducer,
      studyState: StudyReducer
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
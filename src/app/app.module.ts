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
    provideStore({
      userState: UserReducer,
      protocolState: ProtocolReducer,
      studyState: StudyReducer
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
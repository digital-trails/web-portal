import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { UserReducer, UserState } from './store/user/user.reducer';
import { provideHttpClient } from '@angular/common/http';

export const appState = (state: AppState) => state;

export interface AppState {
  userState?: UserState;
}

export const initialState: AppState = {
  userState: undefined,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideHttpClient(),
    provideStore({
      userState: UserReducer
    })
  ]
};

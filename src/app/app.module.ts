import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app.routing.module';
import { UserState } from './store/user/user.reducer';


export const appState = (state: AppState) => state;

export interface AppState {
  userState?: UserState;
}

export const initialState: AppState = {
  userState: undefined,
};

@NgModule({
  declarations: [],
  imports: [
    AppRoutingModule,
  ],
  providers: []
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { UserFacade } from '../store/user/user.facade';
import { MsalModule, MsalGuard, MSAL_GUARD_CONFIG, MsalInterceptor } from '@azure/msal-angular';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MsalGuardConfigurationFactory } from '../app.module';



@NgModule({
  declarations: [],
  imports: [
    DashboardRoutingModule,
    DashboardComponent,
    CommonModule
  ],
  providers: [
    UserFacade,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    provideHttpClient(withInterceptorsFromDi())]
})
export class DashboardModule { }

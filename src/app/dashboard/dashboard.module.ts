import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { UserFacade } from '../store/user/user.facade';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';



@NgModule({
  declarations: [],
  imports: [
    DashboardRoutingModule,
    DashboardComponent,
    CommonModule
  ],
  providers: [
    UserFacade,
    provideHttpClient(withInterceptorsFromDi())]
})
export class DashboardModule { }

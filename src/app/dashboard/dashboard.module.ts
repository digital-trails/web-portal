import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { UserFacade } from '../store/user/user.facade';



@NgModule({
  declarations: [],
  imports: [
    DashboardRoutingModule,
    DashboardComponent,
    CommonModule,
  ],
  providers: []
})
export class DashboardModule { }

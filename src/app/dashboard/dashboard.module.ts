import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';



@NgModule({
  declarations: [],
  imports: [
    DashboardRoutingModule,
    DashboardComponent,
    CommonModule
  ]
})
export class DashboardModule { }

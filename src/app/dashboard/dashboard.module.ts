import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UserFacade } from '../store/user/user.facade';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { SimpleIdPipe } from '../pipes/simple-id.pipe';
import { LoadingComponent } from '../components/loading/loading.component';



@NgModule({
  declarations: [DashboardComponent],
  imports: [
    DashboardRoutingModule,
    CommonModule,
    SimpleIdPipe,
    LoadingComponent
  ],
  providers: [UserFacade]
})
export class DashboardModule { }

import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
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
  providers: [
    UserFacade,
    provideHttpClient(withInterceptorsFromDi())]
})
export class DashboardModule { }

import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { UserFacade } from '../store/user/user.facade';
import { ConsoleComponent } from './console.component';
import { ConsoleRoutingModule } from './console-routing.module';



@NgModule({
  declarations: [ConsoleComponent],
  imports: [
    ConsoleRoutingModule,
    CommonModule
  ],
  providers: [
    UserFacade,
    provideHttpClient(withInterceptorsFromDi())]
})
export class ConsoleModule { }

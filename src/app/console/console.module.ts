import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { UserFacade } from '../store/user/user.facade';
import { ConsoleComponent } from './console.component';
import { ConsoleRoutingModule } from './console-routing.module';
import { SimpleIdPipe } from "../pipes/simple-id.pipe";
import { ProtocolFacade } from '../store/protocol/protocol.facade';



@NgModule({
  declarations: [ConsoleComponent],
  imports: [
    ConsoleRoutingModule,
    CommonModule,
    SimpleIdPipe
],
  providers: [
    UserFacade,
    ProtocolFacade,
    provideHttpClient(withInterceptorsFromDi())]
})
export class ConsoleModule { }

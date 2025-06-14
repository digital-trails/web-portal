import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { UserFacade } from '../store/user/user.facade';
import { BuilderComponent } from './builder.component';
import { BuilderRoutingModule } from './builder-routing.module';



@NgModule({
  declarations: [BuilderComponent],
  imports: [
    BuilderRoutingModule,
    CommonModule
  ],
  providers: [
    UserFacade,
    provideHttpClient(withInterceptorsFromDi())]
})
export class BuilderModule { }
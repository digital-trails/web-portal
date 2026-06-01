import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ProtocolBuilderComponent } from './protocol-builder.component';
import { DashboardRoutingModule } from '../dashboard/dashboard-routing.module';
import { ProtocolBuilderRoutingModule } from './protocol-builder-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ProtocolBuilderRoutingModule,
  ],
})
export class ProtocolBuilderModule {}
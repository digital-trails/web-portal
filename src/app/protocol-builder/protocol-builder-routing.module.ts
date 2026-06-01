import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProtocolListComponent } from './protocol-list/protocol-list.component';
import { ProtocolBuilderComponent } from './protocol-builder.component';

const routes: Routes = [
  {
    path: '',
    component: ProtocolListComponent,
  },
  {
    path: ':id',
    component: ProtocolBuilderComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProtocolBuilderRoutingModule { }

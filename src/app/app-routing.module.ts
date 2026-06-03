import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';


const routes: Routes = [
  {
    path: "dashboard",
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [MsalGuard]
  },
  {
    path: 'protocol-builder',
    loadChildren: () => import('./protocol-builder/protocol-builder.module').then(m => m.ProtocolBuilderModule),
    canActivate: [MsalGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
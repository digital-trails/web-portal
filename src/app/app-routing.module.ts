import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { autoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';


const routes: Routes = [
  {
    path: "dashboard",
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [autoLoginPartialRoutesGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
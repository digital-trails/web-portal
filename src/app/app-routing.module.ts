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
    path: "console",
    loadChildren: () => import('./console/console.module').then(m => m.ConsoleModule),
    canActivate: [MsalGuard]
  },
  {
    path: "builder",
    loadChildren: () => import('./builder/builder.module').then(m => m.BuilderModule),
    canActivate: [MsalGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
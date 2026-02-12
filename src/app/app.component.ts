import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { map, Observable, take, tap } from 'rxjs';
import { UserFacade } from './store/user/user.facade';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'web-portal';
  isLoggedIn = false;
  isDashboardCollapsed = true;
  pageData$?: Observable<{
    dashboardNames: string[],
  }>

  constructor(
    private userFacade: UserFacade,
    private authService: MsalService,
    private router: Router,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.setLoginDisplay();

    this.authService.handleRedirectObservable().subscribe({
      next: (result) => {
        if (result) {
          this.setLoginDisplay();
        }
      },
      error: (error) => {
        this.setLoginDisplay();
        console.error('Authentication error:', error);
      }
    });
  }

  setLoginDisplay(): void {
    this.isLoggedIn = this.authService.instance.getAllAccounts().length > 0;

    if (this.isLoggedIn) {
      this.loadingService.loadingOn();
      this.pageData$ = this.userFacade.getAdminRoles$().pipe(
        take(1),
        map(roles => ({
          dashboardNames: Object.keys(roles),
        })),
        tap(_ => this.loadingService.loadingOff())
      )
    }
  }

  logout(): void {
    this.authService.logoutRedirect();
  }

  dashboardCollapse() {
    this.isDashboardCollapsed = !this.isDashboardCollapsed;
  }

  selectDashboard(name: string) {
    this.router.navigate(['/dashboard'], {
      queryParams: { study: name }
    });
  }
}
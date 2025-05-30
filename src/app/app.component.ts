import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { take } from 'rxjs';
import { User } from './models/user';
import { UserFacade } from './store/user/user.facade';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'web-portal';
  isLoggedIn = false;
  isDashboardCollapsed = false;
  user?: User = undefined;
  dashboards: [string, string][] = [];

  constructor(
    private userFacade: UserFacade,
    private authService: MsalService,
    private router: Router
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
      this.userFacade.getUser$().pipe(
        take(1)
      ).subscribe(user => {
        this.user = user;
        if(user.admin?.studies) {
          this.dashboards = Array.from(user.admin.studies.entries());
          this.selectDashboard(this.dashboards[0][0], this.dashboards[0][1]);
        }
      })
    }
  }

  logout(): void {
    this.authService.logoutRedirect();
  }

  dashboardCollapse() {
    this.isDashboardCollapsed = !this.isDashboardCollapsed;
  }

  selectDashboard(name: string, url: string) {

    this.router.navigate(['/dashboard'], {
      queryParams: { study: name }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus, EventType } from '@azure/msal-browser';
import { filter, map, Observable, take, tap } from 'rxjs';
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
  pageData$?: Observable<{ dashboardNames: string[] }>;

  constructor(
    private userFacade: UserFacade,
    private authService: MsalService,
    private msalBroadcast: MsalBroadcastService,
    private router: Router,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadingService.loadingOn();

    this.authService.instance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) {
        const account = (event as any).payload?.account;
        if (account) {
          this.authService.instance.setActiveAccount(account);
        }
      }
    });

    this.authService.handleRedirectObservable().subscribe({
      next: () => {
        // Do nothing here—wait for inProgress === None below
      },
      error: (error) => {
        console.error('Authentication error:', error);
      }
    });

    this.msalBroadcast.inProgress$
      .pipe(
        filter((status) => status === InteractionStatus.None),
        take(1)
      )
      .subscribe(() => {
        this.setLoginDisplay();
      });
  }

  private setLoginDisplay(): void {
    this.isLoggedIn = this.authService.instance.getAllAccounts().length > 0;

    if (this.isLoggedIn) {
      this.loadingService.loadingOn();
      this.pageData$ = this.userFacade.getAdminRoles$().pipe(
        take(1),
        map((roles) => ({ dashboardNames: Object.keys(roles) })),
        tap(() => this.loadingService.loadingOff())
      );
    } else {
      this.loadingService.loadingOff();
    }
  }

  logout(): void {
    this.authService.logoutRedirect();
  }

  selectDashboard(name: string) {
    this.router.navigate(['/dashboard'], { queryParams: { study: name } });
  }
}
``
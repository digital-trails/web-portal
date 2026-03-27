import { Component, OnInit } from '@angular/core';
import { map, Observable, take, tap } from 'rxjs';
import { UserFacade } from './store/user/user.facade';
import { LoadingService } from './services/loading.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Router } from '@angular/router';

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
    private authService: OidcSecurityService,
    private loadingService: LoadingService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.checkAuth().pipe(
      take(1)
    ).subscribe(({ isAuthenticated }) => {
      this.isLoggedIn = isAuthenticated;

      if (isAuthenticated) {
        this.loadingService.loadingOn();
        this.pageData$ = this.userFacade.getAdminRoles$().pipe(
          take(1),
          map((roles) => ({ dashboardNames: Object.keys(roles) })),
          tap(() => this.loadingService.loadingOff())
        );
      }
    });
  }

  logout(): void {
    this.authService.logoffLocal();
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }
}
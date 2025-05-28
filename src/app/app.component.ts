import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { RedirectRequest } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { ClientPrincipal } from './models/user';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'web-portal';
  user?: ClientPrincipal = {};
  destroy$ = new Subject<void>();
  isLoggedIn = false;

  constructor(
    private authService: MsalService
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.instance.getAllAccounts().length > 0;
    this.authService.loginPopup().subscribe({
      next: (result) => {
        this.isLoggedIn = true;
      },
      error: (error) => console.log(error)
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    window.location.href = "/logout";
  }
}

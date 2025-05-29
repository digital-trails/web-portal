import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { catchError, map, of, Subject, switchMap } from 'rxjs';
import { ClientPrincipal } from './models/user';
import { Router } from '@angular/router';
import { RedirectRequest } from '@azure/msal-browser';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'web-portal';
  isLoggedIn = false;

  constructor(
    private authService: MsalService,
  ) {  }

  ngOnInit(): void {
    this.setLoginDisplay();

    this.authService.handleRedirectObservable().subscribe({
      next: (result) => {
        if (result) {
          this.setLoginDisplay();
        }
      },
      error: (error) => {
        console.error('Authentication error:', error);
      }
    });
  }

  setLoginDisplay() {
    this.isLoggedIn = this.authService.instance.getAllAccounts().length > 0;
  }
  
}

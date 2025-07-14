import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isBuilderPage = false;
  currentRoute = '';
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: MsalService
  ) { }
  onScriptsClick(): void {
    console.log('Scripts button clicked — could trigger a search feature.');
    // Add your scripts functionality here
  }

  onSensorsClick(): void {
    console.log('Sensors button clicked — open profile settings.');
    // Add your sensors functionality here
  }

  onSidebarClick(): void {
    console.log('Sidebar button clicked — open settings modal.');
    // Add your sidebar functionality here
  }

  onLogoutClick(): void {
    this.authService.logoutRedirect();
  }
}

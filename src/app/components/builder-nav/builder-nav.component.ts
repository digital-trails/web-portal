import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-builder-nav',
  standalone: false,
  templateUrl: './builder-nav.component.html',
  styleUrls: ['./builder-nav.component.css']
})
export class BuilderNavComponent implements OnInit, OnDestroy {
  isBuilderPage = false;
  currentRoute = '';
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: MsalService
  ) {}

  ngOnInit(): void {
    // Check initial route
    this.checkCurrentRoute();

    // Subscribe to route changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.checkCurrentRoute();
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private checkCurrentRoute(): void {
    this.currentRoute = this.router.url;
    this.isBuilderPage = this.router.url.includes('/builder');
    console.log('Current route:', this.currentRoute, 'Is builder page:', this.isBuilderPage);
  }

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
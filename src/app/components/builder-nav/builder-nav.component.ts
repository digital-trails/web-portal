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
  }

  onScriptsClick(): void {
    // TODO: Implement scripts/search functionality
  }

  onSensorsClick(): void {
    // TODO: Implement sensors/profile settings functionality
  }

  onSidebarClick(): void {
    // TODO: Implement sidebar/settings modal functionality
  }

  onLogoutClick(): void {
    this.authService.logoutRedirect();
  }
} 
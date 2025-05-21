import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ClientPrincipal } from './models/user';
import { UserFacade } from './store/user/user.facade';
import { UserState } from './store/user/user.reducer';
import { Store } from '@ngrx/store';
import { UserSelectors } from './store/user/user.selectors';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'web-portal';
  user?: ClientPrincipal = {};
  destroy$ = new Subject<void>();

  constructor(public userfacade: UserFacade) { }

  ngOnInit(): void {

    this.userfacade.loadClientPrinciple();
    this.userfacade.getClientPrinciple$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((clientPrinciple: ClientPrincipal | undefined) => {
      this.user = clientPrinciple;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.userfacade.clearClaims();
    window.location.href = "/logout";
  }
}

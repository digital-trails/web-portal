import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Observable, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { UserFacade } from '../store/user/user.facade';
import { ActivatedRoute } from '@angular/router';
import { User } from '../models/user';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  
  iframeUrl$?: Observable<SafeResourceUrl>;
  users$?: Observable<User[] | undefined>;
  destroy$ = new Subject<void>();
  activeTab: string = 'dashboard'
  selectedUser?: string;
  messageSent: boolean = false;

  constructor(private userFacade: UserFacade, private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.iframeUrl$ = this.route.queryParams.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        return this.userFacade.getUser$().pipe(
          take(1),
          switchMap(user => {
            const study = user?.admin?.studies?.[params["study"]];
            return this.userFacade.dashboardUrl$(study?.dashboard)
          })
        );
      })
    );

    this.users$ = this.route.queryParams.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        return this.userFacade.getUsers$(params["study"]);
      })
    );
  }


  selectUser(user: string) {
    this.selectedUser = user;
  }


  sendMessage(message: string) {
    this.route.queryParams.pipe(
      switchMap(params => {
        var tag: string;
        if(this.selectedUser == 'all') {
          tag = params["study"];
        } else {
          tag = `${params["study"]}-${this.selectedUser}`;
        }
        return this.userFacade.sendMessage$(tag, message).pipe(
          tap(isSent => {
            if(isSent) {
              this.messageSent = true;

            setTimeout(() => {
                  this.messageSent = false;
                }, 2000)
            }
          })
        )
      }),
      take(1),
    ).subscribe();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, map, Observable, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { UserFacade } from '../store/user/user.facade';
import { ActivatedRoute } from '@angular/router';
import { AdminStudy, User, UserStudy } from '../models/user';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  studyCode: string = '';
  pageData$?: Observable<{
    adminStudy: AdminStudy | undefined;
    studyUsers: User[] | undefined;
  }>
  destroy$ = new Subject<void>();
  activeTab: string = 'dashboard'
  selectedUserId?: string;
  messageSent: boolean = false;

  constructor(private userFacade: UserFacade, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.pageData$ = this.route.queryParams.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.studyCode = params["study"];
        return combineLatest([
          this.userFacade.getUser$(),
          this.userFacade.getUsers$(this.studyCode)
        ]).pipe(
          map(([user, users]) => ({
            adminStudy: user?.admin?.studies?.[this.studyCode],
            studyUsers : users
          }))
        );
      })
    );
  }


  selectUser(userId?: string) {
    this.selectedUserId = userId;
  }


  sendMessage(message: string) {
    this.route.queryParams.pipe(
      switchMap(params => {
        var tag: string;
        if (this.selectedUserId == 'all participants') {
          tag = params["study"];
        } else {
          tag = `${params["study"]}-${this.selectedUserId}`;
        }
        return this.userFacade.sendMessage$(tag, message).pipe(
          tap(isSent => {
            if (isSent) {
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
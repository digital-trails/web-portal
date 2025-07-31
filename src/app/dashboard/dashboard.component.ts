import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, map, Observable, of, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { UserFacade } from '../store/user/user.facade';
import { ActivatedRoute } from '@angular/router';
import { AdminStudy, User } from '../models/user';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  messageText: string = '';
  studyCode: string = '';
  selectedUserId: string = '';
  activeTab: string = 'dashboard'
  destroy$ = new Subject<void>();
  pageData$?: Observable<{
    adminStudy: AdminStudy | undefined;
    studyUsers: User[] | undefined;
    ouraTokenNames?: { [name: string]: string };
  }>

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
          switchMap(([user, users]) => {
            this.selectedUserId = '';
            if (user?.admin?.studies[this.studyCode].hasOura) {
              return this.userFacade.getOuraService$(this.studyCode).pipe(
                map(ouraService => ({
                  adminStudy: user?.admin?.studies?.[this.studyCode],
                  studyUsers: users,
                  ouraTokenNames: ouraService.tokens || []
                }))
              )
            }
            return of({
              adminStudy: user?.admin?.studies?.[this.studyCode],
              studyUsers: users
            })
          })
        );
      })
    );
  }


  selectUser(userId: string) {
    this.selectedUserId = userId;
  }

  simpleId(userId: string): string {
    return userId.includes('@') ? userId.slice(0, userId.indexOf('@')) : userId;
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
            if (isSent) this.showMessage('Message sent successfully!');
          })
        )
      }),
      take(1),
    ).subscribe();
  }

  assignToken(pat: string) {
    if (pat?.length > 0) {
      this.userFacade.updateOuraPAT$("post", this.selectedUserId, this.studyCode, pat).pipe(
        take(1)
      ).subscribe(success => {
        if (success) if (success) this.showMessage('Token Updated!');
      })
    }
  }

  hasOuraToken(ouraTokenNames?: { [name: string]: string }): boolean {
    if (!ouraTokenNames) return false
    return Object.values(ouraTokenNames).includes(this.selectedUserId);
  }

  onDelete() {
    this.userFacade.updateOuraPAT$("delete", this.selectedUserId, this.studyCode).pipe(
      take(1)
    ).subscribe(success => {
      if (success) this.showMessage('Token Deleted!');
    })
  }


  showMessage(message: string) {
    this.messageText = message;
    setTimeout(() => this.messageText = '', 2000)
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
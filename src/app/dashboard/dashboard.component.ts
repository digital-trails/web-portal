import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, map, Observable, of, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { UserFacade } from '../store/user/user.facade';
import { ActivatedRoute } from '@angular/router';
import { AdminStudy, User } from '../models/user';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  messageText: string = '';
  studyCode: string = '';
  selectedUserId: string = '';
  activeTab: string = 'users'
  destroy$ = new Subject<void>();
  pageData$?: Observable<{
    adminStudy: AdminStudy | undefined;
    studyUsers: User[] | undefined;
    ouraTokenNames?: { [name: string]: string };
  }>

  constructor(private userFacade: UserFacade, private route: ActivatedRoute, private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.pageData$ = this.route.queryParams.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
         this.loadingService.loadingOn();
        this.studyCode = params["study"];
        return combineLatest([
          this.userFacade.getUser$(),
          this.userFacade.getStudyUsers$(this.studyCode)
        ]).pipe(
          switchMap(([user, studyUsers]) => {
            this.selectedUserId = '';
            if (user?.admin?.studies[this.studyCode].hasOura) {
              return this.userFacade.getOuraService$(this.studyCode).pipe(
                map(ouraService => {
                  return {
                    adminStudy: user?.admin?.studies?.[this.studyCode],
                    studyUsers,
                    ouraTokenNames: ouraService.tokens || []
                  };
                })
              )
            }
            return of({
              adminStudy: user?.admin?.studies?.[this.studyCode],
              studyUsers
            })
          }),
          tap(_ =>  this.loadingService.loadingOff())
        );
      })
    );
  }

  sendMessage(message: string) : void {
    if (message?.length > 0) {
      this.loadingService.loadingOn();
      var tag: string;
      if (this.selectedUserId == 'all participants') {
        tag = this.studyCode;
      } else {
        tag = `${this.studyCode}-${this.selectedUserId}`;
      }
      this.userFacade.sendMessage$(tag, message).pipe(
        tap(isSent => {
          if (isSent) this.showMessage('Message sent successfully!');
        })
      ).subscribe();
    }
  }

  assignToken(pat: string) {
    if (pat?.length > 0) {
      this.loadingService.loadingOn();
      this.userFacade.updateOuraPAT$("post", this.selectedUserId, this.studyCode, pat).pipe(
        take(1)
      ).subscribe(success => {
        if (success) this.showMessage('Token Updated!');
      })
    }
  }

  hasOuraToken(ouraTokenNames?: { [name: string]: string }): boolean {
    if (!ouraTokenNames) return false
    return Object.values(ouraTokenNames).includes(this.selectedUserId);
  }

  onDelete() {
    this.loadingService.loadingOn();
    this.userFacade.updateOuraPAT$("delete", this.selectedUserId, this.studyCode).pipe(
      take(1)
    ).subscribe(success => {
      if (success) this.showMessage('Token Deleted!');
    })
  }

  showMessage(message: string) {
    this.loadingService.loadingOff();
    this.messageText = message;
    setTimeout(() => this.messageText = '', 2000)
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
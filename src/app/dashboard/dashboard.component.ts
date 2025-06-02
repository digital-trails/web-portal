import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { map, Subject, switchMap, take, takeUntil } from 'rxjs';
import { UserFacade } from '../store/user/user.facade';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  iframeUrl?: SafeResourceUrl;
  private destroy$ = new Subject<void>();

  constructor(private userFacade: UserFacade, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        return this.userFacade.getUser$().pipe(
          take(1),
          map(user => user?.admin?.studies.get(params["study"]))
        );
      })
    ).subscribe(url => {
      this.iframeUrl = url;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from '../services/loading.service';
import { StudyFacade } from '../store/study/study.facade';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  messageText: string = '';
  destroy$ = new Subject<void>();
  iframeUrl$?: Observable<SafeResourceUrl>

  constructor(private studyFacade: StudyFacade, private route: ActivatedRoute, private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.iframeUrl$ = this.route.queryParams.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
         this.loadingService.loadingOn();
        return this.studyFacade.getDashboardUrl$(params["study"])
      }),
      tap(_ => this.loadingService.loadingOff()),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
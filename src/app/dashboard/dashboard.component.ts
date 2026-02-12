import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
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
  loadedUrls = new Map<string, SafeResourceUrl>();
  currentStudy: string = '';


  constructor(private studyFacade: StudyFacade, private route: ActivatedRoute, private loadingService: LoadingService) { }

  ngOnInit(): void {
  this.route.params.pipe(
    takeUntil(this.destroy$),
    switchMap(params => {
      this.currentStudy = params["study"];
      if (this.loadedUrls.has(this.currentStudy)) {
        return of(this.loadedUrls.get(this.currentStudy)!);
      }
      this.loadingService.loadingOn();
      return this.studyFacade.getDashboardUrl$(params["study"]).pipe(
        tap(url => {
          this.loadedUrls.set(this.currentStudy, url);
          this.loadingService.loadingOff();
        })
      );
    })
  ).subscribe();
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
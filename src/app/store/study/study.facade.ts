import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.module';
import { HttpFacade } from '../../http.facade';
import { catchError, from, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { StudyActions } from './study.actions';
import { StudySelectors } from './study.selectors';
import { StudyMeta } from '../../models/study-meta';

@Injectable({
    providedIn: 'root'
})
export class StudyFacade {

    constructor(private httpFacade: HttpFacade, private store: Store<AppState>, private sanitizer: DomSanitizer) { }

    getStudies$(): Observable<Record<string, StudyMeta>> {
        return this.store.select(StudySelectors.selectStudies).pipe(
            switchMap(studies => {
                if (studies) return of(studies);

                return this.httpFacade.get<Record<string, StudyMeta>>("https://raw.githubusercontent.com/digital-trails/study-codes/main/study_codes.json").pipe(
                    switchMap(studies => {
                        return of(studies);
                    }),
                    tap(studies => this.store.dispatch(StudyActions.setStudies({ studies }))),
                    catchError(err => {
                        console.error('Failed to fetch studies:', err);
                        return throwError(() => err);
                    })
                );
            })
        );
    }

    getDashboardUrl$(study: string): Observable<SafeResourceUrl> {
         return from(this.httpFacade.getToken()).pipe(
            take(1),
            map(token => {
                const dashboardUrl = `https://trailscontainerapp.victoriousriver-a301e40d.eastus2.azurecontainerapps.io/?study=${study}&token=${token}`;
                return this.sanitizer.bypassSecurityTrustResourceUrl(dashboardUrl);
            }),
            catchError(err => {
                console.error('Failed to generate dashboard URL:', err);
                return throwError(() => err);
            })
        );
    }
}
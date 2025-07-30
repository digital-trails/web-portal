import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { catchError, forkJoin, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { AppState } from '../../app.module';
import { HttpFacade } from '../../http.facade';
import { AdminStudy, User } from '../../models/user';
import { UserActions } from './user.actions';
import { UserSelectors } from './user.selectors';


@Injectable({
    providedIn: 'root'
})
export class UserFacade {

    constructor(private httpFacade: HttpFacade, private store: Store<AppState>, private sanitizer: DomSanitizer) { }

    getUser$(): Observable<User | undefined> {
        return this.store.select(UserSelectors.selectUser).pipe(
            switchMap(user => {
                if (user) return of(user);

                return this.httpFacade.get<User>("https://portal.digital-trails.org/api/v2/user").pipe(
                    switchMap(user => {
                        if (user?.admin?.studies) {

                            const studyEntries = Object.entries(user.admin.studies as { [key: string]: AdminStudy });
                            const dashboardUrlObservables = studyEntries.map(([studyCode, study]) =>
                                this.dashboardUrl$(study.dashboard).pipe(
                                    map(url => ({ studyCode, url }))
                                )
                            );

                            return forkJoin(dashboardUrlObservables).pipe(
                                map(results => {
                                    results.forEach(({ studyCode, url }) => {
                                        const study = user.admin?.studies[studyCode];
                                        study.iframeUrl = url;
                                    });
                                    return user;
                                })
                            );
                        }

                        return of(user);
                    }),
                    tap(user => this.store.dispatch(UserActions.setUser({ user }))),
                    catchError(err => {
                        console.error('Failed to fetch user:', err);
                        return throwError(() => err);
                    })
                );
            })
        );
    }

    getUsers$(studyCode: string): Observable<User[] | undefined> {

        const body = {
            query: `SELECT * FROM Users u WHERE IS_DEFINED(u.user.studies.${studyCode})`
        };

        return this.store.select(UserSelectors.selectUsers(studyCode)).pipe(
            switchMap(users => {
                if (users) return of(users);
                return this.httpFacade.post("https://portal.digital-trails.org/api/v2/users", body, { 'Content-Type': 'application/query+json' }).pipe(
                    map(data => data.Documents as User[]),
                    tap(users => this.store.dispatch(UserActions.setUsers({ studyCode, users }))),
                    catchError(err => throwError(() => err))
                );
            })
        )
    }

    sendMessage$(tag: string, message: string): Observable<boolean> {
        const queryParams = new URLSearchParams({ tag, message }).toString();
        const fullPath = `https://portal.digital-trails.org/api/v2/message?${queryParams}`;

        return this.httpFacade.post(fullPath).pipe(
            map(_ => true),
            catchError(_ => of(false))
        );
    }

    private dashboardUrl$(dashboard: number | undefined): Observable<any> {
        return this.httpFacade.get(`https://portal.digital-trails.org/api/v2/signjwt?dashboard=${dashboard}`).pipe(map(data => this.sanitizer.bypassSecurityTrustResourceUrl(data.url)));
    }
}
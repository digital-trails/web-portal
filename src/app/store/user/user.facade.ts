import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { catchError, EMPTY, forkJoin, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AppState } from '../../app.module';
import { HttpFacade } from '../../http.facade';
import { AdminStudy, User } from '../../models/user';
import { UserActions } from './user.actions';
import { UserSelectors } from './user.selectors';
import { OuraService } from '../../models/oura-service.model';
import { md5Hash } from '../../utils/string.util';


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
                            const dashboardUrlObservables = studyEntries
                                .filter(([_, study]) => !!study.dashboard).map(([studyCode, study]) =>
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

    getStudyUsers$(studyCode: string): Observable<User[] | undefined> {
        const body = {
            query: `SELECT * FROM Users u WHERE IS_DEFINED(u.user.studies.${studyCode})`
        };

        return this.store.select(UserSelectors.selectUsers(studyCode)).pipe(
            switchMap(users => {
                if (users) return of(users);
                return this.httpFacade.post("https://portal.digital-trails.org/api/v2/users", body, { 'Content-Type': 'application/query+json' }).pipe(
                    map(data => data.Documents as User[]),
                    tap(users => this.store.dispatch(UserActions.setStudyUsers({ studyCode, users }))),
                    catchError(err => throwError(() => err))
                );
            })
        )
    }

    getAllUsers$(): Observable<User[] | undefined> {
        const body = {
            query: `SELECT * FROM Users`
        };

        return this.store.select(UserSelectors.selectAllUsers).pipe(
            switchMap(users => {
                if (users) return of(users);
                return this.httpFacade.post("https://portal.digital-trails.org/api/v2/users", body, { 'Content-Type': 'application/query+json' }).pipe(
                    map(data => data.Documents as User[]),
                    tap(users => this.store.dispatch(UserActions.setAllUsers({ users }))),
                    catchError(err => throwError(() => err))
                );
            })
        )
    }

    getOuraService$(studyCode: string): Observable<OuraService> {
        return this.store.select(UserSelectors.selectOuraService(studyCode)).pipe(
            switchMap(ouraService => {
                if (ouraService) return of(ouraService);
                var headers = {
                    'service': "oura",
                    'study': studyCode
                };
                return this.httpFacade.get<OuraService>("https://portal.digital-trails.org/api/v2/service", headers).pipe(
                    tap(ouraService => this.store.dispatch(UserActions.setOuraService({ studyCode, ouraService }))),
                    catchError(err => throwError(() => err))
                );
            })
        )
    }

    updateOuraPAT$(method: string, userId: string, studyCode: string, pat: string = ''): Observable<boolean> {

        const name: string = md5Hash(`${studyCode}-${userId}-oura-pat`);
        const body = {
            operations: [
                {
                    op: method == "post" ? "set" : "remove",
                    path: `/tokens/${name}`,
                    value: method == "post" ? userId : undefined,
                }
            ]
        };

        var headers = {
            'service': "oura",
            'study': studyCode
        };

        return this.httpFacade.patch("https://portal.digital-trails.org/api/v2/service", body, headers).pipe(
            switchMap(_ => this.updateSecret$(method, name, pat).pipe(
                map(_ => true),
                tap(_ => {
                    const val: string | undefined = method == "post" ? userId : undefined;
                    return this.store.dispatch(UserActions.updateOuraPAT({ studyCode, userId: val, name }));
                }),
            )),
            catchError(_ => of(false))
        )
    }

    createOuraService(studyCode: string): void {
        const body = {
            id: "oura",
            study: studyCode,
            tokens: {}
        };
        this.httpFacade.post("https://portal.digital-trails.org/api/v2/service", body, { 'study': studyCode }).pipe(
            take(1),
            catchError(err => {
                if (err.status == 409) return of([]);
                return throwError(() => err);
            })
        ).subscribe();
    }

    updateSecret$(method: string, secretName: string, secretVal: string = ''): Observable<boolean> {
        const path: string = "https://portal.digital-trails.org/api/v2/secret";
        const body = { secretName, secretVal };
        var func: Observable<any> = method == "post" ? this.httpFacade.post(path, body) : this.httpFacade.delete(path, body);

        return func.pipe(take(1), map(_ => true), catchError(_ => of(false)));
    }


    sendMessage$(tag: string, message: string): Observable<boolean> {
        const queryParams = new URLSearchParams({ tag, message }).toString();
        const fullPath = `https://portal.digital-trails.org/api/v2/message?${queryParams}`;

        return this.httpFacade.post(fullPath).pipe(
            map(_ => true),
            catchError(_ => of(false))
        );
    }

    updateUser$(userId: string, op: string, path: string, value: any = undefined): Observable<boolean> {

        const body = { operations: [{ op, path, value }] };
        var headers = {'userId': userId };

        return this.httpFacade.patch("https://portal.digital-trails.org/api/v2/users", body, headers).pipe(
            map(_ => true),
            tap(_ => this.store.dispatch(UserActions.updateUser({ path, value, userId }))),
            catchError(_ => of(false))
        )
    }

    private dashboardUrl$(dashboard: number | undefined): Observable<any> {
        return this.httpFacade.get(`https://portal.digital-trails.org/api/v2/signjwt?dashboard=${dashboard}`).pipe(map(data => this.sanitizer.bypassSecurityTrustResourceUrl(data.url)));
    }
}
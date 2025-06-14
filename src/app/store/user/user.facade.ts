import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { catchError, forkJoin, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { AppState } from '../../app.module';
import { HttpFacade } from '../../http.facade';
import { User } from '../../models/user';
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
                if(user) return of(user);
                return this.httpFacade.get("https://portal.digital-trails.org/api/v2/user").pipe(
                    switchMap(data => {
                        const adminStudies = data?.admin ? Object.entries(data.admin.studies) : [];
                        const dashboardObservables = adminStudies.map(([key, value]) => 
                            this.dashboardUrl$(Number(value)).pipe(
                                map(url => [key, url] as [string, string])
                            )
                        );
                        return forkJoin(dashboardObservables).pipe(
                            map(dashboardResults => {
        
                                var user: User = {
                                    id: data.id,
                                    super_admin: data?.super_admin || false
                                };
        
                                if(data?.admin) {
                                    user.admin = {
                                        studies: new Map<string, string>(dashboardResults)
                                    };
                                }
        
                                if(data?.user) {
                                    user.user = {
                                        studies: [...data?.user.studies]
                                    };
                                }
        
                                return user;
                            })
                        );
                    }),
                    tap(user =>  {
                        if(user) {
                            this.store.dispatch(UserActions.setUser({ user }))
                        }
                    }),
                    catchError(err => {
                        if (err.status === 404) {
                            return of(undefined);
                          }
                          return throwError(() => err)
                    })
                );
            })
        );
    }

    dashboardUrl$(dashboard: number | undefined): Observable<any> {
        return this.httpFacade.get(`https://portal.digital-trails.org/api/v2/signjwt?dashboard=${dashboard}`).pipe(map(data => this.sanitizer.bypassSecurityTrustResourceUrl(data.url)));
    }
}
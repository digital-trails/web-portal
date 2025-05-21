import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { EMPTY, map, Observable, switchMap, take, tap } from 'rxjs';
import { AppState } from '../../app.config';
import { HttpFacade } from '../../http.facade';
import { ClientPrincipal } from '../../models/user';
import { UserActions } from './user.actions';
import { UserSelectors } from './user.selectors';


@Injectable({
    providedIn: 'root'
})
export class UserFacade {

    constructor(private httpFacade: HttpFacade, private store: Store<AppState>) { }

    get getClientPrinciple$(): Observable<ClientPrincipal | undefined> {
        return this.store.select(UserSelectors.selectClientPrincipal);
    }

    loadClientPrinciple(): void {
        this.store.select(UserSelectors.selectIsLoaded).pipe(
            take(1),
            switchMap(isLoaded => {
                if (isLoaded) {
                    return EMPTY;
                }
                return this.httpFacade.get(`.auth/me`).pipe(
                    take(1),
                    tap(data => {
                        this.store.dispatch(UserActions.setClientPrincipal({
                            clientPrincipal: data.clientPrincipal
                        }));
                    }));
            })
        ).subscribe()
    }

    dashboardUrl$() : Observable<any> {
        return this.httpFacade.get(`api/sign-jwt`).pipe(map(data => data.url));
    }

    clearClaims(): void {
        this.store.dispatch(UserActions.setClientPrincipal({
            clientPrincipal: undefined
        }));
    }
}
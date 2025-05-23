import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, EMPTY, map, Observable, of, switchMap, take, tap } from 'rxjs';
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
                return this.httpFacade.getAuth().pipe(
                    take(1),
                    tap(data => {
                        this.store.dispatch(UserActions.setClientPrincipal({
                            clientPrincipal: data.clientPrincipal
                        }));
                    }));
            })
        ).subscribe()
    }

    dashboardUrl$(): Observable<any> {
        return this.httpFacade.get("https://digital-trails.org/api/v2/SignJwt");
    }

    clearClaims(): void {
        this.store.dispatch(UserActions.setClientPrincipal({
            clientPrincipal: undefined
        }));
    }
}
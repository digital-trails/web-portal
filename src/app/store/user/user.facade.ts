import { catchError, map, Observable, of, switchMap, take } from 'rxjs';
import { setUserClaims } from './user.actions';
import { Injectable, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { HttpFacade } from '../../http.facade';
import { UserActions } from './user.selectors';
import { Store } from '@ngrx/store';
import { UserState } from './user.reducer';


@Injectable({
    providedIn: 'root'
  })
export class UserFacade {

    constructor(private httpFacade: HttpFacade, private store: Store<UserState>) {}

     getClaims() : Observable<any> {

        var temp = this.store.select(UserActions.selectIsLoaded).pipe(map(data => {
            return !data;
        })).subscribe(data => {

        });
        
        return this.store.select(UserActions.selectIsLoaded).pipe(
            switchMap(isLoaded => {
                if(isLoaded) {
                    return  this.store.select(UserActions.selectClaims);
                }
                return this.httpFacade.get(`.auth/me`).pipe(map(c => {
                    var temp = c;
                }))
            }),
            catchError(error => {
                return  of();
            })
        );
    }
}
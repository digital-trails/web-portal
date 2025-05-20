import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { first, map, switchMap, take } from 'rxjs/operators';
import { UserFacade } from '../store/user/user.facade';

@Injectable({
  providedIn: 'root'
})
export class DashboardResolver implements Resolve<any> {

  constructor(private facade: UserFacade) {}

  resolve(): Observable<any> {
    return this.facade.getClaims().pipe(map(take(1)));
  }
}
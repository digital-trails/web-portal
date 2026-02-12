import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { catchError, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AppState } from '../../app.module';
import { HttpFacade } from '../../http.facade';
import { UserActions } from './user.actions';
import { UserSelectors } from './user.selectors';
import { Role } from '../../models/role';

@Injectable({
    providedIn: 'root'
})
export class UserFacade {

    constructor(private httpFacade: HttpFacade, private store: Store<AppState>, private sanitizer: DomSanitizer) { }

    getRoles$(): Observable<Record<string, Role[]>> {
        return this.store.select(UserSelectors.selectRoles).pipe(
            switchMap(roles => {
                if (roles) return of(roles);

                return this.httpFacade.get("https://digital-trails.org/api/v2/roles").pipe(
                    map(roles => this.mapRoles(roles)),
                    tap(roles => this.store.dispatch(UserActions.setRoles({ roles }))),
                    catchError(err => {
                        console.error('Failed to fetch studies:', err);
                        return throwError(() => err);
                    })
                );
            })
        );
    }

    getAdminRoles$(): Observable<Record<string, Role[]>> {
    return this.getRoles$().pipe(
        map(roles => {
            const adminRoles: Record<string, Role[]> = {};
            for (const key in roles) {
                const filteredRoles = roles[key].filter(role => role.roles.includes('admin'));
                if (filteredRoles.length > 0) {
                    adminRoles[key] = filteredRoles;
                }
            }
            
            return adminRoles;
        })
    );
}

    mapRoles(data: any): Record<string, Role[]> {
        const roleMapping: Record<string, Role[]> = {};

        if (data && Array.isArray(data.Documents)) {
            for (const doc of data.Documents) {
                if (doc?.id && Array.isArray(doc.roles)) {

                    const parts = doc.id.split(':');

                    if (parts.length === 2) {
                        const resource = parts[0];
                        const key = parts[1];

                        if (!roleMapping[key]) {
                            roleMapping[key] = [];
                        }

                        roleMapping[key].push({
                            resource: resource,
                            roles: doc.roles
                        });
                    }
                }
            }
        }

        return roleMapping;
    }
}
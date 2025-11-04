import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "../../app.module";
import { HttpFacade } from "../../http.facade";
import { ProtocolSelectors } from "./protocol.selectors";
import { catchError, map, Observable, of, switchMap, tap, throwError } from "rxjs";
import { StudyCodes } from "../../models/study-codes";
import { ProtocolActions } from "./protocol.actions";

@Injectable({
    providedIn: 'root'
})
export class ProtocolFacade {
    constructor(private httpFacade: HttpFacade, private store: Store<AppState>) { }

    getStudyCodes$(): Observable<{ [studyCode: string]: StudyCodes }> {
        return this.store.select(ProtocolSelectors.selectStudyCodes).pipe(
            switchMap(studyCodes => {
                if (studyCodes) return of(studyCodes);
                return this.httpFacade.get<{ [studyCode: string]: StudyCodes }>("https://raw.githubusercontent.com/digital-trails/study-codes/main/study_codes.json", {}, false).pipe(
                    tap(studyCodes => this.store.dispatch(ProtocolActions.setStudyCodes({ studyCodes }))),
                    catchError(err => throwError(() => err))
                );
            })
        )
    }
}
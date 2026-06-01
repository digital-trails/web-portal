import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "../../app.module";
import { HttpFacade } from "../../http.facade";
import { ProtocolSelectors } from "./protocol.selectors";
import { catchError, Observable, of, switchMap, take, tap, throwError } from "rxjs";
import { StudyCodes } from "../../models/study-codes";
import { Protocol, ProtocolStatus } from "../../models/protocol";
import { ProtocolActions } from "./protocol.actions";

const STORAGE_KEY = 'dt_protocols';

@Injectable({
    providedIn: 'root'
})
export class ProtocolFacade {
    private storageLoaded = false;

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

    loadProtocols(): void {
        if (this.storageLoaded) return;
        this.storageLoaded = true;
        const stored = this.loadFromStorage();
        this.store.dispatch(ProtocolActions.setProtocols({ protocols: stored }));
    }

    getProtocols$(): Observable<Protocol[]> {
        this.loadProtocols();
        return this.store.select(ProtocolSelectors.selectProtocols);
    }

    getProtocol$(id: string): Observable<Protocol | undefined> {
        this.loadProtocols();
        return this.store.select(ProtocolSelectors.selectProtocolById(id));
    }

    createProtocol(name: string, data: Record<string, unknown> = {}): Protocol {
        const now = new Date().toISOString();
        const protocol: Protocol = {
            id: crypto.randomUUID(),
            name,
            status: 'draft',
            createdAt: now,
            updatedAt: now,
            data,
        };
        this.store.dispatch(ProtocolActions.addProtocol({ protocol }));
        this.persistToStorage();
        return protocol;
    }

    updateProtocol(protocol: Protocol): void {
        const updated = { ...protocol, updatedAt: new Date().toISOString() };
        this.store.dispatch(ProtocolActions.updateProtocol({ protocol: updated }));
        this.persistToStorage();
    }

    deleteProtocol(id: string): void {
        this.store.dispatch(ProtocolActions.deleteProtocol({ id }));
        this.persistToStorage();
    }

    setStatus(id: string, status: ProtocolStatus): void {
        this.store.dispatch(ProtocolActions.setProtocolStatus({ id, status }));
        this.persistToStorage();
    }

    duplicateProtocol(source: Protocol): Protocol {
        const now = new Date().toISOString();
        const copy: Protocol = {
            id: crypto.randomUUID(),
            name: `${source.name} (Copy)`,
            status: 'draft',
            createdAt: now,
            updatedAt: now,
            data: structuredClone(source.data),
        };
        this.store.dispatch(ProtocolActions.addProtocol({ protocol: copy }));
        this.persistToStorage();
        return copy;
    }

    private persistToStorage(): void {
        this.store.select(ProtocolSelectors.selectProtocols).pipe(
            take(1)
        ).subscribe(protocols => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(protocols));
        });
    }

    private loadFromStorage(): Protocol[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }
}

import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, isDevMode } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { AppState } from "./app.config";

@Injectable({
    providedIn: 'root'
})
export class HttpFacade {
    constructor(private httpClient: HttpClient, private store: Store<AppState>) { }

    get(path: string): Observable<any> {
        return this.httpClient.get(path, {
            withCredentials: true
        });
    }


    getAuth(): Observable<any> {
        var url = isDevMode() ? "http://localhost:4280/.auth/me" : "https://portal.digital-trails.org/.auth/me";
        return this.httpClient.get(url);
    }
}
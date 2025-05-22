import { HttpClient } from "@angular/common/http";
import { Injectable, isDevMode } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class HttpFacade {
    constructor(private httpClient: HttpClient) { }

    get(path: string): Observable<any> {
        return this.httpClient.get(path);
    }

    getAuth(): Observable<any> {
        var url = isDevMode() ? "http://localhost:4280/.auth/me" : "https://portal.digital-trails.org/.auth/me";
        return this.httpClient.get(url);
    }
}
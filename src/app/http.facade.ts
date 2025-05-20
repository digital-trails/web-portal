import { HttpClient } from "@angular/common/http";
import { Injectable, isDevMode } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
  })
export class HttpFacade {
    constructor(private httpClient: HttpClient) {}

    get(path:string) : Observable<any> {

        var baseUrl = isDevMode() ? "http://localhost:4280" : "https://portal.digital-trails.org";
        return this.httpClient.get(`${baseUrl}/${path}`);
    }
}
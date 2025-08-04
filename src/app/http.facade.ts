import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, isDevMode } from "@angular/core";
import { MsalService } from "@azure/msal-angular";
import { from, Observable, switchMap, take } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class HttpFacade {
    constructor(private httpClient: HttpClient, private authService: MsalService) { }

    get<TProperty>(path: string, headers: any = {}, hasAuth: boolean = true): Observable<any> {
        return from(this.getToken()).pipe(
            take(1),
            switchMap(token => {
                if(hasAuth) headers["Authorization"] = `Bearer ${token}`;
                return this.httpClient.get<TProperty>(path, { headers });
            })
        );
    }

    post(path: string, body: any = {}, headers: any = {}): Observable<any> {
        return from(this.getToken()).pipe(
            take(1),
            switchMap(token => {
                headers["Authorization"] = `Bearer ${token}`;
                return this.httpClient.post(path, body, { headers });
            })
        );
    }

    delete(path: string, body: any = {}, headers: any = {}): Observable<any> {
        return from(this.getToken()).pipe(
            take(1),
            switchMap(token => {
                headers["Authorization"] = `Bearer ${token}`;
                return this.httpClient.delete(path, { headers, body });
            })
        );
    }


    patch(path: string, body: any = {}, headers: any = {}): Observable<any> {
        return from(this.getToken()).pipe(
            take(1),
            switchMap(token => {
                headers["Authorization"] = `Bearer ${token}`;
                return this.httpClient.patch(path, body, { headers });
            })
        );
    }

    private async getToken(): Promise<string> {
        try {
            const accounts = this.authService.instance.getAllAccounts();
            if (accounts.length === 0) {
                throw new Error('No accounts found');
            }

            const silentRequest = {
                scopes: ['https://digitaltrailsuva.onmicrosoft.com/api/read'],
                account: accounts[0]
            };

            const response = await this.authService.instance.acquireTokenSilent(silentRequest);
            return response.accessToken;
        } catch (error) {
            console.error('Token acquisition failed:', error);
            throw error;
        }
    }
}
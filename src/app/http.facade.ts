import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, isDevMode } from "@angular/core";
import { MsalService } from "@azure/msal-angular";
import { from, Observable, switchMap, take } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class HttpFacade {
    constructor(private httpClient: HttpClient, private authService: MsalService) { }

    get(path: string): Observable<any> {
        return from(this.getToken()).pipe(
            take(1),
            switchMap(token => {
                const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
                return this.httpClient.get(path, { headers });
            })
        );
    }


    getAuth(): Observable<any> {
        var url = isDevMode() ? "http://localhost:4200/.auth/me" : "https://portal.digital-trails.org/.auth/me";
        return this.httpClient.get(url);
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
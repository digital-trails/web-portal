import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, isDevMode } from "@angular/core";
import { MsalService } from "@azure/msal-angular";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { from, Observable, switchMap, take } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class HttpFacade {
    constructor(private httpClient: HttpClient, private authService: MsalService) { }

    get<TProperty>(path: string, headers: any = {}, hasAuth: boolean = true, responseType: string = 'json'): Observable<any> {
        return from(this.getToken()).pipe(
            take(1),
            switchMap(token => {
                if(hasAuth) headers["Authorization"] = `Bearer ${token}`;
                return this.httpClient.get<TProperty>(path, { headers, responseType: responseType as any });
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

   public async getToken(): Promise<string> {
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
  } catch (error: any) {
    if (error instanceof InteractionRequiredAuthError) {
      await this.authService.acquireTokenRedirect({
        scopes: ['https://digitaltrailsuva.onmicrosoft.com/api/read'],
        account: this.authService.instance.getAllAccounts()[0] ?? undefined
      });
      return new Promise<string>(() => { });
    }

    console.error('Token acquisition failed:', error);
    throw error;
  }
}
}
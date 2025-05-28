import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MSAL_INSTANCE, MsalGuard, MsalModule, MsalService } from '@azure/msal-angular';
import { IPublicClientApplication, PublicClientApplication } from '@azure/msal-browser';

import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

export function MSALInstanceFactory(): IPublicClientApplication {
    return new PublicClientApplication({
        auth: {
            clientId: '9a71ebd4-a3d4-4cfb-a5ac-c288332bafe4',
            authority: 'https://login.microsoftonline.com/c9e9898a-d915-4e67-be43-e989732b39f5',
            redirectUri: '/dashboard'
        },
        cache: {
            cacheLocation: 'localStorage'
        }
    });
}

export function initializeMSAL(msalInstance: IPublicClientApplication) {
    return () => msalInstance.initialize();
}

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        MsalModule,
        RouterModule
    ],
    providers: [
        {
            provide: MSAL_INSTANCE,
            useFactory: MSALInstanceFactory
        },
        {
            provide: APP_INITIALIZER,
            useFactory: initializeMSAL,
            deps: [MSAL_INSTANCE],
            multi: true
        },
        MsalGuard,
        MsalService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
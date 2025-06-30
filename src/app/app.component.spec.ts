import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MsalService } from '@azure/msal-angular';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { UserFacade } from './store/user/user.facade';
import { HeaderComponent } from './components/header/header.component';
import { BuilderNavComponent } from './components/builder-nav/builder-nav.component';

describe('AppComponent', () => {
  let mockMsalService: jasmine.SpyObj<MsalService>;
  let mockUserFacade: jasmine.SpyObj<UserFacade>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create spy objects for dependencies
    mockMsalService = jasmine.createSpyObj('MsalService', ['logoutRedirect'], {
      instance: {
        getAllAccounts: () => []
      },
      handleRedirectObservable: () => of(null)
    });

    mockUserFacade = jasmine.createSpyObj('UserFacade', ['getUser$'], {
      getUser$: () => of(null)
    });

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        HeaderComponent,
        BuilderNavComponent
      ],
      imports: [
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MsalService, useValue: mockMsalService },
        { provide: UserFacade, useValue: mockUserFacade },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'web-portal' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('web-portal');
  });

  it('should initialize login display on init', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    
    app.ngOnInit();
    
    expect(app.isLoggedIn).toBeFalse();
    expect(mockMsalService.handleRedirectObservable).toHaveBeenCalled();
  });
});

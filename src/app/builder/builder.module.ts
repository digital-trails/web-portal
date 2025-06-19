import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';

import { UserFacade } from '../store/user/user.facade';
import { BuilderComponent } from './builder.component';
import { BuilderRoutingModule } from './builder-routing.module';

// import your BottomBarComponent here
import { BottomBarComponent } from '../components/bottom-bar/bottom-bar.component';

@NgModule({
  declarations: [
    BuilderComponent,
    BottomBarComponent
  ],
  imports: [
    BuilderRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    // PrimeNG Modules
    ButtonModule,
    CardModule,
    InputTextModule,
    InputSwitchModule,
    PanelModule,
    DividerModule,
    TooltipModule,
    TabViewModule
  ],
  providers: [
    UserFacade,
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class BuilderModule { }

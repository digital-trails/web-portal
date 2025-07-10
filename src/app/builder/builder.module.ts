import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { DropdownModule } from 'primeng/dropdown';
import { ColorPickerModule } from 'primeng/colorpicker';
import { CheckboxModule } from 'primeng/checkbox';

import { UserFacade } from '../store/user/user.facade';
import { BuilderComponent } from './builder.component';
import { BuilderRoutingModule } from './builder-routing.module';
import { AiChatbotComponent } from '../components/ai-chatbot/ai-chatbot.component';

@NgModule({
  declarations: [
    BuilderComponent
  ],
  imports: [
    BuilderRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AiChatbotComponent,
    // PrimeNG Modules
    ButtonModule,
    CardModule,
    InputTextModule,
    InputSwitchModule,
    PanelModule,
    DividerModule,
    TooltipModule,
    TabViewModule,
    FileUploadModule,
    MessageModule,
    DropdownModule,
    ColorPickerModule,
    CheckboxModule
  ],
  providers: [
    UserFacade,
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class BuilderModule { }

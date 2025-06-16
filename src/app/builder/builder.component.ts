// builder.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';

interface AppButton {
  text: string;
  icon?: string | { url: string; tint: boolean };
  action?: string;
}

interface AppConfig {
  home: {
    title: string;
    banner_text: string;
    banner_icon: string;
    button_ls: AppButton;
    button_rs: AppButton;
    button_surveys: AppButton;
    button_tl: AppButton;
    button_tr: AppButton;
    button_br: AppButton;
    button_bl: AppButton;
  };
}

@Component({
  selector: 'app-builder',
  standalone: false,
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.css']
})
export class BuilderComponent {
  activeSection = 'users';
  searchQuery = '';


  showSection(section: string) {
    this.activeSection = section;
  }

  exportConfig(): void {
    console.log('Current App Config:', JSON.stringify(this.appConfig, null, 2));
  }
}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

// Protocol.json interfaces
interface ProtocolIcon {
  url: string;
  tint?: boolean;
}

interface ProtocolAlert {
  type: 'alert';
  title: string;
  message: string;
  icon?: ProtocolIcon;
}

interface ProtocolSessions {
  type: 'sessions';
  left: {
    text: string;
    icon: string;
  };
  right: {
    text: string;
    icon: string;
    action: string;
  };
}

interface ProtocolButton {
  type: 'button';
  action: {
    text: string;
    action: string;
  };
}

interface ProtocolAction {
  text: string;
  icon: string;
  action: string;
  backgroundcolor?: string;
  markcompleted?: boolean;
}

interface ProtocolCarousel {
  type: 'carousel';
  actions: ProtocolAction[];
}

interface ProtocolTiles {
  type: 'tiles';
  actions: ProtocolAction[];
}

type ProtocolElement = ProtocolAlert | ProtocolSessions | ProtocolButton | ProtocolCarousel | ProtocolTiles;

interface ProtocolHome {
  title: string;
  flavors?: string[];
  sessions?: boolean;
  buttons?: string[][];
  elements?: ProtocolElement[];
}

interface ProtocolMenuItem {
  text: string;
  icon: string;
}

interface ProtocolTrigger {
  type: string;
  action: string;
  content: string;
  frequency?: string;
  time?: string;
}

interface ProtocolProbe {
  type: string;
  optional?: boolean;
  interval?: string;
  accuracy?: number;
}

interface Protocol {
  icon?: string;
  home: ProtocolHome;
  menu?: ProtocolMenuItem[];
  triggers?: ProtocolTrigger[];
  probes?: ProtocolProbe[];
}

@Component({
  selector: 'app-builder',
  standalone: false,
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.css']
})
export class BuilderComponent implements OnInit {
  appForm: FormGroup;
  uploadError: string = '';
  
  // Current protocol data
  protocol: Protocol = {
    home: {
      title: "My App",
      elements: []
    }
  };
  
  // Simple data structure for backward compatibility and preview
  appData = {
    title: "My App",
    subtitle: "App Builder Demo",
    button1: "Button 1",
    button2: "Button 2", 
    button3: "Button 3",
    button4: "Button 4"
  };

  constructor(
    private fb: FormBuilder,
    private authService: MsalService,
    private router: Router
  ) {
    this.appForm = this.createForm();
  }

  ngOnInit(): void {
    // Subscribe to form changes for real-time updates
    this.appForm.valueChanges.subscribe((value) => {
      this.updateAppData(value);
      this.updateProtocolFromForm(value);
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: [this.appData.title, Validators.required],
      subtitle: [this.appData.subtitle],
      button1: [this.appData.button1],
      button2: [this.appData.button2],
      button3: [this.appData.button3],
      button4: [this.appData.button4],
      // New fields for expanded functionality
      appIcon: [''],
      elements: this.fb.array([])
    });
  }

  get elementsArray(): FormArray {
    return this.appForm.get('elements') as FormArray;
  }

  updateAppData(formValue: any): void {
    this.appData.title = formValue.title || "My App";
    this.appData.subtitle = formValue.subtitle || "App Builder Demo";
    this.appData.button1 = formValue.button1 || "Button 1";
    this.appData.button2 = formValue.button2 || "Button 2";
    this.appData.button3 = formValue.button3 || "Button 3";
    this.appData.button4 = formValue.button4 || "Button 4";
  }

  updateProtocolFromForm(formValue: any): void {
    this.protocol.home.title = formValue.title || "My App";
    if (formValue.appIcon) {
      this.protocol.icon = formValue.appIcon;
    }
  }

  onFileUpload(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      this.uploadError = 'Please upload a valid JSON file';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const uploadedProtocol = JSON.parse(result);
        
        if (this.validateProtocol(uploadedProtocol)) {
          this.protocol = uploadedProtocol;
          this.populateFormFromProtocol();
          this.uploadError = '';
        } else {
          this.uploadError = 'Invalid protocol.json format';
        }
      } catch (error) {
        this.uploadError = 'Invalid JSON file';
      }
    };
    reader.readAsText(file);
  }

  validateProtocol(data: any): boolean {
    // Basic validation for protocol.json structure
    if (!data || typeof data !== 'object') return false;
    if (!data.home || typeof data.home !== 'object') return false;
    if (!data.home.title || typeof data.home.title !== 'string') return false;
    
    // Validate elements if they exist
    if (data.home.elements && Array.isArray(data.home.elements)) {
      for (const element of data.home.elements) {
        if (!element.type || typeof element.type !== 'string') return false;
        const validTypes = ['alert', 'sessions', 'button', 'carousel', 'tiles'];
        if (!validTypes.includes(element.type)) return false;
      }
    }
    
    return true;
  }

  populateFormFromProtocol(): void {
    const home = this.protocol.home;
    
    // Update basic fields
    this.appForm.patchValue({
      title: home.title,
      appIcon: this.protocol.icon || ''
    });

    // Handle legacy buttons format
    if (home.buttons && Array.isArray(home.buttons)) {
      this.appForm.patchValue({
        button1: home.buttons[0]?.[0] || '',
        button2: home.buttons[1]?.[0] || '',
        button3: home.buttons[2]?.[0] || '',
        button4: home.buttons[3]?.[0] || ''
      });
    }

    // Clear and rebuild elements array
    this.elementsArray.clear();
    if (home.elements) {
      home.elements.forEach(element => {
        this.addElementToForm(element);
      });
    }
  }

  addElementToForm(element: ProtocolElement): void {
    let elementForm: FormGroup;

    switch (element.type) {
      case 'alert':
        const alertElement = element as ProtocolAlert;
        elementForm = this.fb.group({
          type: ['alert'],
          title: [alertElement.title || ''],
          message: [alertElement.message || ''],
          iconUrl: [alertElement.icon?.url || ''],
          iconTint: [alertElement.icon?.tint || false]
        });
        break;
      
      case 'sessions':
        const sessionsElement = element as ProtocolSessions;
        elementForm = this.fb.group({
          type: ['sessions'],
          leftText: [sessionsElement.left?.text || ''],
          leftIcon: [sessionsElement.left?.icon || ''],
          rightText: [sessionsElement.right?.text || ''],
          rightIcon: [sessionsElement.right?.icon || ''],
          rightAction: [sessionsElement.right?.action || '']
        });
        break;

      case 'button':
        const buttonElement = element as ProtocolButton;
        elementForm = this.fb.group({
          type: ['button'],
          actionText: [buttonElement.action?.text || ''],
          actionUrl: [buttonElement.action?.action || '']
        });
        break;

      case 'carousel':
        const carouselElement = element as ProtocolCarousel;
        elementForm = this.fb.group({
          type: ['carousel'],
          actions: this.fb.array(carouselElement.actions?.map(action => this.createActionForm(action)) || [])
        });
        break;

      case 'tiles':
        const tilesElement = element as ProtocolTiles;
        elementForm = this.fb.group({
          type: ['tiles'],
          actions: this.fb.array(tilesElement.actions?.map(action => this.createActionForm(action)) || [])
        });
        break;

      default:
        elementForm = this.fb.group({
          type: ['unknown']
        });
    }

    this.elementsArray.push(elementForm);
  }

  createActionForm(action: ProtocolAction): FormGroup {
    return this.fb.group({
      text: [action.text || ''],
      icon: [action.icon || ''],
      action: [action.action || ''],
      backgroundcolor: [action.backgroundcolor || ''],
      markcompleted: [action.markcompleted || false]
    });
  }

  addNewElement(type: string): void {
    let newElement: any = { type };
    
    switch (type) {
      case 'alert':
        newElement = { type: 'alert', title: '', message: '' };
        break;
      case 'sessions':
        newElement = { type: 'sessions', left: { text: '', icon: '' }, right: { text: '', icon: '', action: '' } };
        break;
      case 'button':
        newElement = { type: 'button', action: { text: '', action: '' } };
        break;
      case 'carousel':
      case 'tiles':
        newElement = { type, actions: [] };
        break;
    }
    
    this.addElementToForm(newElement);
  }

  removeElement(index: number): void {
    this.elementsArray.removeAt(index);
  }

  exportConfig(): void {
    const exportData = {
      ...this.protocol,
      home: {
        ...this.protocol.home,
        title: this.appForm.get('title')?.value || this.protocol.home.title
      }
    };
    
    if (this.appForm.get('appIcon')?.value) {
      exportData.icon = this.appForm.get('appIcon')?.value;
    }

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'protocol.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  // BottomBar button handlers
  onHomeClick(): void {
    console.log('Home button clicked — maybe reset form or navigate.');
  }

  onScriptsClick(): void {
    console.log('Scripts button clicked — could trigger a search feature.');
  }

  onSensorsClick(): void {
    console.log('Sensors button clicked — open profile settings.');
  }

  onSidebarClick(): void {
    console.log('Sidebar button clicked — open settings modal.');
  }

  onLogoutClick(): void {
    this.authService.logoutRedirect();
  }
}

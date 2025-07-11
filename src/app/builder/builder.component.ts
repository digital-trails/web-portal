import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { GithubFacade } from './github.facade';

// Enhanced interfaces for comprehensive protocol support
interface ProtocolIcon {
  url: string;
  tint?: boolean;
}

interface ProtocolAction {
  text: string;
  icon?: string | ProtocolIcon;
  action?: string;
  backgroundcolor?: string;
  markcompleted?: boolean;
}

interface ProtocolButton {
  text: string;
  icon?: string | ProtocolIcon;
  action?: string;
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

interface ProtocolButtonElement {
  type: 'button';
  action: {
    text: string;
    action: string;
  };
}

interface ProtocolCarousel {
  type: 'carousel';
  actions: ProtocolAction[];
}

interface ProtocolTiles {
  type: 'tiles';
  actions: ProtocolAction[];
}

interface ProtocolGoal {
  type: string;
  occurence?: number;
  starting?: number;
  percentile?: number;
}

interface ProtocolGoals {
  type: 'goals';
  goals: ProtocolGoal[];
}

interface ProtocolList {
  type: 'list';
  elements: ProtocolElement[];
}

type ProtocolElement = ProtocolAlert | ProtocolSessions | ProtocolButtonElement | ProtocolCarousel | ProtocolTiles | ProtocolGoals | ProtocolList;

interface ProtocolHome {
  title: string;
  banner_text?: string;
  banner_text_1?: string;
  banner_text_2?: string;
  banner_icon?: string;
  button_tl?: ProtocolButton;
  button_tr?: ProtocolButton;
  button_bl?: ProtocolButton;
  button_br?: ProtocolButton;
  button_ls?: ProtocolButton;
  button_rs?: ProtocolButton;
  button_surveys?: ProtocolButton;
  element?: ProtocolElement;
  elements?: ProtocolElement[];
}

interface ProtocolMenuItem {
  text: string;
  icon: string;
  action?: string;
}

interface ProtocolMenu {
  home?: ProtocolMenuItem;
  unenroll?: ProtocolMenuItem;
  log_out?: ProtocolMenuItem;
  custom?: ProtocolMenuItem[];
}

interface ProtocolTrigger {
  type: string;
  action: string;
  content: string;
  frequency?: string;
  time?: string;
  requires?: string[];
}

interface ProtocolProbe {
  type: string;
  optional?: boolean;
  interval?: string;
  accuracy?: number;
}

interface ProtocolSettings {
  unenroll?: string;
}

interface Protocol {
  icon?: string;
  datums_endpoint?: string;
  home: ProtocolHome;
  menu?: ProtocolMenu | ProtocolMenuItem[];
  sessions?: string;
  settings?: ProtocolSettings;
  triggers?: ProtocolTrigger[];
  probes?: ProtocolProbe[];
}

// Screen system interfaces
interface AppScreen {
  id: string;
  title: string;
  type: string;
  content?: any;
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
  
  // GitHub integration properties
  isGitHubConnected: boolean = false;
  repositories: any[] = [];
  selectedRepository: string = '';
  gitHubError: string = '';
  filePath: string = 'src/protocol.json';
  currentFileData: any = null;
  
  // Current protocol data
  protocol: Protocol = {
    home: {
      title: "My App"
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

  // Available element types for dynamic adding
  elementTypes = [
    { value: 'alert', label: 'Alert' },
    { value: 'sessions', label: 'Sessions' },
    { value: 'button', label: 'Button' },
    { value: 'carousel', label: 'Carousel' },
    { value: 'tiles', label: 'Tiles' },
    { value: 'goals', label: 'Goals' }
  ];

  // Available action types
  actionTypes = [
    { value: 'flow://', label: 'Flow' },
    { value: 'page://', label: 'Page' },
    { value: 'navpage://', label: 'Nav Page' },
    { value: 'navmodal://', label: 'Nav Modal' },
    { value: 'https://', label: 'External URL' }
  ];

  // Survey data (keeping for backward compatibility)
  surveysData = [
    { 
      id: 'end-of-day',
      name: "End Of Day", 
      icon: "🔒",
      questions: [
        {
          id: 1,
          question: "How would you rate your overall mood today?",
          options: ["Very Poor", "Poor", "Good", "Excellent"]
        }
      ]
    }
  ];

  // Screen navigation system
  screens: AppScreen[] = [];
  currentScreenIndex: number = 0;
  navigationHistory: number[] = [];
  today = new Date(); // For date display in previews
  
  // New navigation system
  currentView: string = 'home';
  isDarkTheme: boolean = true;
  
  // Survey system
  currentSurvey: any = null;
  currentQuestionIndex: number = 0;
  surveyAnswers: { [questionId: number]: string } = {};
  showSuccessToast: boolean = false;
  
  settingsItems = [
    { label: 'Theme', type: 'toggle', value: true },
    { label: 'Notifications', type: 'toggle', value: false },
    { label: 'Language', type: 'arrow', value: null },
    { label: 'About', type: 'arrow', value: null },
    { label: 'Privacy', type: 'arrow', value: null },
    { label: 'History', type: 'arrow', value: null },
    { label: 'Unenroll', type: 'arrow', value: null }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: MsalService,
    private router: Router,
    private githubFacade: GithubFacade
  ) {
    this.appForm = this.createForm();
  }

  ngOnInit(): void {
    // Subscribe to form changes for real-time updates
    this.appForm.valueChanges.subscribe((value) => {
      this.updateProtocolFromForm(value);
      this.refreshScreens();
      // Update appData for phone preview
      this.appData.title = value.home?.title || 'My App';
      this.appData.subtitle = value.home?.banner_text || 'App Builder Demo';
      this.appData.button1 = value.home?.button_tl?.text || 'Button 1';
      this.appData.button2 = value.home?.button_tr?.text || 'Button 2';
      this.appData.button3 = value.home?.button_bl?.text || 'Button 3';
      this.appData.button4 = value.home?.button_br?.text || 'Button 4';
    });
    
    // Initialize home screen
    this.refreshScreens();
    this.checkGitHubConnection();
  }

  // Screen management methods
  get currentScreen(): AppScreen {
    return this.screens[this.currentScreenIndex] || this.screens[0];
  }

  refreshScreens(): void {
    const homeScreen: AppScreen = {
      id: 'home',
      title: this.protocol.home.title || 'Home',
      type: 'home',
      content: {
        elements: this.protocol.home.elements || []
      }
    };
    
    this.screens = [homeScreen];
    
    // Generate screens for each element with action navigation
    if (this.protocol.home.elements) {
      this.protocol.home.elements.forEach((element, idx) => {
        if ((element.type === 'carousel' || element.type === 'tiles') && 'actions' in element) {
          element.actions.forEach((action, actionIdx) => {
            if (action.action && action.action !== '#') {
              this.screens.push({
                id: `${element.type}-${idx}-${actionIdx}`,
                title: action.text,
                type: 'action',
                content: {
                  action,
                  parentElement: element
                }
              });
            }
          });
        }
        
        if (element.type === 'sessions' && 'right' in element && element.right.action) {
          this.screens.push({
            id: `session-${idx}`,
            title: element.right.text,
            type: 'session',
            content: element
          });
        }
        
        if (element.type === 'button' && 'action' in element && element.action.action) {
          this.screens.push({
            id: `button-${idx}`,
            title: element.action.text,
            type: 'button',
            content: element
          });
        }
      });
    }
    
    // If we're on a screen that no longer exists, go back to home
    if (!this.screens[this.currentScreenIndex]) {
      this.currentScreenIndex = 0;
      this.navigationHistory = [];
    }
  }

  navigateToScreen(screenId: string): void {
    const screenIndex = this.screens.findIndex(s => s.id === screenId);
    if (screenIndex !== -1) {
      this.navigationHistory.push(this.currentScreenIndex);
      this.currentScreenIndex = screenIndex;
    }
  }

  navigateToHome(): void {
    this.currentView = 'home';
  }

  navigateToSurveys(): void {
    this.currentView = 'surveys';
  }

  navigateToSettings(): void {
    this.currentView = 'settings';
  }

  navigateToMenu(): void {
    // Menu functionality can be added later
    console.log('Menu clicked');
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.settingsItems[0].value = this.isDarkTheme;
  }

  onSettingsToggle(index: number): void {
    if (index === 0) { // Theme toggle
      this.toggleTheme();
    } else if (index === 1) { // Notifications toggle
      this.settingsItems[1].value = !this.settingsItems[1].value;
    }
  }

  // Survey navigation methods
  startSurvey(surveyId: string): void {
    this.currentSurvey = this.surveysData.find(s => s.id === surveyId);
    this.currentQuestionIndex = 0;
    this.surveyAnswers = {};
    this.currentView = 'survey-question';
  }

  selectAnswer(answer: string): void {
    if (this.currentSurvey && this.currentSurvey.questions[this.currentQuestionIndex]) {
      const questionId = this.currentSurvey.questions[this.currentQuestionIndex].id;
      this.surveyAnswers[questionId] = answer;
    }
  }

  nextQuestion(): void {
    if (this.currentSurvey && this.currentQuestionIndex < this.currentSurvey.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.completeSurvey();
    }
  }

  completeSurvey(): void {
    this.showSuccessToast = true;
    this.currentView = 'surveys';
    this.currentSurvey = null;
    this.currentQuestionIndex = 0;
    this.surveyAnswers = {};
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 3000);
  }

  getCurrentQuestion(): any {
    if (this.currentSurvey && this.currentSurvey.questions[this.currentQuestionIndex]) {
      return this.currentSurvey.questions[this.currentQuestionIndex];
    }
    return null;
  }

  getCurrentAnswer(): string {
    const question = this.getCurrentQuestion();
    if (question) {
      return this.surveyAnswers[question.id] || '';
    }
    return '';
  }

  canProceed(): boolean {
    return this.getCurrentAnswer() !== '';
  }

  navigateBack(): void {
    if (this.navigationHistory.length > 0) {
      this.currentScreenIndex = this.navigationHistory.pop()!;
    } else {
      this.currentScreenIndex = 0; // Default to home
    }
  }

  // Element interaction methods
  handleElementClick(element: any, actionIndex?: number): void {
    if (element.type === 'button' && element.action?.action) {
      const screenId = `button-${this.protocol.home.elements?.findIndex(e => e === element)}`;
      this.navigateToScreen(screenId);
    }
    else if (element.type === 'sessions' && element.right?.action) {
      const screenId = `session-${this.protocol.home.elements?.findIndex(e => e === element)}`;
      this.navigateToScreen(screenId);
    }
    else if ((element.type === 'carousel' || element.type === 'tiles') && actionIndex !== undefined) {
      const action = element.actions[actionIndex];
      if (action && action.action) {
        const elementIndex = this.protocol.home.elements?.findIndex(e => e === element) || 0;
        const screenId = `${element.type}-${elementIndex}-${actionIndex}`;
        this.navigateToScreen(screenId);
      }
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      // Top-level protocol properties
      icon: [''],
      datums_endpoint: [''],
      sessions: [''],
      
      // Home section
      home: this.fb.group({
        title: ['My App', Validators.required],
        banner_text: [''],
        banner_text_1: [''],
        banner_text_2: [''],
        banner_icon: [''],
        // Legacy buttons
        button_tl: this.createButtonForm(),
        button_tr: this.createButtonForm(),
        button_bl: this.createButtonForm(),
        button_br: this.createButtonForm(),
        button_ls: this.createButtonForm(),
        button_rs: this.createButtonForm(),
        button_surveys: this.createButtonForm(),
        // Modern element structure
        hasElementStructure: [false],
        elementType: ['single'], // 'single' or 'list'
        element: this.createElementForm(),
        elements: this.fb.array([])
      }),
      
      // Menu section
      menu: this.fb.group({
        type: ['object'], // 'object' or 'array'
        // Object-style menu
        home: this.createMenuItemForm(),
        unenroll: this.createMenuItemForm(),
        log_out: this.createMenuItemForm(),
        custom: this.fb.array([]),
        // Array-style menu
        items: this.fb.array([])
      }),
      
      // Settings
      settings: this.fb.group({
        unenroll: ['']
      }),
      
      // Triggers
      triggers: this.fb.array([]),
      
      // Probes
      probes: this.fb.array([]),
      
      // GitHub integration form controls
      selectedRepository: [''],
      filePath: ['src/protocol.json']
    });
  }

  createButtonForm(): FormGroup {
    return this.fb.group({
      text: [''],
      icon: [''],
      iconType: ['string'], // 'string' or 'object'
      iconUrl: [''],
      iconTint: [false],
      action: ['']
    });
  }

  createMenuItemForm(): FormGroup {
    return this.fb.group({
      text: [''],
      icon: [''],
      action: ['']
    });
  }

  createElementForm(): FormGroup {
    return this.fb.group({
      type: ['alert'],
      // Alert properties
      title: [''],
      message: [''],
      iconUrl: [''],
      iconTint: [false],
      // Sessions properties
      leftText: [''],
      leftIcon: [''],
      rightText: [''],
      rightIcon: [''],
      rightAction: [''],
      // Button properties
      actionText: [''],
      actionUrl: [''],
      // Carousel/Tiles properties
      actions: this.fb.array([]),
      // Goals properties
      goals: this.fb.array([])
    });
  }

  createActionForm(action?: any): FormGroup {
    const form = this.fb.group({
      text: [action?.text || '', Validators.required],
      icon: [action?.icon || ''],
      iconType: [typeof action?.icon === 'string' ? 'string' : 'object'],
      iconUrl: [typeof action?.icon === 'object' ? action?.icon?.url : ''],
      iconTint: [typeof action?.icon === 'object' ? action?.icon?.tint : false],
      action: [action?.action || ''],
      backgroundcolor: [action?.backgroundcolor || ''],
      markcompleted: [action?.markcompleted || false]
    });
    return form;
  }

  createGoalForm(): FormGroup {
    return this.fb.group({
      type: ['steps'],
      occurence: [1],
      starting: [0],
      percentile: [1.0]
    });
  }

  createTriggerForm(): FormGroup {
    return this.fb.group({
      type: ['timing'],
      action: ['notification'],
      content: [''],
      frequency: ['1'],
      time: [''],
      requires: this.fb.array([])
    });
  }

  createProbeForm(): FormGroup {
    return this.fb.group({
      type: ['Location'],
      optional: [true],
      interval: [''],
      accuracy: [5]
    });
  }

  // Method to generate protocol preview from current form
  getProtocolPreview(): any {
    const formValue = this.appForm.value;
    
    const protocol: any = {
      icon: formValue.icon || undefined,
      datums_endpoint: formValue.datums_endpoint || undefined,
      sessions: formValue.sessions || undefined,
      home: {
        title: formValue.home.title || "My App"
      }
    };

    // Add banner properties if they exist
    if (formValue.home.banner_text) protocol.home.banner_text = formValue.home.banner_text;
    if (formValue.home.banner_text_1) protocol.home.banner_text_1 = formValue.home.banner_text_1;
    if (formValue.home.banner_text_2) protocol.home.banner_text_2 = formValue.home.banner_text_2;
    if (formValue.home.banner_icon) protocol.home.banner_icon = formValue.home.banner_icon;

    // Add buttons if they have content
    const buttons = ['button_tl', 'button_tr', 'button_bl', 'button_br', 'button_ls', 'button_rs', 'button_surveys'];
    buttons.forEach(buttonKey => {
      const button = formValue.home[buttonKey];
      if (button && (button.text || button.icon || button.action)) {
        protocol.home[buttonKey] = {
          text: button.text || undefined,
          icon: button.icon || undefined,
          action: button.action || undefined
        };
        // Remove undefined values
        Object.keys(protocol.home[buttonKey]).forEach(key => {
          if (protocol.home[buttonKey][key] === undefined) {
            delete protocol.home[buttonKey][key];
          }
        });
      }
    });

    // Remove undefined top-level properties
    Object.keys(protocol).forEach(key => {
      if (protocol[key] === undefined) {
        delete protocol[key];
      }
    });

    return protocol;
  }

  updateProtocolFromForm(formValue: any): void {
    this.protocol = this.getProtocolPreview();
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
          this.refreshScreens();
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
    
    // Update top-level fields
    this.appForm.patchValue({
      icon: this.protocol.icon || '',
      datums_endpoint: this.protocol.datums_endpoint || '',
      sessions: this.protocol.sessions || ''
    });

    // Update home section
    const homeGroup = this.appForm.get('home') as FormGroup;
    homeGroup.patchValue({
      title: home.title,
      banner_text: home.banner_text || '',
      banner_text_1: home.banner_text_1 || '',
      banner_text_2: home.banner_text_2 || '',
      banner_icon: home.banner_icon || ''
    });

    // Handle button structure
    this.populateButtonFromProtocol('button_tl', home.button_tl);
    this.populateButtonFromProtocol('button_tr', home.button_tr);
    this.populateButtonFromProtocol('button_bl', home.button_bl);
    this.populateButtonFromProtocol('button_br', home.button_br);
    this.populateButtonFromProtocol('button_ls', home.button_ls);
    this.populateButtonFromProtocol('button_rs', home.button_rs);
    this.populateButtonFromProtocol('button_surveys', home.button_surveys);

    // Handle element structure
    if (home.element || home.elements) {
      homeGroup.patchValue({ hasElementStructure: true });
      
      if (home.element) {
        homeGroup.patchValue({ elementType: 'single' });
        this.populateElementForm(homeGroup.get('element') as FormGroup, home.element);
      } else if (home.elements) {
        homeGroup.patchValue({ elementType: 'list' });
        const elementsArray = homeGroup.get('elements') as FormArray;
        elementsArray.clear();
        home.elements.forEach(element => {
          const elementForm = this.createElementForm();
          this.populateElementForm(elementForm, element);
          elementsArray.push(elementForm);
        });
      }
    }

    // Handle menu structure
    this.populateMenuFromProtocol();

    // Handle settings
    if (this.protocol.settings) {
      this.appForm.get('settings')?.patchValue(this.protocol.settings);
    }

    // Handle triggers and probes
    this.populateTriggersFromProtocol();
    this.populateProbesFromProtocol();
  }

  populateButtonFromProtocol(buttonKey: string, button?: any): void {
    if (button) {
      const buttonGroup = this.appForm.get('home')?.get(buttonKey) as FormGroup;
      const iconType = typeof button.icon === 'string' ? 'string' : 'object';
      
      buttonGroup.patchValue({
        text: button.text || '',
        iconType: iconType,
        icon: iconType === 'string' ? button.icon : '',
        iconUrl: iconType === 'object' ? button.icon?.url : '',
        iconTint: iconType === 'object' ? button.icon?.tint : false,
        action: button.action || ''
      });
    }
  }

  populateElementForm(elementForm: FormGroup, element: any): void {
    elementForm.patchValue({ type: element.type });
    
    switch (element.type) {
      case 'alert':
        elementForm.patchValue({
          title: element.title || '',
          message: element.message || '',
          iconUrl: element.icon?.url || '',
          iconTint: element.icon?.tint || false
        });
        break;
      case 'sessions':
        elementForm.patchValue({
          leftText: element.left?.text || '',
          leftIcon: element.left?.icon || '',
          rightText: element.right?.text || '',
          rightIcon: element.right?.icon || '',
          rightAction: element.right?.action || ''
        });
        break;
      case 'button':
        elementForm.patchValue({
          actionText: element.action?.text || '',
          actionUrl: element.action?.action || ''
        });
        break;
      case 'carousel':
      case 'tiles':
        const actionsArray = elementForm.get('actions') as FormArray;
        actionsArray.clear();
        if (element.actions) {
          element.actions.forEach((action: any) => {
            const actionForm = this.createActionForm();
            this.populateActionForm(actionForm, action);
            actionsArray.push(actionForm);
          });
        }
        break;
      case 'goals':
        const goalsArray = elementForm.get('goals') as FormArray;
        goalsArray.clear();
        if (element.goals) {
          element.goals.forEach((goal: any) => {
            const goalForm = this.createGoalForm();
            goalForm.patchValue(goal);
            goalsArray.push(goalForm);
          });
        }
        break;
    }
  }

  populateActionForm(actionForm: FormGroup, action: any): void {
    const iconType = typeof action.icon === 'string' ? 'string' : 'object';
    
    actionForm.patchValue({
      text: action.text || '',
      iconType: iconType,
      icon: iconType === 'string' ? action.icon : '',
      iconUrl: iconType === 'object' ? action.icon?.url : '',
      iconTint: iconType === 'object' ? action.icon?.tint : false,
      action: action.action || '',
      backgroundcolor: action.backgroundcolor || '',
      markcompleted: action.markcompleted || false
    });
  }

  populateMenuFromProtocol(): void {
    if (!this.protocol.menu) return;
    
    const menuGroup = this.appForm.get('menu') as FormGroup;
    
    if (Array.isArray(this.protocol.menu)) {
      // Array-style menu
      menuGroup.patchValue({ type: 'array' });
      const itemsArray = menuGroup.get('items') as FormArray;
      itemsArray.clear();
      this.protocol.menu.forEach(item => {
        const itemForm = this.createMenuItemForm();
        itemForm.patchValue(item);
        itemsArray.push(itemForm);
      });
    } else {
      // Object-style menu
      menuGroup.patchValue({ type: 'object' });
      const menu = this.protocol.menu as any;
      
      if (menu.home) menuGroup.get('home')?.patchValue(menu.home);
      if (menu.unenroll) menuGroup.get('unenroll')?.patchValue(menu.unenroll);
      if (menu.log_out) menuGroup.get('log_out')?.patchValue(menu.log_out);
      
      if (menu.custom) {
        const customArray = menuGroup.get('custom') as FormArray;
        customArray.clear();
        menu.custom.forEach((item: any) => {
          const itemForm = this.createMenuItemForm();
          itemForm.patchValue(item);
          customArray.push(itemForm);
        });
      }
    }
  }

  populateTriggersFromProtocol(): void {
    const triggersArray = this.appForm.get('triggers') as FormArray;
    triggersArray.clear();
    
    if (this.protocol.triggers) {
      this.protocol.triggers.forEach(trigger => {
        const triggerForm = this.createTriggerForm();
        triggerForm.patchValue({
          type: trigger.type,
          action: trigger.action,
          content: trigger.content,
          frequency: trigger.frequency,
          time: trigger.time
        });
        
        if (trigger.requires) {
          const requiresArray = triggerForm.get('requires') as FormArray;
          trigger.requires.forEach(req => {
            requiresArray.push(new FormControl(req));
          });
        }
        
        triggersArray.push(triggerForm);
      });
    }
  }

  populateProbesFromProtocol(): void {
    const probesArray = this.appForm.get('probes') as FormArray;
    probesArray.clear();
    
    if (this.protocol.probes) {
      this.protocol.probes.forEach(probe => {
        const probeForm = this.createProbeForm();
        probeForm.patchValue(probe);
        probesArray.push(probeForm);
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
        const buttonElement = element as ProtocolButtonElement;
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

    // This method is no longer used with the new form structure
  }

  // This method is replaced by the one above

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
    // This method would need to be updated for the new form structure
    console.log('Remove element functionality needs to be updated');
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
    this.navigateToHome();
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

  // GitHub Integration Methods
  checkGitHubConnection(): void {
    const token = sessionStorage.getItem('githubAccessToken');
    const owner = sessionStorage.getItem('githubOwner');
    this.isGitHubConnected = !!(token && owner);
    
    if (this.isGitHubConnected) {
      this.loadRepositories();
    }
  }

  loadRepositories(): void {
    if (this.githubFacade.getUserRepositories) {
      this.githubFacade.getUserRepositories().subscribe({
        next: (repos: any[]) => {
          this.repositories = repos;
          this.gitHubError = '';
        },
        error: (error: any) => {
          this.gitHubError = 'Failed to load repositories';
          console.error('Error loading repositories:', error);
        }
      });
    } else {
      this.gitHubError = 'GitHub service not properly initialized';
    }
  }

  onRepositorySelect(repoFullName: string): void {
    const repo = this.repositories.find(repo => repo.full_name === repoFullName);
    if (repo) {
      this.appForm.patchValue({ selectedRepository: repoFullName });
      sessionStorage.setItem('githubRepo', repo.name);
      sessionStorage.setItem('githubOwner', repo.owner.login);
      this.gitHubError = '';
    }
  }

  loadFromGitHub(): void {
    const selectedRepo = this.appForm.get('selectedRepository')?.value;
    if (!selectedRepo) {
      this.gitHubError = 'Please select a repository first';
      return;
    }

    const repo = this.repositories.find(r => r.full_name === selectedRepo);
    if (!repo) {
      this.gitHubError = 'Repository not found';
      return;
    }

    // Set session storage for the GitHub facade
    sessionStorage.setItem('githubRepo', repo.name);
    sessionStorage.setItem('githubOwner', repo.owner.login);

    const filePath = this.appForm.get('filePath')?.value || 'src/protocol.json';

    this.githubFacade.getFile(filePath).subscribe({
      next: (fileData: any) => {
        try {
          // The facade already decodes the content for us
          const protocolData = fileData.content;
          
          if (this.validateProtocol(protocolData)) {
            this.protocol = protocolData;
            this.populateFormFromProtocol();
            this.currentFileData = fileData; // Store for later updates
            this.gitHubError = '';
          } else {
            this.gitHubError = 'Invalid protocol.json format';
          }
        } catch (error) {
          this.gitHubError = 'Error parsing protocol.json file';
          console.error('Parse error:', error);
        }
      },
      error: (error: any) => {
        this.gitHubError = `Failed to load file: ${error.message || 'Unknown error'}`;
        console.error('GitHub load error:', error);
      }
    });
  }

  saveToGitHub(): void {
    const selectedRepo = this.appForm.get('selectedRepository')?.value;
    if (!selectedRepo) {
      this.gitHubError = 'Please select a repository first';
      return;
    }

    const repo = this.repositories.find(r => r.full_name === selectedRepo);
    if (!repo) {
      this.gitHubError = 'Repository not found';
      return;
    }

    // Update protocol from current form values
    this.updateProtocolFromForm(this.appForm.value);
    
    // Set session storage for the GitHub facade
    sessionStorage.setItem('githubRepo', repo.name);
    sessionStorage.setItem('githubOwner', repo.owner.login);
    
    const filePath = this.appForm.get('filePath')?.value || 'src/protocol.json';
    
    // Prepare file object for the facade
    const fileToSave = {
      path: filePath,
      content: this.protocol,
      sha: this.currentFileData?.sha // Include SHA for updates
    };
    
    const commitMessage = `Update protocol.json via Web Portal - ${new Date().toISOString()}`;

    this.githubFacade.putFile(fileToSave, commitMessage).subscribe({
      next: (response: any) => {
        this.currentFileData = response.content; // Update stored file data
        this.gitHubError = '';
        // Show success message or feedback
        console.log('Successfully saved to GitHub');
      },
      error: (error: any) => {
        this.gitHubError = `Failed to save: ${error.message || 'Unknown error'}`;
        console.error('GitHub save error:', error);
      }
    });
  }

  connectToGitHub(): void {
    const clientId = 'Ov23liM8jdVptvkhxswe';
    // Use the original working redirect URI that matches your GitHub OAuth app config
    const redirectUri = encodeURIComponent(window.location.origin + '/builder/auth');
    const scope = encodeURIComponent('repo user');
    
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  }
}

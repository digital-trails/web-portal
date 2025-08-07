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

interface ProtocolTile {
  type: 'tile';
  text: string;
  icon: string;
  action: string;
  backgroundcolor: string;
  markcompleted: boolean;
}

type ProtocolElement = ProtocolAlert | ProtocolSessions | ProtocolButtonElement | ProtocolCarousel | ProtocolTiles | ProtocolTile | ProtocolGoals | ProtocolList;

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
  element?: ProtocolList;
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
  isPublishing: boolean = false;
  publishSuccess: boolean = false;
  
  // Current protocol data - initialized with example data using PrimeNG icons
  protocol: Protocol = {
    icon: "pi pi-home",
    home: {
      title: "MindTrails",
      element: {
        type: "list",
        elements: [
          {
            type: "alert",
            title: "Alert title",
            message: "Alert message",
            icon: {
              url: "pi pi-info-circle",
              tint: true
            }
          },
          {
            type: "sessions",
            left: {
              text: "{0} Sessions Completed",
              icon: "pi pi-trophy"
            },
            right: {
              text: "Launch Session",
              icon: "pi pi-unlock",
              action: "flow://flows/doses"
            }
          },
          {
            type: "button",
            action: {
              text: "Show Survey Modal",
              action: "navmodal://Survey"
            }
          },
          {
            type: "carousel",
            actions: [
              {
                text: "inputs!",
                icon: "pi pi-pencil",
                action: "flow://flows/inputs",
                backgroundcolor: "#1A206AFF",
                markcompleted: true
              },
              {
                text: "survey 1",
                icon: "pi pi-clipboard",
                action: "flow://flows/how%20was%20your%20day%3f",
                backgroundcolor: "#1A00E05A",
                markcompleted: true
              },
              {
                text: "survey 2",
                icon: "pi pi-chart-bar",
                action: "flow://flows/survey2",
                backgroundcolor: "#1A00C2FF",
                markcompleted: true
              },
              {
                text: "survey 3",
                icon: "pi pi-heart",
                action: "flow://flows/survey3",
                backgroundcolor: "#1A5C2FDA",
                markcompleted: true
              }
            ]
          },
          {
            type: "tiles",
            actions: [
              {
                text: "inputs!",
                icon: "pi pi-pencil",
                action: "flow://flows/inputs",
                backgroundcolor: "#1A206AFF",
                markcompleted: true
              },
              {
                text: "survey 1",
                icon: "pi pi-clipboard",
                action: "flow://flows/how was your day%3F",
                backgroundcolor: "#1A00E05A",
                markcompleted: true
              },
              {
                text: "survey 2",
                icon: "pi pi-chart-bar",
                action: "flow://flows/survey2",
                backgroundcolor: "#1A00C2FF",
                markcompleted: true
              },
              {
                text: "survey 3",
                icon: "pi pi-heart",
                action: "flow://flows/survey3",
                backgroundcolor: "#1A5C2FDA",
                markcompleted: true
              }
            ]
          }
        ]
      }
    },
    menu: [
      {
        text: "Home",
        icon: "pi pi-home"
      }
    ],
    triggers: [
      {
        type: "timing",
        action: "notification",
        content: "flow://flows/survey1",
        frequency: "00:05:00"
      },
      {
        type: "timing",
        action: "notification",
        frequency: "1",
        content: "flow://flows/survey2"
      }
    ],
    probes: [
      {
        type: "Location",
        optional: true,
        interval: "00:00:01",
        accuracy: 5
      }
    ]
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
    { value: 'tile', label: 'Tile' },
    { value: 'goals', label: 'Goals' }
  ];

  // Available action types
  actionTypes = [
    { value: 'navmodal://Survey', label: 'Show Survey Modal' },
    { value: 'flow://flows/inputs', label: 'Input Flow' },
    { value: 'flow://flows/survey1', label: 'Survey Flow 1' },
    { value: 'flow://flows/survey2', label: 'Survey Flow 2' },
    { value: 'flow://flows/demographics', label: 'Demographics Flow' },
    { value: 'flow://flows/doses', label: 'Doses Flow' },
    { value: 'navpage://settings', label: 'Settings Page' },
    { value: 'https://example.com', label: 'External URL' }
  ];

  // Available tiles positions
  tilesPositions = [
    { value: 'left', label: 'Left Side' },
    { value: 'right', label: 'Right Side' }
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
  
  // GitHub toast system
  showGitHubSuccessToast: boolean = false;
  gitHubToastMessage: string = '';
  
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
    const homeElements = this.getHomeElements();
    const homeScreen: AppScreen = {
      id: 'home',
      title: this.protocol.home.title || 'Home',
      type: 'home',
      content: {
        elements: homeElements
      }
    };
    
    this.screens = [homeScreen];
    
    // Generate screens for each element with action navigation
    if (homeElements.length > 0) {
      homeElements.forEach((element, idx) => {
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
    this.currentView = 'menu';
  }

  closeMenu(): void {
    this.currentView = 'home';
  }

  getMenuItems(): ProtocolMenuItem[] {
    if (Array.isArray(this.protocol.menu)) {
      return this.protocol.menu;
    }
    return [];
  }

  getHomeElements(): ProtocolElement[] {
    if (this.protocol.home.element && this.protocol.home.element.type === 'list') {
      return this.protocol.home.element.elements || [];
    }
    if (this.protocol.home.elements) {
      return this.protocol.home.elements;
    }
    return [];
  }

  // Helper methods to get specific element types for template layout (single)
  getAlertElement(): any {
    return this.getHomeElements().find(el => el.type === 'alert');
  }

  getSessionsElement(): any {
    return this.getHomeElements().find(el => el.type === 'sessions');
  }

  getButtonElement(): any {
    return this.getHomeElements().find(el => el.type === 'button');
  }

  getCarouselElement(): any {
    return this.getHomeElements().find(el => el.type === 'carousel');
  }

  getTilesElement(): any {
    return this.getHomeElements().find(el => el.type === 'tiles');
  }

  // Helper methods to get multiple elements of each type for layered layout
  getAlertElements(): any[] {
    return this.getHomeElements().filter(el => el.type === 'alert');
  }

  getSessionsElements(): any[] {
    return this.getHomeElements().filter(el => el.type === 'sessions');
  }

  getButtonElements(): any[] {
    return this.getHomeElements().filter(el => el.type === 'button');
  }

  getCarouselElements(): any[] {
    return this.getHomeElements().filter(el => el.type === 'carousel');
  }

  getTilesElements(): any[] {
    return this.getHomeElements().filter(el => el.type === 'tiles');
  }

  // Get all individual tile items from all tiles elements, flattened into a single array
  getAllTileItems(): any[] {
    const homeElements = this.getHomeElements();
    const allTileItems: any[] = [];
    
    homeElements.forEach(element => {
      // Handle old 'tiles' type with multiple actions
      if (element.type === 'tiles' && element.actions && Array.isArray(element.actions)) {
        element.actions.forEach((action: any) => {
          allTileItems.push({
            ...action,
            parentElement: element // Keep reference to parent for click handling
          });
        });
      }
      // Handle new 'tile' type (single tile)
      else if (element.type === 'tile') {
        allTileItems.push({
          text: element.text || 'Tile',
          icon: element.icon || 'pi pi-square',
          action: element.action || 'flow://flows/default',
          backgroundcolor: element.backgroundcolor || '#8B5CF6',
          markcompleted: element.markcompleted || false,
          parentElement: element
        });
      }
    });
    
    return allTileItems;
  }

  // Handle clicks on individual tile items
  handleTileClick(tile: any, index: number): void {
    if (tile.parentElement) {
      if (tile.parentElement.type === 'tiles') {
        // Handle old tiles type with actions array
        const actionIndex = tile.parentElement.actions.findIndex((action: any) => action === tile);
        this.handleElementClick(tile.parentElement, actionIndex);
      } else if (tile.parentElement.type === 'tile') {
        // Handle new single tile type
        this.handleElementClick(tile.parentElement);
      }
    }
  }

  // Carousel navigation state
  carouselScrollPositions: { [key: number]: number } = {};

  // Scroll carousel left or right
  scrollCarousel(carouselIndex: number, direction: 'left' | 'right'): void {
    const container = document.getElementById(`carousel-${carouselIndex}`);
    if (!container) return;

    const itemWidth = 120 + 20; // item width + margin
    const currentPosition = this.carouselScrollPositions[carouselIndex] || 0;
    
    let newPosition: number;
    if (direction === 'left') {
      newPosition = Math.max(0, currentPosition - itemWidth);
    } else {
      const maxScroll = this.getMaxCarouselScroll(carouselIndex);
      newPosition = Math.min(maxScroll, currentPosition + itemWidth);
    }

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });

    this.carouselScrollPositions[carouselIndex] = newPosition;
  }

  // Get current scroll position for a carousel
  getCarouselScrollPosition(carouselIndex: number): number {
    return this.carouselScrollPositions[carouselIndex] || 0;
  }

  // Get maximum scroll position for a carousel
  getMaxCarouselScroll(carouselIndex: number): number {
    const carousels = this.getCarouselElements();
    if (!carousels[carouselIndex]) return 0;
    
    const itemCount = carousels[carouselIndex].actions?.length || 0;
    const itemWidth = 120 + 20; // item width + margin
    const containerWidth = 140; // visible width (shows one item)
    
    return Math.max(0, (itemCount * itemWidth) - containerWidth);
  }

  // Get current visible item index for carousel dots
  getCurrentCarouselIndex(carouselIndex: number): number {
    const position = this.getCarouselScrollPosition(carouselIndex);
    const itemWidth = 120 + 20;
    return Math.floor(position / itemWidth);
  }

  handleMenuClick(menuItem: any): void {
    if (menuItem.text === 'Home') {
      this.navigateToHome();
    } else if (menuItem.action) {
      // Handle other menu actions
      console.log('Menu action:', menuItem.action);
    }
    this.closeMenu();
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
      // Check if it's a survey modal action
      if (element.action.action === 'navmodal://Survey') {
        this.showSurveyModal();
        return;
      }
      // Navigate to a flow screen for button actions
      this.navigateToFlowScreen(element.action.text, element.action.action);
    }
    else if (element.type === 'sessions' && element.right?.action) {
      // Navigate to a flow screen for session actions
      this.navigateToFlowScreen(element.right.text, element.right.action);
    }
    else if ((element.type === 'carousel' || element.type === 'tiles') && actionIndex !== undefined) {
      const action = element.actions[actionIndex];
      if (action && action.action) {
        // Navigate to a flow screen for carousel/tile actions
        this.navigateToFlowScreen(action.text, action.action);
      }
    }
  }

  navigateToFlowScreen(title: string, action: string): void {
    // Determine the flow type from the action URL
    if (action.startsWith('flow://flows/')) {
      const flowName = action.replace('flow://flows/', '').replace(/%20/g, ' ').replace(/%3f/g, '?').replace(/%3F/g, '?');
      
      if (flowName.includes('input')) {
        this.currentView = 'flow-inputs';
      } else if (flowName.includes('survey') || flowName.includes('day')) {
        this.currentView = 'flow-survey';
      } else if (flowName.includes('demographic')) {
        this.currentView = 'flow-demographics';
      } else {
        this.currentView = 'flow-generic';
      }
      
      // Store the current flow info for the screen
      this.currentFlowInfo = {
        title: title,
        action: action,
        flowName: flowName
      };
    }
  }

  // Store current flow information
  currentFlowInfo: any = null;

  // PrimeNG Icons for dropdowns
  primeNGIcons = [
    { label: 'Info Circle', value: 'pi pi-info-circle' },
    { label: 'Trophy', value: 'pi pi-trophy' },
    { label: 'Unlock', value: 'pi pi-unlock' },
    { label: 'Lock', value: 'pi pi-lock' },
    { label: 'Pencil', value: 'pi pi-pencil' },
    { label: 'Clipboard', value: 'pi pi-clipboard' },
    { label: 'Chart Bar', value: 'pi pi-chart-bar' },
    { label: 'Heart', value: 'pi pi-heart' },
    { label: 'Home', value: 'pi pi-home' },
    { label: 'User', value: 'pi pi-user' },
    { label: 'Calendar', value: 'pi pi-calendar' },
    { label: 'Clock', value: 'pi pi-clock' },
    { label: 'Star', value: 'pi pi-star' },
    { label: 'Check', value: 'pi pi-check' },
    { label: 'Times', value: 'pi pi-times' },
    { label: 'Plus', value: 'pi pi-plus' },
    { label: 'Minus', value: 'pi pi-minus' },
    { label: 'Settings', value: 'pi pi-cog' },
    { label: 'Bell', value: 'pi pi-bell' },
    { label: 'Comment', value: 'pi pi-comment' }
  ];

  showSurveyModal(): void {
    this.currentView = 'survey-modal';
  }

  closeSurveyModal(): void {
    this.currentView = 'home';
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
        element: this.fb.group({
          type: ['list'],
          elements: this.fb.array([]) // Dynamic array of elements
        })
      }),
      
      // Menu section - dynamic array
      menu: this.fb.array([]),
      
      // Settings
      settings: this.fb.group({
        unenroll: ['']
      }),
      
      // Triggers - dynamic array
      triggers: this.fb.array([]),
      
      // Probes - dynamic array
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
      icon: this.fb.group({
        url: [''],
        tint: [false]
      }),
      // Sessions properties
      left: this.fb.group({
        text: [''],
        icon: ['']
      }),
      right: this.fb.group({
        text: [''],
        icon: [''],
        action: ['']
      }),
      // Button properties
      action: this.fb.group({
        text: [''],
        action: ['']
      }),
      // Carousel/Tiles properties
      actions: this.fb.array([]),
      position: ['left'], // Position field for tiles
      // Goals properties
      goals: this.fb.array([]),
      // Tile properties (for single tile elements)
      text: [''],
      backgroundcolor: [''],
      markcompleted: [false]
    });
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
        title: formValue.home?.title || "My App",
        element: {
          type: "list",
          elements: formValue.home?.element?.elements || []
        }
      },
      menu: formValue.menu || [],
      triggers: formValue.triggers || [],
      probes: formValue.probes || []
    };

    // Remove undefined properties
    Object.keys(protocol).forEach(key => {
      if (protocol[key] === undefined) {
        delete protocol[key];
      }
    });

    // Clean empty arrays
    if (protocol.menu && protocol.menu.length === 0) delete protocol.menu;
    if (protocol.triggers && protocol.triggers.length === 0) delete protocol.triggers;
    if (protocol.probes && protocol.probes.length === 0) delete protocol.probes;
    if (protocol.home.element.elements.length === 0) {
      delete protocol.home.element;
    }

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
        const validTypes = ['alert', 'sessions', 'button', 'carousel', 'tiles', 'tile'];
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
      if (home.element && home.element.type === 'list' && home.element.elements) {
        // Handle element.elements structure
        const elementGroup = homeGroup.get('element') as FormGroup;
        if (elementGroup) {
          const elementsArray = elementGroup.get('elements') as FormArray;
          if (elementsArray) {
            elementsArray.clear();
            home.element.elements.forEach((element: any) => {
              const elementForm = this.createElementForm();
              this.populateElementForm(elementForm, element);
              elementsArray.push(elementForm);
            });
          }
        }
      } else if (home.elements && Array.isArray(home.elements)) {
        // Handle direct elements array structure
        const elementGroup = homeGroup.get('element') as FormGroup;
        if (elementGroup) {
          const elementsArray = elementGroup.get('elements') as FormArray;
          if (elementsArray) {
            elementsArray.clear();
            home.elements.forEach((element: any) => {
              const elementForm = this.createElementForm();
              this.populateElementForm(elementForm, element);
              elementsArray.push(elementForm);
            });
          }
        }
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
          message: element.message || ''
        });
        // Handle icon structure
        if (element.icon) {
          const iconGroup = elementForm.get('icon') as FormGroup;
          if (iconGroup) {
            iconGroup.patchValue({
              url: element.icon.url || '',
              tint: element.icon.tint || false
            });
          }
        }
        break;
      case 'sessions':
        // Handle left structure
        if (element.left) {
          const leftGroup = elementForm.get('left') as FormGroup;
          if (leftGroup) {
            leftGroup.patchValue({
              text: element.left.text || '',
              icon: element.left.icon || ''
            });
          }
        }
        // Handle right structure
        if (element.right) {
          const rightGroup = elementForm.get('right') as FormGroup;
          if (rightGroup) {
            rightGroup.patchValue({
              text: element.right.text || '',
              icon: element.right.icon || '',
              action: element.right.action || ''
            });
          }
        }
        break;
      case 'button':
        // Handle action structure
        if (element.action) {
          const actionGroup = elementForm.get('action') as FormGroup;
          if (actionGroup) {
            actionGroup.patchValue({
              text: element.action.text || '',
              action: element.action.action || ''
            });
          }
        }
        break;
      case 'tile':
        elementForm.patchValue({
          text: element.text || '',
          backgroundcolor: element.backgroundcolor || '',
          markcompleted: element.markcompleted || false
        });
        // Handle icon for tile (can be string or object)
        if (element.icon) {
          if (typeof element.icon === 'string') {
            const iconGroup = elementForm.get('icon') as FormGroup;
            if (iconGroup) {
              iconGroup.patchValue({
                url: element.icon,
                tint: false
              });
            }
          } else {
            const iconGroup = elementForm.get('icon') as FormGroup;
            if (iconGroup) {
              iconGroup.patchValue({
                url: element.icon.url || '',
                tint: element.icon.tint || false
              });
            }
          }
        }
        break;
      case 'carousel':
      case 'tiles':
        // Handle position for tiles (optional, defaults to 'left' if not specified)
        if (element.type === 'tiles') {
          elementForm.patchValue({
            position: element.position || 'left'
          });
        }
        
        const actionsArray = elementForm.get('actions') as FormArray;
        if (actionsArray) {
          actionsArray.clear();
          if (element.actions) {
            element.actions.forEach((action: any) => {
              const actionForm = this.createActionFormDefault();
              this.populateActionForm(actionForm, action);
              actionsArray.push(actionForm);
            });
          }
        }
        break;
      case 'goals':
        const goalsArray = elementForm.get('goals') as FormArray;
        if (goalsArray) {
          goalsArray.clear();
          if (element.goals) {
            element.goals.forEach((goal: any) => {
              const goalForm = this.createGoalForm();
              goalForm.patchValue(goal);
              goalsArray.push(goalForm);
            });
          }
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
          actions: this.fb.array(carouselElement.actions?.map(action => this.createActionFormDefault()) || [])
        });
        break;

      case 'tiles':
        const tilesElement = element as ProtocolTiles;
        elementForm = this.fb.group({
          type: ['tiles'],
          actions: this.fb.array(tilesElement.actions?.map(action => this.createActionFormDefault()) || [])
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
          // The facade already decodes the content for us and preserves metadata
          const protocolData = fileData.content;
          
          if (this.validateProtocol(protocolData)) {
            this.protocol = protocolData;
            this.populateFormFromProtocol();
            // Store complete file data including SHA for later updates
            this.currentFileData = {
              sha: fileData.sha,
              path: filePath,
              content: protocolData,
              size: fileData.size,
              url: fileData.url
            };
            this.gitHubError = '';
            
            // Show GitHub load success toast
            this.gitHubToastMessage = 'Successfully loaded protocol from GitHub!';
            this.showGitHubSuccessToast = true;
            
            // Auto-hide toast after 3 seconds
            setTimeout(() => {
              this.showGitHubSuccessToast = false;
            }, 3000);
            
            console.log('Successfully loaded protocol from GitHub with SHA:', fileData.sha);
          } else {
            this.gitHubError = 'Invalid protocol.json format';
          }
        } catch (error) {
          this.gitHubError = 'Error parsing protocol.json file';
          console.error('Parse error:', error);
        }
      },
      error: (error: any) => {
        let errorMessage = 'Unknown error';
        
        if (error.status === 404) {
          errorMessage = 'File not found. Make sure the file path is correct and the file exists in the repository.';
        } else if (error.status === 401 || error.status === 403) {
          errorMessage = 'Authentication failed. Please reconnect to GitHub.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.gitHubError = `Failed to load file: ${errorMessage}`;
        console.error('GitHub load error:', error);
      }
    });
  }

  publishToGitHub(): void {
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
    
    this.isPublishing = true;
    
    // If we don't have current file data with SHA, try to get it first
    if (!this.currentFileData?.sha) {
      console.log('No SHA found, attempting to get current file first...');
      this.githubFacade.getFile(filePath).subscribe({
        next: (fileData: any) => {
          // Update current file data with the latest SHA
          this.currentFileData = {
            sha: fileData.sha,
            path: filePath,
            content: fileData.content,
            size: fileData.size,
            url: fileData.url
          };
          console.log('Retrieved current file SHA:', fileData.sha);
          // Now proceed with the publish
          this.performPublish(filePath);
        },
        error: (error: any) => {
          if (error.status === 404) {
            // File doesn't exist, proceed without SHA (creating new file)
            console.log('File does not exist, creating new file...');
            this.currentFileData = null;
            this.performPublish(filePath);
          } else {
            this.handlePublishError(error);
          }
        }
      });
    } else {
      // We have SHA, proceed with publish
      this.performPublish(filePath);
    }
  }

  private performPublish(filePath: string): void {
    const fileToSave = {
      path: filePath,
      content: this.protocol,
      sha: this.currentFileData?.sha // Include SHA for updates, undefined for new files
    };
    
    const commitMessage = `Update protocol.json via Web Portal - ${new Date().toISOString()}`;

    this.githubFacade.putFile(fileToSave, commitMessage).subscribe({
      next: (response: any) => {
        // Update stored file data with new SHA from response
        if (response.content) {
          this.currentFileData = {
            sha: response.content.sha,
            path: filePath,
            content: this.protocol,
            size: response.content.size,
            url: response.content.url
          };
        }
        this.gitHubError = '';
        this.publishSuccess = true;
        this.isPublishing = false;
        
        // Show GitHub success toast
        this.gitHubToastMessage = 'Successfully published to GitHub!';
        this.showGitHubSuccessToast = true;
        
        // Auto-hide success message and toast after 3 seconds
        setTimeout(() => {
          this.publishSuccess = false;
          this.showGitHubSuccessToast = false;
        }, 3000);
        console.log('Successfully published to GitHub with new SHA:', response.content?.sha);
      },
      error: (error: any) => {
        this.handlePublishError(error);
      }
    });
  }

  private handlePublishError(error: any): void {
    let errorMessage = 'Unknown error';
    
    if (error.status === 422) {
      errorMessage = 'File conflict or validation error. The file may have been modified by someone else. Try loading the file from GitHub first.';
    } else if (error.status === 404) {
      errorMessage = 'Repository or file path not found. Check your repository and file path.';
    } else if (error.status === 401 || error.status === 403) {
      errorMessage = 'Authentication failed. Please reconnect to GitHub.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    this.gitHubError = `Failed to publish: ${errorMessage}`;
    this.isPublishing = false;
    console.error('GitHub publish error:', error);
  }

  connectToGitHub(): void {
    const clientId = 'Ov23liM8jdVptvkhxswe';
    const redirectUri = encodeURIComponent(window.location.origin + '/builder/auth');
    const scope = encodeURIComponent('repo user');
    
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  }

  // Helper methods for managing dynamic form arrays

  // Home Elements Management
  get elementsArray(): FormArray {
    return this.appForm.get('home.element.elements') as FormArray;
  }

  addElement(type: string = 'alert'): void {
    const elementForm = this.createElementFormByType(type);
    this.elementsArray.push(elementForm);
  }

  removeElement(index: number): void {
    this.elementsArray.removeAt(index);
  }

  createElementFormByType(type: string): FormGroup {
    const baseForm = this.createElementForm();
    
    switch (type) {
      case 'alert':
        baseForm.patchValue({
          type: 'alert',
          title: 'Alert title',
          message: 'Alert message'
        });
        const alertIconGroup = baseForm.get('icon') as FormGroup;
        if (alertIconGroup) {
          alertIconGroup.patchValue({
            url: 'pi pi-info-circle',
            tint: true
          });
        }
        break;
        
      case 'sessions':
        baseForm.patchValue({
          type: 'sessions'
        });
        const leftGroup = baseForm.get('left') as FormGroup;
        if (leftGroup) {
          leftGroup.patchValue({
            text: '{0} Sessions Completed',
            icon: 'pi pi-trophy'
          });
        }
        const rightGroup = baseForm.get('right') as FormGroup;
        if (rightGroup) {
          rightGroup.patchValue({
            text: 'Launch Session',
            icon: 'pi pi-unlock',
            action: 'flow://flows/doses'
          });
        }
        break;
        
      case 'button':
        baseForm.patchValue({
          type: 'button'
        });
        const actionGroup = baseForm.get('action') as FormGroup;
        if (actionGroup) {
          actionGroup.patchValue({
            text: 'Show Survey Modal',
            action: 'navmodal://Survey'
          });
        }
        break;
        
      case 'carousel':
        baseForm.patchValue({
          type: 'carousel'
        });
        const carouselActionsArray = baseForm.get('actions') as FormArray;
        if (carouselActionsArray) {
          carouselActionsArray.push(this.createActionFormDefault());
        }
        break;
        
      case 'tiles':
        baseForm.patchValue({
          type: 'tiles',
          position: 'left'
        });
        const tilesActionsArray = baseForm.get('actions') as FormArray;
        if (tilesActionsArray) {
          tilesActionsArray.push(this.createActionFormDefault());
        }
        break;
        
      case 'tile':
        baseForm.patchValue({
          type: 'tile',
          text: 'New Tile',
          backgroundcolor: '#8B5CF6',
          markcompleted: false
        });
        const tileIconGroup = baseForm.get('icon') as FormGroup;
        if (tileIconGroup) {
          tileIconGroup.patchValue({
            url: 'pi pi-square',
            tint: false
          });
        }
        const tileActionGroup = baseForm.get('action') as FormGroup;
        if (tileActionGroup) {
          tileActionGroup.patchValue({
            text: 'New Tile',
            action: 'flow://flows/default'
          });
        }
        break;
        
      default:
        baseForm.patchValue({
          type: type,
          title: '',
          message: ''
        });
    }
    
    return baseForm;
  }

  // Actions Management (for carousel/tiles)
  getActionsArray(elementIndex: number): FormArray {
    return this.elementsArray.at(elementIndex).get('actions') as FormArray;
  }

  addAction(elementIndex: number): void {
    const actionsArray = this.getActionsArray(elementIndex);
    actionsArray.push(this.createActionFormDefault());
  }

  removeAction(elementIndex: number, actionIndex: number): void {
    const actionsArray = this.getActionsArray(elementIndex);
    actionsArray.removeAt(actionIndex);
  }

  createActionFormDefault(): FormGroup {
    return this.fb.group({
      text: ['Action Text'],
      icon: ['/assets/home_mindtrails.png'],
      action: ['flow://flows/example'],
      backgroundcolor: ['#1A206AFF'],
      markcompleted: [true]
    });
  }

  // Menu Management
  get menuArray(): FormArray {
    return this.appForm.get('menu') as FormArray;
  }

  addMenuItem(): void {
    const menuItem = this.fb.group({
      text: ['Menu Item'],
      icon: ['/assets/menu_home.png']
    });
    this.menuArray.push(menuItem);
  }

  removeMenuItem(index: number): void {
    this.menuArray.removeAt(index);
  }

  // Triggers Management
  get triggersArray(): FormArray {
    return this.appForm.get('triggers') as FormArray;
  }

  addTrigger(type: string = 'timing'): void {
    const triggerForm = this.createTriggerFormByType(type);
    this.triggersArray.push(triggerForm);
  }

  removeTrigger(index: number): void {
    this.triggersArray.removeAt(index);
  }

  createTriggerFormByType(type: string): FormGroup {
    if (type === 'timing') {
      return this.fb.group({
        type: ['timing'],
        'event-type': ['silentNotification'],
        frequency: ['00:05:00'],
        time: [''],
        action: this.fb.group({
          path: ['flow://flows/example']
        })
      });
    } else if (type === 'random') {
      return this.fb.group({
        type: ['random'],
        'event-type': ['silentNotification'],
        days: [7],
        triggers: this.fb.array([this.createRandomTriggerAction()])
      });
    }
    return this.fb.group({
      type: [type],
      'event-type': ['silentNotification'],
      frequency: ['00:05:00']
    });
  }

  // Random Trigger Actions Management
  getRandomTriggersArray(triggerIndex: number): FormArray {
    return this.triggersArray.at(triggerIndex).get('triggers') as FormArray;
  }

  addRandomTriggerAction(triggerIndex: number): void {
    const randomTriggersArray = this.getRandomTriggersArray(triggerIndex);
    randomTriggersArray.push(this.createRandomTriggerAction());
  }

  removeRandomTriggerAction(triggerIndex: number, actionIndex: number): void {
    const randomTriggersArray = this.getRandomTriggersArray(triggerIndex);
    randomTriggersArray.removeAt(actionIndex);
  }

  createRandomTriggerAction(): FormGroup {
    return this.fb.group({
      'default-time': [''],
      open: [''],
      close: [''],
      action: this.fb.group({
        path: ['flow://flows/example'],
        expiry: ['']
      })
    });
  }

  // Probes Management
  get probesArray(): FormArray {
    return this.appForm.get('probes') as FormArray;
  }

  addProbe(type: string = 'Location'): void {
    const probeForm = this.fb.group({
      type: [type],
      optional: [true],
      interval: ['00:00:01'],
      accuracy: [5]
    });
    this.probesArray.push(probeForm);
  }

  removeProbe(index: number): void {
    this.probesArray.removeAt(index);
  }
}

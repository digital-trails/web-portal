import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { GithubFacade } from './github.facade';


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

  // Survey data
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
        },
        {
          id: 2,
          question: "How many hours did you sleep last night?",
          options: ["Less than 6", "6-8 hours", "8-10 hours", "More than 10"]
        },
        {
          id: 3,
          question: "Did you complete your daily goals?",
          options: ["Not at all", "Partially", "Mostly", "Completely"]
        }
      ]
    },
    { 
      id: 'track-progress',
      name: "Track Your Progress", 
      icon: "📊",
      questions: [
        {
          id: 1,
          question: "How confident do you feel about your progress?",
          options: ["Not confident", "Slightly confident", "Very confident", "Extremely confident"]
        },
        {
          id: 2,
          question: "What area needs the most improvement?",
          options: ["Sleep", "Exercise", "Nutrition", "Mental health"]
        },
        {
          id: 3,
          question: "How likely are you to recommend this program?",
          options: ["Very unlikely", "Unlikely", "Likely", "Very likely"]
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
    // testing getUserRepositories method
    this.githubFacade.getUserRepositories().subscribe({
      next: (repos) => {
        console.log('User Repositories:', repos);
        if (repos.length > 0) {
          // Automatically set the first repository as current
          const firstRepo = repos[0];
          this.githubFacade.changeOwnerAndRepo(firstRepo.owner.login, firstRepo.name);
          console.log(`Changed to repository: ${firstRepo.name} owned by ${firstRepo.owner
.login}`);
        }
      },
      error: (error) => {
        console.error('Error fetching user repositories:', error);  
        }
    });

    // testing getReleases and getRelease methods
    this.githubFacade.getReleases().subscribe({
      next: (releases) => {
        console.log('Releases:', releases);

        if (releases.length > 0) {
          // getting the first release
          this.githubFacade.getRelease(releases[0].tag_name).subscribe({
            next: (release) => {
              console.log('Release details:', release);

              // testing updating this release
              const updatedRelease = {
                ...release,
                name: release.name + ' (Updated)',  // update the name
                body: (release.body || '') + '\n\nUpdated release notes.',
                prerelease: false,
                draft: false
              };

              this.githubFacade.putRelease(updatedRelease).subscribe({
                next: (updateResponse) => {
                  console.log('✅ Updated release response:', updateResponse);

                  // testing creating a new release
                  const newRelease = {
                    tag_name: 'test-new-release-' + Date.now(),
                    name: 'Test New Release',
                    body: 'This is a test new release created via putRelease().',
                    draft: false,
                    prerelease: false,
                    target_commitish: 'main'
                  };

                  this.githubFacade.putRelease(newRelease).subscribe({
                    next: (createResponse) => {
                      console.log('✅ Created new release response:', createResponse);
                    },
                    error: (createError) => {
                      console.error('❌ Error creating new release:', createError);
                    }
                  });

                },
                error: (updateError) => {
                  console.error('❌ Error updating release:', updateError);
                }
              });
            },
            error: (releaseError) => {
              console.error('Error fetching release details:', releaseError);
            }
          });
        } else {
          console.warn('No releases found to update or fetch.');
        }
      },
      error: (error) => {
        console.error('Error fetching releases:', error);
      }
    });
    // testing getBranches and getBranch methods
    this.githubFacade.getBranches().subscribe({
      next: (branches) => {
        console.log('✅ Branches:', branches);

        const firstBranchName = branches[0].name;

        this.githubFacade.getBranch(firstBranchName).subscribe({
          next: (branch) => {
            console.log('✅ Branch details:', branch);
          },
          error: (branchError) => {
            console.error('❌ Error fetching branch details:', branchError);
          }
        });
      },
      error: (error) => {
        console.error('❌ Error fetching branches:', error);
      }
    });
    // Subscribe to form changes for real-time updates
    this.appForm.valueChanges.subscribe((value) => {
      this.updateAppData(value);
      this.updateProtocolFromForm(value);
      this.refreshScreens();
    });
    
    // Initialize home screen
    this.refreshScreens();
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
      title: [this.appData.title, Validators.required],
      subtitle: [this.appData.subtitle],
      button1: [this.appData.button1],
      button2: [this.appData.button2],
      button3: [this.appData.button3],
      button4: [this.appData.button4],
      // Survey configuration
      survey1Name: [this.surveysData[0].name],
      survey2Name: [this.surveysData[1].name],
      // Survey 1 questions
      survey1Q1: [this.surveysData[0].questions[0].question],
      survey1Q1Options: [this.surveysData[0].questions[0].options.join('|')],
      survey1Q2: [this.surveysData[0].questions[1].question],
      survey1Q2Options: [this.surveysData[0].questions[1].options.join('|')],
      survey1Q3: [this.surveysData[0].questions[2].question],
      survey1Q3Options: [this.surveysData[0].questions[2].options.join('|')],
      // Survey 2 questions
      survey2Q1: [this.surveysData[1].questions[0].question],
      survey2Q1Options: [this.surveysData[1].questions[0].options.join('|')],
      survey2Q2: [this.surveysData[1].questions[1].question],
      survey2Q2Options: [this.surveysData[1].questions[1].options.join('|')],
      survey2Q3: [this.surveysData[1].questions[2].question],
      survey2Q3Options: [this.surveysData[1].questions[2].options.join('|')],
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
    
    // Update surveys data from form
    this.surveysData[0].name = formValue.survey1Name || "End Of Day";
    this.surveysData[1].name = formValue.survey2Name || "Track Your Progress";
    
    // Update Survey 1 questions (limit to 4 options)
    this.surveysData[0].questions[0].question = formValue.survey1Q1 || this.surveysData[0].questions[0].question;
    this.surveysData[0].questions[0].options = formValue.survey1Q1Options ? formValue.survey1Q1Options.split('|').slice(0, 4) : this.surveysData[0].questions[0].options;
    this.surveysData[0].questions[1].question = formValue.survey1Q2 || this.surveysData[0].questions[1].question;
    this.surveysData[0].questions[1].options = formValue.survey1Q2Options ? formValue.survey1Q2Options.split('|').slice(0, 4) : this.surveysData[0].questions[1].options;
    this.surveysData[0].questions[2].question = formValue.survey1Q3 || this.surveysData[0].questions[2].question;
    this.surveysData[0].questions[2].options = formValue.survey1Q3Options ? formValue.survey1Q3Options.split('|').slice(0, 4) : this.surveysData[0].questions[2].options;
    
    // Update Survey 2 questions (limit to 4 options)
    this.surveysData[1].questions[0].question = formValue.survey2Q1 || this.surveysData[1].questions[0].question;
    this.surveysData[1].questions[0].options = formValue.survey2Q1Options ? formValue.survey2Q1Options.split('|').slice(0, 4) : this.surveysData[1].questions[0].options;
    this.surveysData[1].questions[1].question = formValue.survey2Q2 || this.surveysData[1].questions[1].question;
    this.surveysData[1].questions[1].options = formValue.survey2Q2Options ? formValue.survey2Q2Options.split('|').slice(0, 4) : this.surveysData[1].questions[1].options;
    this.surveysData[1].questions[2].question = formValue.survey2Q3 || this.surveysData[1].questions[2].question;
    this.surveysData[1].questions[2].options = formValue.survey2Q3Options ? formValue.survey2Q3Options.split('|').slice(0, 4) : this.surveysData[1].questions[2].options;
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
}

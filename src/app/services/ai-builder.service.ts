import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ProtocolUpdateRequest {
  operation: 'add' | 'modify' | 'delete' | 'replace';
  elementType?: string;
  target?: string; // path to the element to modify
  data?: any; // the new data to add/modify
  explanation?: string; // explanation of what was changed
}

@Injectable({
  providedIn: 'root'
})
export class AiBuilderService {
  private protocolSubject = new BehaviorSubject<any>(null);
  public protocol$ = this.protocolSubject.asObservable();
  
  private updateRequestSubject = new BehaviorSubject<ProtocolUpdateRequest | null>(null);
  public updateRequest$ = this.updateRequestSubject.asObservable();

  constructor() {}

  // Called by the builder component to share its current protocol
  setCurrentProtocol(protocol: any): void {
    this.protocolSubject.next(protocol);
  }

  // Called by the builder component to get the current protocol
  getCurrentProtocol(): any {
    return this.protocolSubject.value;
  }

  // Called by the AI service to request protocol updates
  requestProtocolUpdate(request: ProtocolUpdateRequest): void {
    this.updateRequestSubject.next(request);
  }

  // Get available component types and their structures
  getComponentTemplates(): any {
    return {
      alert: {
        type: 'alert',
        title: 'New Alert',
        message: 'Alert message',
        icon: { url: 'pi pi-info-circle', tint: true }
      },
      button: {
        type: 'button',
        action: {
          text: 'New Button',
          action: 'navmodal://Survey'
        }
      },
      sessions: {
        type: 'sessions',
        left: {
          text: '{0} Sessions Completed',
          icon: 'pi pi-trophy'
        },
        right: {
          text: 'Launch Session',
          icon: 'pi pi-unlock',
          action: 'flow://flows/doses'
        }
      },
      carousel: {
        type: 'carousel',
        items: [
          {
            text: 'New Item',
            icon: 'pi pi-star',
            action: 'flow://flows/inputs',
            backgroundcolor: '#4CAF50'
          }
        ]
      },
      tile: {
        type: 'tile',
        text: 'New Tile',
        icon: 'pi pi-home',
        action: 'navpage://settings',
        backgroundcolor: '#2196F3',
        markcompleted: false
      },
      goals: {
        type: 'goals',
        goals: [
          {
            text: 'New Goal',
            description: 'Goal description',
            target: 10,
            current: 0
          }
        ]
      }
    };
  }

  // Get available actions
  getAvailableActions(): any[] {
    return [
      { value: 'navmodal://Survey', label: 'Show Survey Modal' },
      { value: 'flow://flows/inputs', label: 'Input Flow' },
      { value: 'flow://flows/survey1', label: 'Survey Flow 1' },
      { value: 'flow://flows/survey2', label: 'Survey Flow 2' },
      { value: 'flow://flows/demographics', label: 'Demographics Flow' },
      { value: 'flow://flows/doses', label: 'Doses Flow' },
      { value: 'navpage://settings', label: 'Settings Page' },
      { value: 'https://example.com', label: 'External URL' }
    ];
  }

  // Get available icons
  getAvailableIcons(): any[] {
    return [
      { value: 'pi pi-home', label: 'Home' },
      { value: 'pi pi-user', label: 'User' },
      { value: 'pi pi-calendar', label: 'Calendar' },
      { value: 'pi pi-trophy', label: 'Trophy' },
      { value: 'pi pi-heart', label: 'Heart' },
      { value: 'pi pi-star', label: 'Star' },
      { value: 'pi pi-play', label: 'Play' },
      { value: 'pi pi-pause', label: 'Pause' },
      { value: 'pi pi-stop', label: 'Stop' },
      { value: 'pi pi-plus', label: 'Plus' },
      { value: 'pi pi-minus', label: 'Minus' },
      { value: 'pi pi-check', label: 'Check' },
      { value: 'pi pi-times', label: 'Times' },
      { value: 'pi pi-info-circle', label: 'Info' },
      { value: 'pi pi-exclamation-triangle', label: 'Warning' },
      { value: 'pi pi-bell', label: 'Bell' },
      { value: 'pi pi-unlock', label: 'Unlock' },
      { value: 'pi pi-cog', label: 'Settings' },
      { value: 'pi pi-search', label: 'Search' }
    ];
  }

  // Get a comprehensive schema for AI to understand the protocol structure
  getProtocolSchema(): any {
    return {
      description: "Mobile app protocol JSON structure",
      structure: {
        icon: "string (PrimeNG icon class like 'pi pi-home')",
        home: {
          title: "string (app title)",
          element: {
            type: "string (always 'list')",
            elements: "array of component objects"
          }
        },
        menu: "array of menu items (optional)",
        triggers: "array of trigger objects (optional)",
        probes: "array of probe objects (optional)"
      },
      availableComponents: [
        {
          type: "alert",
          purpose: "Display notifications or messages",
          example: {
            type: "alert",
            title: "Alert Title",
            message: "Alert message text",
            icon: {
              url: "pi pi-info-circle",
              tint: true
            }
          }
        },
        {
          type: "sessions",
          purpose: "Display progress tracking with left/right sections",
          example: {
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
          }
        },
        {
          type: "button",
          purpose: "Interactive button that triggers actions",
          example: {
            type: "button",
            action: {
              text: "Button Text",
              action: "navmodal://Survey"
            }
          }
        },
        {
          type: "carousel",
          purpose: "Horizontal scrolling list of interactive items",
          example: {
            type: "carousel",
            actions: [
              {
                text: "Item Text",
                icon: "pi pi-star",
                action: "flow://flows/example",
                backgroundcolor: "#4CAF50",
                markcompleted: true
              }
            ]
          }
        },
        {
          type: "tile",
          purpose: "Single interactive tile with completion tracking",
          example: {
            type: "tile",
            text: "Tile Label",
            icon: "pi pi-home",
            action: "flow://flows/example",
            backgroundcolor: "#2196F3",
            markcompleted: false
          }
        },
        {
          type: "goals",
          purpose: "Goal tracking with progress bars",
          example: {
            type: "goals",
            goals: [
              {
                type: "steps",
                occurence: 1,
                starting: 0,
                percentile: 1.0
              }
            ]
          }
        }
      ]
    };
  }
} 
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AiBuilderService, ProtocolUpdateRequest } from './ai-builder.service';
import { HttpFacade } from '../http.facade';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface AIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatbotService {
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(
    private httpFacade: HttpFacade, 
    private aiBuilderService: AiBuilderService
  ) {
    // Initialize with enhanced system message
    this.addMessage({
      role: 'system',
      content: this.getSystemPrompt()
    });
  }

  getMessages(): ChatMessage[] {
    return this.messagesSubject.value;
  }

  addMessage(message: ChatMessage): void {
    const messages = [...this.messagesSubject.value, message];
    this.messagesSubject.next(messages);
  }

  async sendMessage(userMessage: string): Promise<void> {
    // Add user message
    this.addMessage({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    try {
      const response = await this.callAIAPI(userMessage);
      
      // Add AI response
      this.addMessage({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error calling AI API:', error);
      
      // Add error message
      this.addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      });
    }
  }

  private async callAIAPI(userMessage: string): Promise<string> {

    const url = "https://staging.digital-trails.org/api/agents/builder";
    const headers = new HttpHeaders({'Content-Type': 'application/json',});

    // Get current protocol context
    const currentProtocol = this.aiBuilderService.getCurrentProtocol();
    const protocolContext = currentProtocol ? `\n\nCurrent Protocol:\n${JSON.stringify(currentProtocol, null, 2)}` : '';

    const body = {
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt()
        },
        {
          role: 'user',
          content: userMessage + protocolContext
        }
      ],
      max_tokens: 2048,
      temperature: 0.7,
      top_p: 0.9,
    };

    console.log('Making AI API request to:', url);
    console.log('Request body:', JSON.stringify(body, null, 2));

    try {
      const response = await this.httpFacade.post<AIResponse>(url, body, { headers }).toPromise();
      console.log('AI API response:', response);
      
      if (response && response.choices && response.choices.length > 0) {
        const aiResponse = response.choices[0].message.content;
        
        // Check if the AI response contains protocol updates
        await this.processAIResponse(aiResponse, userMessage);
        
        return aiResponse;
      } else {
        console.error('Invalid response structure from AI API:', response);
        throw new Error('Invalid response from AI API');
      }
    } catch (error) {
      console.error('AI API call failed:', error);
      throw error;
    }
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
    // Re-add system message
    this.addMessage({
      role: 'system',
      content: this.getSystemPrompt()
    });
  }

  isAIConfigured(): boolean {
    return true;
  }

  private getSystemPrompt(): string {
    const schema = this.aiBuilderService.getProtocolSchema();
    const actions = this.aiBuilderService.getAvailableActions();
    const icons = this.aiBuilderService.getAvailableIcons();

    return `You are an expert AI assistant specialized in dynamically creating and modifying mobile app configurations using JSON protocols. You understand natural language descriptions and translate them into precise JSON structures that represent mobile app interfaces.

## CORE CAPABILITIES:
1. **Create Complete Apps**: Generate entire app configurations for ANY domain (fitness, meditation, cooking, shopping, education, gaming, etc.)
2. **Make Targeted Changes**: Add, modify, or remove specific components in existing apps
3. **Understand Context**: Interpret user intent and suggest appropriate UI components and flows

## PROTOCOL STRUCTURE:
${JSON.stringify(schema, null, 2)}

## AVAILABLE ACTIONS (for buttons/tiles/carousel items):
${actions.map(action => `- ${action.value} (${action.label})`).join('\n')}

## AVAILABLE ICONS (PrimeNG classes):
${icons.map(icon => `- ${icon.value} (${icon.label})`).join('\n')}

## COLOR PALETTE (use hex codes):
- Primary: #2196F3 (blue)
- Success: #4CAF50 (green) 
- Warning: #FF9800 (orange)
- Error: #F44336 (red)
- Info: #00BCD4 (cyan)
- Purple: #9C27B0
- Pink: #E91E63
- Indigo: #3F51B5

## AVAILABLE ELEMENT TYPES (ONLY USE THESE):
1. **alert** - Notifications and messages
2. **sessions** - Progress tracking display
3. **button** - Interactive action buttons
4. **carousel** - Horizontal scrolling list
5. **tile** - Individual action tiles

**CRITICAL**: Do NOT use any other element types (like "goals", "list", etc.). Only use the 5 types listed above.

## INTELLIGENCE GUIDELINES:

### For Complete App Creation:
When user says "Create a [type] app" or describes an app concept:

1. **Analyze the Domain**: Understand what type of app they want (fitness, cooking, learning, etc.)
2. **Design Appropriate Components**: 
   - Alert for daily motivation/tips
   - Sessions for progress tracking 
   - Carousel for main feature categories
   - Tile for individual quick actions
3. **Choose Relevant Icons**: Match icons to the app's purpose
4. **Create Meaningful Actions**: Use appropriate flow paths like 'flow://flows/[feature]'
5. **Apply Consistent Theming**: Use colors that match the app's domain

### For Targeted Changes:
When user says "Add a button for..." or "Change the...":

1. **Identify Target**: Determine what component to modify
2. **Preserve Context**: Keep existing components unless specifically asked to change them
3. **Maintain Consistency**: Use similar styling and patterns

### Response Format:
1. **Brief Explanation**: "I'll create a [type] app with..."
2. **Component Reasoning**: Explain why you chose specific components
3. **JSON Generation**: Generate the complete or partial JSON structure

## EXAMPLES:

**User:** "Create a cooking app"
**Your Response:** 
"I'll create a cooking app focused on recipes, meal planning, and cooking techniques. Here's what I'm building:

- Welcome alert with daily recipe inspiration
- Sessions tracking for recipes completed
- Carousel with recipe categories (Breakfast, Lunch, Dinner, Desserts)
- Tile for meal planner
- Goals for weekly cooking targets

[Generate appropriate JSON]"

**User:** "Add a button to track water intake"
**Your Response:**
"I'll add a water tracking button to help monitor daily hydration. This will be a simple button that opens a water intake flow.

[Generate button component JSON]"

## CRITICAL RULES:
1. **Always generate valid JSON** that matches the protocol structure exactly
2. **Use semantic naming** - make action paths descriptive (e.g., 'flow://flows/water-tracking')
3. **Include helpful descriptions** in goals and alerts
4. **Choose appropriate icons** that match the functionality
5. **Use consistent color schemes** within each app
6. **Make components interactive** - every button/tile/carousel item should have an action
7. **Think creatively** - you can build apps for ANY domain the user describes

 Remember: You're not limited to templates. Use your intelligence to create unique, contextually appropriate apps based on what the user actually wants!

## CRITICAL OUTPUT FORMAT:

**When creating complete apps or making modifications that require JSON:**

1. First provide your friendly explanation
2. Then provide the JSON wrapped in markdown code blocks:

\`\`\`json
{
  "icon": "pi pi-home",
  "home": {
    "title": "App Name",
    "element": {
      "type": "list", 
      "elements": [
        {
          "type": "alert",
          "title": "Welcome",
          "message": "Message here",
          "icon": {
            "url": "pi pi-info-circle",
            "tint": true
          }
        },
        {
          "type": "sessions",
          "left": {
            "text": "{0} Completed",
            "icon": "pi pi-check"
          },
          "right": {
            "text": "Start",
            "icon": "pi pi-play",
            "action": "flow://flows/start"
          }
        }
      ]
    }
  }
}
\`\`\`

**CRITICAL: Element Structure**
- Elements are flat objects with properties directly on them
- DO NOT wrap properties in a "properties" object
- Each element has its "type" and other fields at the same level

**The JSON MUST:**
- Be valid JSON syntax
- Follow the exact protocol structure shown above
- Include all required properties directly on each element
- Use proper PrimeNG icon classes
- Use descriptive action paths
- Include appropriate colors and styling

**For targeted changes:**
Include only the specific component/modification needed, but still wrap in JSON code blocks.`;
  }

  private getComponentDescription(type: string): string {
    const descriptions: { [key: string]: string } = {
      alert: 'Display messages or notifications with title, message, and icon',
      button: 'Interactive buttons that trigger actions when tapped',
      sessions: 'Progress tracking with left/right sections for completed sessions',
      carousel: 'Horizontal scrolling list of items with icons and actions',
      tile: 'Single interactive tiles with icons, text, and completion tracking'
    };
    return descriptions[type] || 'App component';
  }

  private async processAIResponse(aiResponse: string, userRequest: string): Promise<void> {
    try {
      console.log('Processing AI response for protocol updates...');
      console.log('User request:', userRequest);
      console.log('AI response:', aiResponse);
      
      // Check if the AI response contains JSON (regardless of request type)
      const jsonMatch = this.extractJSONFromResponse(aiResponse);
      console.log('Extracted JSON:', jsonMatch);
      
      if (jsonMatch) {
        // Determine the type of update based on user request
        if (this.shouldCreateCompleteApp(userRequest)) {
          console.log('Detected complete app creation request');
          await this.handleCompleteAppCreation(userRequest, aiResponse);
        } else if (this.shouldModifyProtocol(userRequest) || this.containsJSON(aiResponse)) {
          // If we have JSON in response OR it's a modification request, apply the update
          console.log('Detected protocol modification request');
          await this.handleProtocolModification(userRequest, aiResponse);
        }
      } else {
        console.log('No JSON found in AI response - skipping protocol update');
      }
    } catch (error) {
      console.error('Error processing AI response for protocol updates:', error);
    }
  }

  private containsJSON(response: string): boolean {
    // Check if the response contains JSON code blocks or JSON-like structures
    return response.includes('```json') || response.includes('{') && response.includes('}');
  }

  private shouldCreateCompleteApp(userRequest: string): boolean {
    const appKeywords = ['create', 'build', 'make', 'design', 'generate', 'develop'];
    const appIndicators = ['app', 'application', 'mobile app'];
    
    const lowerRequest = userRequest.toLowerCase();
    return appKeywords.some(keyword => lowerRequest.includes(keyword)) &&
           (appIndicators.some(indicator => lowerRequest.includes(indicator)) || 
            lowerRequest.includes('entire') || lowerRequest.includes('whole'));
  }

  private shouldModifyProtocol(userRequest: string): boolean {
    const modificationKeywords = ['add', 'create', 'make', 'change', 'update', 'modify', 'delete', 'remove', 'insert', 'include', 'put'];
    const componentKeywords = ['button', 'alert', 'carousel', 'tile', 'goal', 'session', 'element', 'component', 'feature'];
    const generalModifications = ['color', 'title', 'text', 'icon', 'background', 'style'];
    
    const lowerRequest = userRequest.toLowerCase();
    return modificationKeywords.some(keyword => lowerRequest.includes(keyword)) &&
           (componentKeywords.some(component => lowerRequest.includes(component)) ||
            generalModifications.some(mod => lowerRequest.includes(mod)));
  }

  private async handleCompleteAppCreation(userRequest: string, aiResponse: string): Promise<void> {
    // The LLM will now generate the complete JSON structure
    // Need to extract the JSON from the AI response
    const jsonMatch = this.extractJSONFromResponse(aiResponse);
    
    if (jsonMatch) {
      this.aiBuilderService.requestProtocolUpdate({
        operation: 'replace',
        data: jsonMatch,
        explanation: `Created a complete app based on your request`
      });
    }
  }

  private extractJSONFromResponse(response: string): any {
    try {
      // Look for JSON blocks in the response
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
      let match = response.match(jsonRegex);
      
      if (!match) {
        // Try without markdown formatting
        const bracketRegex = /\{[\s\S]*\}/;
        match = response.match(bracketRegex);
      }
      
      if (match) {
        const jsonString = match[1] || match[0];
        let parsed = JSON.parse(jsonString);
        
        // SAFETY CHECK: Strip out "properties" wrappers if AI generated them incorrectly
        if (parsed && parsed.home && parsed.home.element && parsed.home.element.elements) {
          parsed.home.element.elements = parsed.home.element.elements.map((element: any) => {
            if (element.properties) {
              // Merge properties object into the element itself
              console.warn('AI generated incorrect structure with "properties" wrapper, fixing...');
              const { properties, ...rest } = element;
              return { ...rest, ...properties };
            }
            return element;
          });
        }
        
        return parsed;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to extract JSON from AI response:', error);
      return null;
    }
  }

  private async handleProtocolModification(userRequest: string, aiResponse: string): Promise<void> {
    const currentProtocol = this.aiBuilderService.getCurrentProtocol();
    console.log('Current protocol:', currentProtocol);

    // Try to extract JSON from AI response for any modification
    const jsonMatch = this.extractJSONFromResponse(aiResponse);
    console.log('JSON match for modification:', jsonMatch);
    
    if (jsonMatch) {
      // Determine the type of operation
      let operation: 'add' | 'modify' | 'replace' = 'add';
      let explanation = 'Updated app based on your request';
      
      const lowerRequest = userRequest.toLowerCase();
      
      if (lowerRequest.includes('change') || lowerRequest.includes('modify') || lowerRequest.includes('update') || lowerRequest.includes('make')) {
        operation = 'modify';
        explanation = 'Modified app component based on your request';
      } else if (lowerRequest.includes('replace') || lowerRequest.includes('entire') || lowerRequest.includes('whole')) {
        operation = 'replace';
        explanation = 'Replaced entire app based on your request';
      } else {
        operation = 'add';
        explanation = 'Added new component based on your request';
      }

      console.log(`Applying ${operation} operation with data:`, jsonMatch);

      // If the JSON looks like a complete app structure, replace everything
      if (jsonMatch.home && jsonMatch.home.element && jsonMatch.home.element.elements) {
        operation = 'replace';
        explanation = 'Updated entire app structure based on your request';
      }
      // If the JSON looks like individual elements, add them
      else if (Array.isArray(jsonMatch) || jsonMatch.type) {
        operation = 'add';
        explanation = `Added new ${jsonMatch.type || 'component'} based on your request`;
      }

      this.aiBuilderService.requestProtocolUpdate({
        operation,
        data: jsonMatch,
        explanation
      });
    } else {
      console.log('No JSON found, using fallback handlers');
      // Fallback to simple text parsing for basic modifications
      if (userRequest.toLowerCase().includes('add') && userRequest.toLowerCase().includes('button')) {
        await this.handleAddButton(userRequest);
      } else if (userRequest.toLowerCase().includes('add') && userRequest.toLowerCase().includes('alert')) {
        await this.handleAddAlert(userRequest);
      } else if (userRequest.toLowerCase().includes('add') && userRequest.toLowerCase().includes('tile')) {
        await this.handleAddTile(userRequest);
      } else if (userRequest.toLowerCase().includes('change') && userRequest.toLowerCase().includes('title')) {
        await this.handleChangeTitle(userRequest);
      }
    }
  }

  private async handleAddButton(userRequest: string): Promise<void> {
    const templates = this.aiBuilderService.getComponentTemplates();
    const buttonTemplate = { ...templates.button };
    
    // Extract button text from request
    const textMatch = userRequest.match(/(?:button|add) (?:to |for )?(?:"|')([^"']+)(?:"|')|(?:button|add) ([^"'\n,]+)/i);
    if (textMatch) {
      buttonTemplate.action.text = textMatch[1] || textMatch[2].trim();
    }

    this.aiBuilderService.requestProtocolUpdate({
      operation: 'add',
      elementType: 'button',
      data: buttonTemplate,
      explanation: `Added a new button: ${buttonTemplate.action.text}`
    });
  }

  private async handleAddAlert(userRequest: string): Promise<void> {
    const templates = this.aiBuilderService.getComponentTemplates();
    const alertTemplate = { ...templates.alert };
    
    // Extract alert text from request
    const textMatch = userRequest.match(/alert (?:saying |with |that says )?(?:"|')([^"']+)(?:"|')/i);
    if (textMatch) {
      alertTemplate.title = textMatch[1];
      alertTemplate.message = textMatch[1];
    }

    this.aiBuilderService.requestProtocolUpdate({
      operation: 'add',
      elementType: 'alert',
      data: alertTemplate,
      explanation: `Added a new alert: ${alertTemplate.title}`
    });
  }

  private async handleAddTile(userRequest: string): Promise<void> {
    const templates = this.aiBuilderService.getComponentTemplates();
    const tileTemplate = { ...templates.tile };
    
    // Extract tile text from request
    const textMatch = userRequest.match(/tile (?:for |to |saying )?(?:"|')([^"']+)(?:"|')/i);
    if (textMatch) {
      tileTemplate.text = textMatch[1];
    }

    this.aiBuilderService.requestProtocolUpdate({
      operation: 'add',
      elementType: 'tile',
      data: tileTemplate,
      explanation: `Added a new tile: ${tileTemplate.text}`
    });
  }

  private async handleChangeTitle(userRequest: string): Promise<void> {
    const titleMatch = userRequest.match(/title to (?:"|')([^"']+)(?:"|')/i);
    if (titleMatch) {
      this.aiBuilderService.requestProtocolUpdate({
        operation: 'modify',
        target: 'home.title',
        data: titleMatch[1],
        explanation: `Changed app title to: ${titleMatch[1]}`
      });
    }
  }
} 
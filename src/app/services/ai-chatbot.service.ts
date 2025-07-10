import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

  constructor(private http: HttpClient) {
    // Initialize with system message
    this.addMessage({
      role: 'system',
      content: 'You are an AI assistant that helps users build mobile apps. You understand app protocols and can help generate features based on natural language descriptions.'
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
    const apiKey = environment.azureOpenAI.apiKey;
    const endpoint = environment.azureOpenAI.endpoint;
    const modelName = environment.azureOpenAI.model;

    if (!apiKey || !endpoint || !modelName) {
      throw new Error('AI configuration is missing. Please check your environment variables.');
    }

    const url = `${endpoint}/chat/completions`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'api-key': apiKey
    });

    const body = {
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that helps users build mobile apps. You understand app protocols and can help generate features based on natural language descriptions. Provide helpful, concise responses.'
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: 2048,
      temperature: 0.8,
      top_p: 0.1,
      model: modelName
    };

    const response = await this.http.post<AIResponse>(url, body, { headers }).toPromise();
    
    if (response && response.choices && response.choices.length > 0) {
      return response.choices[0].message.content;
    } else {
      throw new Error('Invalid response from AI API');
    }
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
    // Re-add system message
    this.addMessage({
      role: 'system',
      content: 'You are an AI assistant that helps users build mobile apps. You understand app protocols and can help generate features based on natural language descriptions.'
    });
  }

  isAIConfigured(): boolean {
    return !!(environment.azureOpenAI.apiKey && 
              environment.azureOpenAI.endpoint && 
              environment.azureOpenAI.model);
  }
} 
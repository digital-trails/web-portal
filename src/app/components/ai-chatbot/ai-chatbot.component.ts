import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiChatbotService, ChatMessage } from '../../services/ai-chatbot.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ai-chatbot',
  templateUrl: './ai-chatbot.component.html',
  styleUrls: ['./ai-chatbot.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AiChatbotComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isOpen: boolean = false;
  isLoading: boolean = false;
  private messagesSubscription: Subscription;

  constructor(private aiChatbotService: AiChatbotService) {
    this.messagesSubscription = this.aiChatbotService.messages$.subscribe(
      messages => this.messages = messages
    );
  }

  ngOnInit(): void {
    // Component is initialized
  }

  ngOnDestroy(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim()) return;

    const message = this.newMessage.trim();
    this.newMessage = '';
    this.isLoading = true;

    try {
      await this.aiChatbotService.sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      this.isLoading = false;
    }
  }

  clearChat(): void {
    this.aiChatbotService.clearMessages();
  }

  isAIConfigured(): boolean {
    return this.aiChatbotService.isAIConfigured();
  }
} 
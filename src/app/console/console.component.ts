// console.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-console',
  standalone: false,
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.css']
})
export class ConsoleComponent {
  activeSection = 'users';
  searchQuery = '';


  showSection(section: string) {
    this.activeSection = section;
  }

}
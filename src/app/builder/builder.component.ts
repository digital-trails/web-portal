// builder.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-console',
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

}
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-bottom-bar',
  templateUrl: './bottom-bar.component.html',
  standalone: false,
  styleUrls: ['./bottom-bar.component.css']
})
export class BottomBarComponent {
  @Output() home = new EventEmitter<void>();
  @Output() scripts = new EventEmitter<void>();
  @Output() sensors = new EventEmitter<void>();
  @Output() sidebar = new EventEmitter<void>();

  onHome() { this.home.emit(); }
  onScripts() { this.scripts.emit(); }
  onSensors() { this.sensors.emit(); }
  onSidebar() { this.sidebar.emit(); }
}

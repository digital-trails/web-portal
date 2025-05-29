import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { map, take } from 'rxjs';
import { UserFacade } from '../store/user/user.facade';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  iframeUrl?: SafeResourceUrl;

  constructor(private userFacade: UserFacade, private sanitizer: DomSanitizer) {}
  
  ngOnInit(): void {
    this.userFacade.dashboardUrl$().pipe(
      map(url => this.sanitizer.bypassSecurityTrustResourceUrl(url)),
      take(1),
    ).subscribe(safeUrl => {
      this.iframeUrl = safeUrl;
    });
  }
}

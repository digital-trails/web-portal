import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { take } from 'rxjs';
import { UserFacade } from '../store/user/user.facade';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  iframeUrl?: SafeResourceUrl;

  constructor(private userFacade: UserFacade, private sanitizer: DomSanitizer) { }
  
  ngOnInit(): void {
    this.userFacade.dashboardUrl$().pipe(
      take(1),
    ).subscribe(url => {
      this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
  }
}

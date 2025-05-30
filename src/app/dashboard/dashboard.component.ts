import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { map, switchMap, take } from 'rxjs';
import { UserFacade } from '../store/user/user.facade';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  iframeUrl?: SafeResourceUrl;

  constructor(private userFacade: UserFacade, private route: ActivatedRoute) { }
  
  ngOnInit(): void {
    this.route.queryParams.pipe(
      switchMap(params =>  {
        return this.userFacade.getUser$().pipe(take(1), map(user => {
          return user.admin?.studies.get(params["study"]);
        }));
      })
    ).subscribe(url => {
      this.iframeUrl = url;
    });
  }
}

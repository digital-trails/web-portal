import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserFacade } from '../store/user/user.facade';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  constructor(private activatedRoute: ActivatedRoute, private userfacade: UserFacade) {
  }

}

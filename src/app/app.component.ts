import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { UserFacade } from './store/user/user.facade';
import { map, take } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'web-portal';
  claims: any;

  constructor(private route: ActivatedRoute, private userfacade: UserFacade) {}
  
  ngOnInit(): void {
     this.userfacade.getClaims().pipe(map(take(1))).subscribe(c => {
      this.claims = c;
     });
    // this.claims = this.route.snapshot.data['claims'];
  }
}

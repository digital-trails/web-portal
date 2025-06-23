import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-auth',
  standalone: false,
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      console.log('GitHub Code:', code);

      this.http.post<any>(`https://digital-trails.org/api/v1/gh-token?code=${code}`, {})
        .subscribe({
          next: (data) => {
            console.log('Access Token:', data.token);
            localStorage.setItem('githubAccessToken', data.token);
            window.location.href = '/builder';
          },
          error: (err) => {
            console.error('Token exchange failed:', err);
          }
        });
    } else {
      console.error('No code found.');
    }
  }
}

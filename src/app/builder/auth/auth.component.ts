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
      this.http.post(
        `https://digital-trails.org/api/v1/gh-token?client_id=Ov23liM8jdVptvkhxswe&code=${code}`,
        {},
        { responseType: 'text' }
      )
      .subscribe({
        next: (data) => {
          localStorage.setItem('githubAccessToken', data);
          window.location.href = '/builder';
        },
        error: () => {
          console.error('Error fetching access token');
        }
      });
    } else {
      console.log('No code parameter found in URL');
    }
  }
}

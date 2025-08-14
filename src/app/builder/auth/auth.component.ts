import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
          const params = new URLSearchParams(data);
          const accessToken = params.get('access_token');
          
          sessionStorage.setItem('githubAccessToken', accessToken || '');
          
          // Get user info to set the owner correctly  
          const headers = new HttpHeaders({
            Authorization: `bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json'
          });
          
          this.http.get('https://api.github.com/user', { headers }).subscribe({
            next: (user: any) => {
              sessionStorage.setItem('githubOwner', user.login);
              console.log('GitHub user authenticated:', user.login);
              // Redirect back to builder
              window.location.href = '/builder';
            },
            error: (error) => {
              console.error('Error fetching user info:', error);
              // Still redirect even if user info fails
              window.location.href = '/builder';
            }
          });
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

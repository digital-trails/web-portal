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
          sessionStorage.setItem('githubRepo', 'test'); // hardcoded test repo
          
          const headers = new HttpHeaders({
            Authorization: `bearer ${sessionStorage.getItem('githubAccessToken') || ''}`,
          });
          console.log("before http get request for user info");
          this.http.get<any>('https://api.github.com/user', { headers })
            .subscribe({
              next: (user) => {
                console.log('User info:', user);
                sessionStorage.setItem('githubUser', user.login || '');
                window.location.href = '/builder';
              },
              error: (err) => {
                console.error('Error fetching user info:', err);
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

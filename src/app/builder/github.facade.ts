import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GithubFacade {

  constructor(private http: HttpClient) {}

  getUserRepositories(): Observable<any[]> {
    const headers = new HttpHeaders({
      Authorization: `bearer ${sessionStorage.getItem('githubAccessToken') || ''}`,
      Accept: 'application/vnd.github.v3+json'
    });
    return this.http.get<any[]>('https://api.github.com/user/repos', { headers });
  }

  getFile(filePath: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `bearer ${sessionStorage.getItem('githubAccessToken') || ''}`,
      Accept: 'application/vnd.github.v3+json'
    });
    return this.http.get<any>(`https://api.github.com/repos/${sessionStorage.getItem('githubOwner') || ''}/${sessionStorage.getItem('githubRepo') || ''}/contents/${filePath}`, { headers }).pipe(
      map(file => {
        if (file && file.content) {
          file.content = JSON.parse(atob(file.content)); // Decode base64 content
        }
        return file;
      } )
    );
  }

  putFile(file: any, commitMessage: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `bearer ${sessionStorage.getItem('githubAccessToken') || ''}`,
      Accept: 'application/vnd.github.v3+json'
    });
    const base64Content = btoa(JSON.stringify(file.content, null, 2)); // Convert JSON object to base64 string

    const body = {
      message: commitMessage,
      content: base64Content,
      sha: file.sha
    };

    return this.http.put(`https://api.github.com/repos/${sessionStorage.getItem('githubOwner') || ''}/${sessionStorage.getItem('githubRepo') || ''}/contents/${file.path}`, body, { headers });
  }

  exchangeCodeForToken(code: string): Observable<string> {
    return this.http.post(
      `https://digital-trails.org/api/v1/gh-token?client_id=Ov23liM8jdVptvkhxswe&code=${code}`,
      {},
      { responseType: 'text' }
    );
  }

  getUserInfo(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json'
    });
    return this.http.get('https://api.github.com/user', { headers });
  }
}

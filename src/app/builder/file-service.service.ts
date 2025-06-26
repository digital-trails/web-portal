import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class fileService {
  private token = sessionStorage.getItem('githubAccessToken') || '';
  private owner!: string;
  private repo = "test"; // need to change to name of the repository with src/protocol.json, just using my own test repo for now
  private filePath = "src/protocol.json";
  private sha!: string;

  constructor(private http: HttpClient) {}

  getUserInfo(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `bearer ${this.token}`
    });
    return this.http.get(`https://api.github.com/user`, { headers });
  }

  getFile(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `bearer ${this.token}`,
      Accept: 'application/vnd.github.v3+json'
    });
    return this.http.get<any>(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.filePath}`, { headers });
  }

  decodeJsonFile(base64Content: string): any {
    try {
      const decoded = atob(base64Content);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Failed to decode or parse JSON', error);
      return null;
    }
  }

  // Combined method: fetch file + decode JSON
  fetchAndDecodeJson(): Observable<any> {
    console.log('Auth header:', `bearer ${this.token}`);
    return new Observable(observer => {
      this.getUserInfo().subscribe({
        next: (user) => {
          this.owner = user.login;
          this.getFile().subscribe({
            next: (file) => {
              this.sha = file.sha;
              const decodedJson = this.decodeJsonFile(file.content);
              observer.next(decodedJson);
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        },
        error: (err) => observer.error(err)
      });
    });
  }

  updateFile(newContent: string, commitMessage: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `bearer ${this.token}`,
      Accept: 'application/vnd.github.v3+json'
    });
    const base64Content = btoa(newContent);

    const body = {
      message: commitMessage,
      content: base64Content,
      sha: this.sha
    };

    return this.http.put(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.filePath}`, body, { headers });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { HttpFacade } from '../http.facade';

@Injectable({
  providedIn: 'root'
})
export class GithubFacade {

  constructor(
    private httpFacade: HttpFacade, 
    private http: HttpClient
  ) {}

  domain: string = "https://api.digital-trails.org";

  getUserRepositories(): Observable<any[]> {
    const headers = new HttpHeaders({
      Accept: 'application/vnd.github.v3+json'
    });
    return this.httpFacade.get<any[]>(`${this.domain}/api/user/protocols`, { headers });
  }

  getFile(filePath: string): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/vnd.github.v3+json'
    });
    
    const repo = sessionStorage.getItem('githubRepo');
    
    if (!repo) {
      throw new Error('GitHub repository information not found in session storage');
    }
    
    return this.http.get<any>(`${this.domain}/api/protocols/${repo}/contents/${filePath}`, { headers }).pipe(
      map(file => {
        if (file && file.content) {
          // Preserve the original file metadata including SHA
          const decodedContent = JSON.parse(atob(file.content.replace(/\n/g, ''))); // Remove newlines from base64
          return {
            ...file, // Keep all original metadata (sha, size, etc.)
            content: decodedContent // Replace content with parsed JSON
          };
        }
        return file;
      })
    );
  }

  putFile(file: any, commitMessage: string): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/vnd.github.v3+json'
    });
    
    const base64Content = btoa(JSON.stringify(file.content, null, 2)); // Convert JSON object to base64 string

    const body: any = {
      message: commitMessage,
      content: base64Content
    };

    // Only include SHA if it exists (for updates), omit for new file creation
    if (file.sha) {
      body.sha = file.sha;
    }

    const repo = sessionStorage.getItem('githubRepo');
    const filePath = file.path;

    return this.http.put(`${this.domain}/api/protocols/${repo}/contents/${filePath}`, body, { headers });
  }
}

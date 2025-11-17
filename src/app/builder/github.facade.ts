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
    return this.httpFacade.get<any[]>(`${this.domain}/protocols`);
  }

  getFile(filePath: string): Observable<any> {
    const repo = sessionStorage.getItem('githubRepo');

    if (!repo) {
      throw new Error('GitHub repository information not found in session storage');
    }

    return this.http.get<any>(`${this.domain}/protocols/${repo}/contents/${filePath}`).pipe(
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

    return this.http.put(`${this.domain}/protocols/${repo}/contents/${file.path}`, body);
  }
}

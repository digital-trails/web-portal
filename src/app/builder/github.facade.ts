import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GithubFacade {

  constructor(private http: HttpClient) {}

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

  updateFile(file: any, commitMessage: string) {
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

    this.http.put(`https://api.github.com/repos/${sessionStorage.getItem('githubOwner') || ''}/${sessionStorage.getItem('githubRepo') || ''}/contents/${file.path}`, body, { headers })
      .subscribe({
        next: (response) => {
          console.log('File updated successfully:', response)
          },
          error: (error) => {
            console.error('Error updating file:', error);
          }
      });
  }
}

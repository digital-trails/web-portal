import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { import { HttpFacade } from '../../http.facade';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GithubFacade {

  constructor(private http: HttpClient, private httpFacade: HttpFacade) { }

  getFile(filePath: string): Observable<any> {
    //     const headers = new HttpHeaders({
    //       Authorization: `bearer ${sessionStorage.getItem('githubAccessToken') || ''}`,
    //       Accept: 'application/vnd.github.v3+json'
    //     });
    return this.httpFacade.get<any>("https://portal.digital-trails.org/api/v2/user").pipe(
      map(file => {
        if (file && file.content) {
          file.content = JSON.parse(atob(file.content)); // Decode base64 content
        }
        return file;
      })
    );
  }

  putFile(file: any, commitMessage: string) {
    //     const headers = new HttpHeaders({
    //       Authorization: `bearer ${sessionStorage.getItem('githubAccessToken') || ''}`,
    //       Accept: 'application/vnd.github.v3+json'
    //     });
    const base64Content = btoa(JSON.stringify(file.content, null, 2)); // Convert JSON object to base64 string

    const body = {
      message: commitMessage,
      content: base64Content,
      sha: file.sha
    };

    this.httpFacade.put("https://portal.digital-trails.org/api/v2/user", body)
      .subscribe({
        next: (response) => {
          console.log('File updated successfully:', response)
        },
        error: (error) => {
          console.error('Error updating file:', error);
        }
      });
  }

  getReleases(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `bearer ${sessionStorage.getItem('githubAccessToken') || ''}`,
      Accept: 'application/vnd.github.v3+json'
    });
    return this.http.get<any>(`https://api.github.com/repos/${sessionStorage.getItem('githubOwner') || ''}/${sessionStorage.getItem('githubRepo') || ''}/releases`, { headers });
  }

  getRelease(tagName: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `bearer ${sessionStorage.getItem('githubAccessToken') || ''}`,
      Accept: 'application/vnd.github.v3+json'
    });
    return this.http.get<any>(`https://api.github.com/repos/${sessionStorage.getItem('githubOwner') || ''}/${sessionStorage.getItem('githubRepo') || ''}/releases/tags/${tagName}`, { headers });
  }

  putRelease(release: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `bearer ${sessionStorage.getItem('githubAccessToken') || ''}`,
      Accept: 'application/vnd.github.v3+json'
    });
    const body = {
      tag_name: release.tag_name,
      target_commitish: release.target_commitish || 'main',
      name: release.name,
      body: release.body,
      draft: release.draft || false,
      prerelease: release.prerelease || false
    };

    // conditional to choose to create or update a release
    if (release.id) {
      // Update existing release
      return this.http.patch<any>(`https://api.github.com/repos/${sessionStorage.getItem('githubOwner') || ''}/${sessionStorage.getItem('githubRepo') || ''}/releases/${release.id}`, body, { headers });
    } else {
      // Create new release
      return this.http.post<any>(`https://api.github.com/repos/${sessionStorage.getItem('githubOwner') || ''}/${sessionStorage.getItem('githubRepo') || ''}/releases`, body, { headers });
    }
  }

  getBranches(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `bearer ${sessionStorage.getItem('githubAccessToken') || ''}`,
      Accept: 'application/vnd.github.v3+json'
    });
    return this.http.get<any>(`https://api.github.com/repos/${sessionStorage.getItem('githubOwner') || ''}/${sessionStorage.getItem('githubRepo') || ''}/branches`, { headers });
  }

  getBranch(branchName: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `bearer ${sessionStorage.getItem('githubAccessToken') || ''}`,
      Accept: 'application/vnd.github.v3+json'
    });
    return this.http.get<any>(`https://api.github.com/repos/${sessionStorage.getItem('githubOwner') || ''}/${sessionStorage.getItem('githubRepo') || ''}/branches/${branchName}`, { headers });
  }

  updateRepository(owner: string, repo: string, data: any) { // THIS NOT FOR UPDATING REPOSITORY CONTENTS/FILES, JUST FOR DATA/SETTINGS
    const headers = new HttpHeaders({
      Authorization: `bearer ${sessionStorage.getItem('githubAccessToken') || ''}`,
      Accept: 'application/vnd.github.v3+json',
    });

    return this.http.patch(`https://api.github.com/repos/${owner}/${repo}`, data, {
      headers,
    });
  }

  createOrganizationRepository(org: string, repoData: any): Observable<any> { // org would be digital-trails probably
    const headers = new HttpHeaders({
      Authorization: `token ${sessionStorage.getItem('githubAccessToken') || ''}`,
      Accept: 'application/vnd.github.v3+json',
    });

    return this.http.post(`https://api.github.com/orgs/${org}/repos`, repoData, {
      headers,
    });
  }

  getUserRepositories(): Observable<any> {
    //    const headers = new HttpHeaders({
    //      Authorization: `bearer ${sessionStorage.getItem('githubAccessToken') || ''}`,
    //      Accept: 'application/vnd.github.v3+json'
    //    });

    //    const params = {
    //      affiliation: 'owner,collaborator,organization_member', // All possible affiliations
    //    };

    return this.httpFacade.get<any>("https://portal.digital-trails.org/api/v2/user/studies");
  }

  changeOwnerAndRepo(owner: string, repo: string): void {
    sessionStorage.setItem('githubRepo', repo);
    sessionStorage.setItem('githubOwner', owner);
  }
}

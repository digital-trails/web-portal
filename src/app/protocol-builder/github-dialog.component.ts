import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GitHubRepo, GitHubService, GITHUB_ORG } from '../services/github.service';

export interface GitHubDialogData {
  repoName?: string;
  protocolName: string;
}

export interface GitHubDialogResult {
  repoName?: string;
}

@Component({
  selector: 'app-github-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatIconModule, MatDividerModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon style="vertical-align:middle;margin-right:8px">cloud</mat-icon>
      GitHub Repository
    </h2>

    <mat-dialog-content class="gh-content">
      <p class="org-label">
        Organization: <strong>{{ org }}</strong>
        <a [href]="'https://github.com/' + org" target="_blank" rel="noopener"
           style="margin-left:8px;font-size:0.8rem;opacity:0.7">
          github.com/{{ org }}
        </a>
      </p>

      <mat-divider style="margin:12px 0 16px"></mat-divider>

      <mat-form-field appearance="fill" style="width:100%">
        <mat-label>Repository Name</mat-label>
        <input matInput [(ngModel)]="repoName" placeholder="my-protocol" />
        <mat-hint>Will be created as <strong>{{ org }}/{{ repoName || 'repo-name' }}</strong></mat-hint>
      </mat-form-field>

      <div class="actions-row">
        <button mat-raised-button color="primary"
                [disabled]="!repoName.trim() || busy()"
                (click)="createRepo()">
          <mat-icon>add</mat-icon> Create Repo
        </button>

        <a *ngIf="repoName.trim()"
           [href]="githubService.repoUrl(repoName.trim())"
           target="_blank" rel="noopener" mat-stroked-button style="text-decoration:none">
          <mat-icon>open_in_new</mat-icon> Open on GitHub
        </a>

        <button mat-stroked-button color="warn"
                *ngIf="repoName.trim()"
                [disabled]="busy()"
                (click)="deleteRepo()">
          <mat-icon>delete_forever</mat-icon> Delete
        </button>

        <mat-spinner *ngIf="busy()" diameter="22"></mat-spinner>
      </div>

      <p *ngIf="statusMsg()" class="status" [class.error]="isError()">{{ statusMsg() }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="confirm()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .gh-content { min-width: 400px; padding-top: 8px; }
    .org-label { font-size: 0.875rem; margin: 0 0 4px; color: rgba(255,255,255,0.7); }
    .actions-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
    .status { margin: 10px 0 0; font-size: 0.875rem; color: #81c784; }
    .status.error { color: #ef9a9a; }
  `],
})
export class GitHubDialogComponent implements OnInit {
  repoName = '';
  org = GITHUB_ORG;

  busy = signal(false);
  statusMsg = signal('');
  isError = signal(false);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: GitHubDialogData,
    private dialogRef: MatDialogRef<GitHubDialogComponent>,
    public githubService: GitHubService,
  ) {}

  ngOnInit() {
    this.repoName = this.data.repoName ?? '';
  }

  createRepo() {
    const name = this.repoName.trim();
    if (!name) return;
    this.busy.set(true);
    this.statusMsg.set('');
    this.githubService.createRepo(name, `Protocol: ${this.data.protocolName}`).subscribe({
      next: (repo: GitHubRepo) => {
        this.busy.set(false);
        this.statusMsg.set(`Created: ${repo.full_name}`);
        this.isError.set(false);
      },
      error: (err: any) => {
        this.busy.set(false);
        this.statusMsg.set(err?.error?.message ?? 'Failed to create repo');
        this.isError.set(true);
      },
    });
  }

  deleteRepo() {
    const name = this.repoName.trim();
    if (!name) return;
    if (!confirm(`Delete ${this.org}/${name}? This cannot be undone.`)) return;
    this.busy.set(true);
    this.githubService.deleteRepo(name).subscribe({
      next: () => {
        this.busy.set(false);
        this.repoName = '';
        this.statusMsg.set('Repository deleted.');
        this.isError.set(false);
      },
      error: (err: any) => {
        this.busy.set(false);
        this.statusMsg.set(err?.error?.message ?? 'Failed to delete repo');
        this.isError.set(true);
      },
    });
  }

  confirm() {
    this.dialogRef.close({ repoName: this.repoName.trim() || undefined } as GitHubDialogResult);
  }

  cancel() {
    this.dialogRef.close(undefined);
  }
}

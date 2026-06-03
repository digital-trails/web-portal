import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Protocol, ProtocolStatus } from '../../models/protocol';
import { ProtocolFacade } from '../../store/protocol/protocol.facade';

const STATUS_CONFIG: Record<ProtocolStatus, { label: string; color: string; icon: string }> = {
  draft: { label: 'Draft', color: '#757575', icon: 'description' },
  running: { label: 'Running', color: '#2e7d32', icon: 'play_arrow' },
  paused: { label: 'Paused', color: '#f57c00', icon: 'pause' },
  completed: { label: 'Completed', color: '#1565c0', icon: 'check_circle' },
  archived: { label: 'Archived', color: '#9e9e9e', icon: 'archive' },
};

@Component({
  selector: 'app-protocol-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  template: `
    <div class="protocol-list">
      <div class="header" *ngIf="protocols.length !== 0">
        <h2>Protocols</h2>
        <button mat-raised-button color="primary" (click)="createNew()">
          <mat-icon>add</mat-icon>
          New Protocol
        </button>
      </div>

      <div class="empty-state" *ngIf="protocols.length === 0">
        <mat-icon class="empty-icon">assignment</mat-icon>
        <h3>No protocols yet</h3>
        <p>Create your first study protocol to get started.</p>
        <button mat-raised-button color="primary" (click)="createNew()">
          <mat-icon>add</mat-icon>
          Create Protocol
        </button>
      </div>

      <table mat-table [dataSource]="protocols" *ngIf="protocols.length > 0" class="protocol-table">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let p" class="name-cell">{{ p.name }}</td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let p">
            <span class="status-badge" [style.background]="getStatusColor(p.status)">
              <mat-icon class="status-icon">{{ getStatusIcon(p.status) }}</mat-icon>
              {{ getStatusLabel(p.status) }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="updatedAt">
          <th mat-header-cell *matHeaderCellDef>Last Updated</th>
          <td mat-cell *matCellDef="let p">{{ formatDate(p.updatedAt) }}</td>
        </ng-container>

        <ng-container matColumnDef="createdAt">
          <th mat-header-cell *matHeaderCellDef>Created</th>
          <td mat-cell *matCellDef="let p">{{ formatDate(p.createdAt) }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let p" class="actions-cell" (click)="$event.stopPropagation()">
            <button mat-icon-button matTooltip="Edit" (click)="edit(p)"
                    [disabled]="p.status === 'archived'">
              <mat-icon>edit</mat-icon>
            </button>

            <button mat-icon-button [matTooltip]="getRunActionLabel(p.status)"
                    (click)="toggleRun(p)"
                    *ngIf="p.status !== 'archived' && p.status !== 'completed'">
              <mat-icon>{{ getRunActionIcon(p.status) }}</mat-icon>
            </button>

            <button mat-icon-button [matMenuTriggerFor]="menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="duplicate(p)">
                <mat-icon>content_copy</mat-icon>
                <span>Duplicate</span>
              </button>
              <button mat-menu-item (click)="markCompleted(p)"
                      *ngIf="p.status === 'running' || p.status === 'paused'">
                <mat-icon>check_circle</mat-icon>
                <span>Mark Completed</span>
              </button>
              <button mat-menu-item (click)="archive(p)"
                      *ngIf="p.status !== 'archived' && p.status !== 'running'">
                <mat-icon>archive</mat-icon>
                <span>Archive</span>
              </button>
              <button mat-menu-item (click)="unarchive(p)"
                      *ngIf="p.status === 'archived'">
                <mat-icon>unarchive</mat-icon>
                <span>Restore to Draft</span>
              </button>
              <button mat-menu-item (click)="confirmDelete(p)" class="delete-action">
                <mat-icon color="warn">delete</mat-icon>
                <span>Delete</span>
              </button>
            </mat-menu>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"
            class="protocol-row" (click)="edit(row)"></tr>
      </table>
    </div>
  `,
  styleUrl: './protocol-list.component.css',
})
export class ProtocolListComponent implements OnInit {
  protocols: Protocol[] = [];
  displayedColumns = ['name', 'status', 'updatedAt', 'createdAt', 'actions'];
  statusConfig = STATUS_CONFIG;

  constructor(
    private protocolFacade: ProtocolFacade,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.protocolFacade.getProtocols$().subscribe(p => this.protocols = p);
  }

  createNew() {
    const protocol = this.protocolFacade.createProtocol('Untitled Protocol');
    this.router.navigate(['/protocol-builder', protocol.id]);
  }

  edit(protocol: Protocol) {
    if (protocol.status === 'archived') return;
    this.router.navigate(['/protocol-builder', protocol.id]);
  }

  toggleRun(protocol: Protocol) {
    if (protocol.status === 'draft' || protocol.status === 'paused') {
      this.protocolFacade.setStatus(protocol.id, 'running');
    } else if (protocol.status === 'running') {
      this.protocolFacade.setStatus(protocol.id, 'paused');
    }
  }

  getRunActionIcon(status: ProtocolStatus): string {
    if (status === 'running') return 'pause';
    return 'play_arrow';
  }

  getRunActionLabel(status: ProtocolStatus): string {
    if (status === 'running') return 'Pause';
    if (status === 'paused') return 'Resume';
    return 'Start';
  }

  duplicate(protocol: Protocol) {
    this.protocolFacade.duplicateProtocol(protocol);
  }

  markCompleted(protocol: Protocol) {
    this.protocolFacade.setStatus(protocol.id, 'completed');
  }

  archive(protocol: Protocol) {
    this.protocolFacade.setStatus(protocol.id, 'archived');
  }

  unarchive(protocol: Protocol) {
    this.protocolFacade.setStatus(protocol.id, 'draft');
  }

  confirmDelete(protocol: Protocol) {
    if (confirm(`Delete "${protocol.name}"? This cannot be undone.`)) {
      this.protocolFacade.deleteProtocol(protocol.id);
    }
  }

  getStatusColor(status: string): string {
    return STATUS_CONFIG[status as ProtocolStatus]?.color ?? '#757575';
  }

  getStatusIcon(status: string): string {
    return STATUS_CONFIG[status as ProtocolStatus]?.icon ?? 'help';
  }

  getStatusLabel(status: string): string {
    return STATUS_CONFIG[status as ProtocolStatus]?.label ?? status;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}

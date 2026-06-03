import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { Asset, AssetService, AssetType } from '../services/asset.service';
import { ProtocolFacade } from '../store/protocol/protocol.facade';
import { Protocol } from '../models/protocol';
import { AddAssetDialogComponent } from '../protocol-builder/add-asset-dialog.component';
import { ProtocolContextService } from '../services/protocol-context.service';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

@Component({
  selector: 'app-assets-manager',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    MatTabsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatSelectModule, MatTooltipModule,
    MatSnackBarModule, MatDialogModule,
  ],
  template: `
    <div class="assets-page">
      <div class="assets-header" *ngIf="!embedded">
        <h1 class="page-title">Assets</h1>
        <div class="protocol-selector-row">
          <mat-form-field appearance="fill" class="protocol-select">
            <mat-label>Protocol</mat-label>
            <mat-select [(ngModel)]="selectedProtocolId" (ngModelChange)="onProtocolChange($event)">
              <mat-option *ngFor="let p of protocols()" [value]="p.id">
                {{ p.name }}
              </mat-option>
            </mat-select>
            <mat-hint *ngIf="!protocols().length">No protocols — create one in Protocol Builder</mat-hint>
          </mat-form-field>
        </div>
      </div>

      <div *ngIf="!selectedProtocolId && !embedded" class="no-selection">
        <mat-icon>folder_open</mat-icon>
        <p>Select a protocol above to manage its assets.</p>
      </div>

      <mat-tab-group *ngIf="selectedProtocolId" animationDuration="150ms" class="asset-tabs">

        <!-- ICONS -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">image</mat-icon>
            Icons ({{ icons().length }})
          </ng-template>
          <div class="tab-body">
            <div class="tab-toolbar">
              <span class="tab-desc">PNG/SVG icons used in menu, home screen, and flow headers.</span>
              <button mat-raised-button color="primary" (click)="addAsset('icon')">
                <mat-icon>add</mat-icon> Add Icon
              </button>
            </div>
            <div class="empty-state" *ngIf="!icons().length">
              <mat-icon class="empty-icon">image_not_supported</mat-icon>
              <p>No icons for this protocol yet.</p>
            </div>
            <div class="asset-grid" *ngIf="icons().length">
              <mat-card class="asset-card" *ngFor="let asset of icons()">
                <div class="asset-thumb-container">
                  <img [src]="asset.content" class="asset-thumb icon-thumb" [alt]="asset.name" />
                </div>
                <mat-card-content class="asset-info">
                  <ng-container *ngTemplateOutlet="nameRow; context: { asset: asset }"></ng-container>
                  <span class="asset-path">{{ assetPath(asset) }}</span>
                  <span class="asset-meta">{{ formatSize(asset.size) }}</span>
                </mat-card-content>
                <mat-card-actions class="card-actions">
                  <button mat-icon-button (click)="copyPath(asset)" matTooltip="Copy path">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteAsset(asset)" matTooltip="Delete">
                    <mat-icon>delete</mat-icon>
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- IMAGES -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">photo_library</mat-icon>
            Images ({{ images().length }})
          </ng-template>
          <div class="tab-body">
            <div class="tab-toolbar">
              <span class="tab-desc">Full images used in media flow elements.</span>
              <button mat-raised-button color="primary" (click)="addAsset('image')">
                <mat-icon>add</mat-icon> Add Image
              </button>
            </div>
            <div class="empty-state" *ngIf="!images().length">
              <mat-icon class="empty-icon">photo_library</mat-icon>
              <p>No images for this protocol yet.</p>
            </div>
            <div class="asset-grid" *ngIf="images().length">
              <mat-card class="asset-card" *ngFor="let asset of images()">
                <div class="asset-thumb-container image-thumb-container">
                  <img [src]="asset.content" class="asset-thumb image-thumb" [alt]="asset.name" />
                </div>
                <mat-card-content class="asset-info">
                  <ng-container *ngTemplateOutlet="nameRow; context: { asset: asset }"></ng-container>
                  <span class="asset-path">{{ assetPath(asset) }}</span>
                  <span class="asset-meta">{{ formatSize(asset.size) }}</span>
                </mat-card-content>
                <mat-card-actions class="card-actions">
                  <button mat-icon-button (click)="copyPath(asset)" matTooltip="Copy path">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteAsset(asset)" matTooltip="Delete">
                    <mat-icon>delete</mat-icon>
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- VIDEOS -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">videocam</mat-icon>
            Videos ({{ videos().length }})
          </ng-template>
          <div class="tab-body">
            <div class="tab-toolbar">
              <span class="tab-desc">Video files referenced in media flow elements.</span>
              <button mat-raised-button color="primary" (click)="addAsset('video')">
                <mat-icon>add</mat-icon> Add Video
              </button>
            </div>
            <div class="empty-state" *ngIf="!videos().length">
              <mat-icon class="empty-icon">videocam_off</mat-icon>
              <p>No videos for this protocol yet.</p>
            </div>
            <div class="asset-list" *ngIf="videos().length">
              <mat-card class="asset-row" *ngFor="let asset of videos()">
                <mat-icon class="video-icon">videocam</mat-icon>
                <div class="asset-row-info">
                  <ng-container *ngTemplateOutlet="nameRow; context: { asset: asset }"></ng-container>
                  <span class="asset-path">{{ assetPath(asset) }}</span>
                  <span class="asset-meta">{{ formatSize(asset.size) }}</span>
                </div>
                <div class="asset-row-actions">
                  <button mat-icon-button (click)="copyPath(asset)" matTooltip="Copy path">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteAsset(asset)" matTooltip="Delete">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>

    <!-- Shared name row template -->
    <ng-template #nameRow let-asset="asset">
      <div *ngIf="editingId() !== asset.id" class="asset-name-row">
        <span class="asset-name" (click)="startEdit(asset)" matTooltip="Click to rename">{{ asset.name }}</span>
        <button mat-icon-button (click)="startEdit(asset)"><mat-icon>edit</mat-icon></button>
      </div>
      <div *ngIf="editingId() === asset.id" class="asset-name-edit">
        <mat-form-field appearance="fill" style="flex:1">
          <input matInput [(ngModel)]="editingName" (keyup.enter)="saveEdit(asset)" />
        </mat-form-field>
        <button mat-icon-button color="primary" (click)="saveEdit(asset)"><mat-icon>check</mat-icon></button>
        <button mat-icon-button (click)="cancelEdit()"><mat-icon>close</mat-icon></button>
      </div>
    </ng-template>
  `,
  styleUrl: './assets-manager.component.css',
})
export class AssetsManagerComponent implements OnInit {
  @Input() embedded = false;

  protocols = signal<Protocol[]>([]);
  icons = signal<Asset[]>([]);
  images = signal<Asset[]>([]);
  videos = signal<Asset[]>([]);
  selectedProtocolId = '';
  editingId = signal<string | null>(null);
  editingName = '';

  constructor(
    private assetService: AssetService,
    private protocolFacade: ProtocolFacade,
    private protocolCtx: ProtocolContextService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.protocolFacade.getProtocols$().subscribe(protos => {
      this.protocols.set(protos);
      // When embedded, auto-load the current protocol's assets once protocols are available
      if (this.embedded && !this.selectedProtocolId) {
        const ctx = this.protocolCtx.snapshot();
        if (ctx.id) {
          this.selectedProtocolId = ctx.id;
          this.loadAssetsForProtocol(ctx.id);
        }
      }
    });

    // For standalone page: pre-select if coming from the builder
    if (!this.embedded) {
      const ctx = this.protocolCtx.snapshot();
      if (ctx.id && ctx.repoName) {
        this.selectedProtocolId = ctx.id;
        this.loadAssetsForProtocol(ctx.id);
      }
    }
  }

  onProtocolChange(protocolId: string) {
    this.loadAssetsForProtocol(protocolId);
  }

  private repoNameFor(protocolId: string): string {
    const p = this.protocols().find(p => p.id === protocolId);
    return p ? slugify(p.name) : '';
  }

  private loadAssetsForProtocol(protocolId: string) {
    const protocol = this.protocols().find(p => p.id === protocolId);
    if (!protocol) return;
    // Facade handles the GitHub fetch + in-memory cache population
    this.protocolFacade.ensureAssetsLoaded(protocol.name);
    const repoName = this.repoNameFor(protocolId);
    this.assetService.getAssetsForProtocol$(repoName).subscribe(all => {
      this.icons.set(all.filter(a => a.type === 'icon'));
      this.images.set(all.filter(a => a.type === 'image'));
      this.videos.set(all.filter(a => a.type === 'video'));
    });
  }

  addAsset(type: AssetType) {
    if (!this.selectedProtocolId) return;
    const protocol = this.protocols().find(p => p.id === this.selectedProtocolId);
    if (!protocol) return;
    // When embedded, the builder already set the correct context — no override needed
    if (!this.embedded) {
      this.protocolCtx.setCurrentProtocol(protocol.id, protocol.name);
    }
    this.dialog.open(AddAssetDialogComponent, { data: { type }, width: '440px' })
      .afterClosed().subscribe((asset: Asset | null) => {
        if (asset) this.snackBar.open(`${asset.name} added`, 'OK', { duration: 2000 });
      });
  }

  assetPath(asset: Asset): string { return this.assetService.getAssetPath(asset); }

  startEdit(asset: Asset) { this.editingId.set(asset.id); this.editingName = asset.name; }

  async saveEdit(asset: Asset) {
    const name = this.editingName.trim();
    if (name && name !== asset.name) {
      await this.assetService.updateAssetName(asset, name);
      this.snackBar.open('Renamed', 'OK', { duration: 1500 });
    }
    this.cancelEdit();
  }

  cancelEdit() { this.editingId.set(null); this.editingName = ''; }

  async deleteAsset(asset: Asset) {
    if (!confirm(`Delete "${asset.name}"?`)) return;
    await this.assetService.deleteAsset(asset);
    this.snackBar.open('Deleted', 'OK', { duration: 2000 });
  }

  copyPath(asset: Asset) {
    navigator.clipboard.writeText(this.assetPath(asset)).then(() => {
      this.snackBar.open(`Copied: ${this.assetPath(asset)}`, 'OK', { duration: 1500 });
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}

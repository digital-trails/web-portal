import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Asset, AssetService, AssetType } from '../services/asset.service';
import { ProtocolContextService } from '../services/protocol-context.service';

export interface AddAssetDialogData {
  type: AssetType;
}

@Component({
  selector: 'app-add-asset-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatIconModule, MatProgressBarModule,
  ],
  template: `
    <h2 mat-dialog-title>Add {{ typeName }}</h2>
    <mat-dialog-content class="dialog-content">
      <mat-form-field appearance="fill" style="width: 100%">
        <mat-label>Asset Name</mat-label>
        <input matInput [(ngModel)]="name" placeholder="e.g. menu_home" />
        <mat-hint>Used as the filename in the repo (no spaces or special chars)</mat-hint>
      </mat-form-field>

      <div class="file-row">
        <button mat-stroked-button type="button" (click)="fileInput.click()">
          <mat-icon>upload_file</mat-icon> Choose File
        </button>
        <span class="file-name">{{ fileName || 'No file chosen' }}</span>
        <input #fileInput type="file" [accept]="acceptTypes" hidden (change)="onFileSelected($event)" />
      </div>

      <div *ngIf="preview" class="preview-container">
        <img *ngIf="data.type !== 'video'" [src]="preview"
             style="max-height:120px; max-width:100%; border-radius:4px; margin-top:12px;" />
        <video *ngIf="data.type === 'video'" [src]="preview" controls
               style="max-height:120px; max-width:100%; margin-top:12px;"></video>
      </div>

      <mat-progress-bar *ngIf="saving" mode="indeterminate" style="margin-top:12px;"></mat-progress-bar>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!canSave() || saving" (click)="save()">
        Add Asset
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content { min-width: 360px; padding-top: 8px; }
    .file-row { display: flex; align-items: center; gap: 12px; margin-top: 16px; }
    .file-name { font-size: 0.875rem; opacity: 0.7; }
  `],
})
export class AddAssetDialogComponent {
  name = '';
  fileName = '';
  preview = '';
  mimeType = '';
  fileSize = 0;
  saving = false;
  private fileContent = '';

  get typeName(): string {
    return { icon: 'Icon', image: 'Image', video: 'Video' }[this.data.type] ?? this.data.type;
  }

  get acceptTypes(): string {
    if (this.data.type === 'icon') return 'image/png,image/svg+xml,image/jpeg,image/webp';
    if (this.data.type === 'image') return 'image/*';
    return 'video/*';
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AddAssetDialogData,
    private dialogRef: MatDialogRef<AddAssetDialogComponent>,
    private assetService: AssetService,
    private protocolCtx: ProtocolContextService,
  ) {}

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.fileName = file.name;
    this.mimeType = file.type;
    this.fileSize = file.size;
    if (!this.name) {
      this.name = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      this.fileContent = e.target?.result as string;
      this.preview = this.fileContent;
    };
    reader.readAsDataURL(file);
  }

  canSave(): boolean {
    return !!(this.name.trim() && this.fileContent);
  }

  async save() {
    if (!this.canSave()) return;
    this.saving = true;
    try {
      const protocolId = this.protocolCtx.getCurrentRepoName() ?? '';
      const asset = await this.assetService.addAsset({
        protocolId,
        name: this.name.trim(),
        filename: this.fileName,
        type: this.data.type,
        mimeType: this.mimeType,
        content: this.fileContent,
        size: this.fileSize,
      });
      this.dialogRef.close(asset);
    } catch (e) {
      console.error('Failed to save asset:', e);
      this.saving = false;
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }
}

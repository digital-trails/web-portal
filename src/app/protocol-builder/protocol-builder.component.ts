import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  angularMaterialRenderers,
  ArrayLayoutRenderer,
} from '@jsonforms/angular-material';
import { isObjectArrayControl, rankWith } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { AssetsManagerComponent } from '../assets-manager/assets-manager.component';
import protocolSchema from '../store/protocol/protocol.schema.json';
import uischema from '../store/protocol/protocol.uischema.json';
import { ProtocolFacade } from '../store/protocol/protocol.facade';
import { Protocol, ProtocolStatus } from '../models/protocol';
import {
  FlowSelectRenderer, flowSelectTester,
  TimeControlRenderer, timeControlTester,
  TimespanRenderer, timespanTester,
  IconSelectRenderer, iconSelectTester,
  MediaSelectRenderer, mediaSelectTester,
} from './renderers';
import { FlowOptionsService } from './flow-options.service';
import { MobilePreviewComponent } from './mobile-preview.component';
import { GITHUB_ORG } from '../services/github.service';
import { ProtocolContextService } from '../services/protocol-context.service';

const DICT_KEYS = ['Surveys', 'Reminders', 'Devices', 'Goals', 'Jobs', 'Notifications'] as const;

const STATUS_CONFIG: Record<ProtocolStatus, { label: string; color: string; icon: string }> = {
  draft: { label: 'Draft', color: '#757575', icon: 'description' },
  running: { label: 'Running', color: '#2e7d32', icon: 'play_arrow' },
  paused: { label: 'Paused', color: '#f57c00', icon: 'pause' },
  completed: { label: 'Completed', color: '#1565c0', icon: 'check_circle' },
  archived: { label: 'Archived', color: '#9e9e9e', icon: 'archive' },
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function autoGenerateFlowPaths(data: Record<string, unknown>): Record<string, unknown> {
  const flows = data['flows'] as any[] | undefined;
  if (!Array.isArray(flows)) return data;

  let changed = false;
  const updated = flows.map(flow => {
    if (flow.name && !flow.path) {
      changed = true;
      return { ...flow, path: `flow://flows/${slugify(flow.name)}` };
    }
    return flow;
  });

  return changed ? { ...data, flows: updated } : data;
}

function dictToArray(dict: Record<string, any> | undefined): any[] {
  if (!dict || typeof dict !== 'object') return [];
  return Object.entries(dict).map(([key, value]) => ({ id: key, ...value }));
}

function arrayToDict(arr: any[] | undefined): Record<string, any> {
  if (!Array.isArray(arr)) return {};
  const dict: Record<string, any> = {};
  for (const item of arr) {
    const { id, ...rest } = item;
    if (id) dict[id] = rest;
  }
  return dict;
}

function toFormData(raw: Record<string, unknown>): Record<string, unknown> {
  const data = { ...raw };
  for (const key of DICT_KEYS) {
    if (data[key] && !Array.isArray(data[key])) {
      data[key] = dictToArray(data[key] as Record<string, any>);
    }
  }
  return data;
}

function toProtocolData(formData: Record<string, unknown>): Record<string, unknown> {
  const data = { ...formData };
  for (const key of DICT_KEYS) {
    if (Array.isArray(data[key])) {
      data[key] = arrayToDict(data[key] as any[]);
    }
  }
  return data;
}

@Component({
  selector: 'app-protocol-builder',
  standalone: true,
  template: `
    <div class="protocol-builder">
      <div class="builder-toolbar">
        <button mat-icon-button (click)="goBack()" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>

        <input
          class="protocol-name-input"
          [value]="protocolName()"
          (input)="onNameChange($event)"
          placeholder="Protocol name"
          [disabled]="isReadOnly()"
        />

        <span class="status-badge" *ngIf="protocol()"
              [style.background]="statusConfig[protocol()!.status].color">
          <mat-icon class="status-icon">{{ statusConfig[protocol()!.status].icon }}</mat-icon>
          {{ statusConfig[protocol()!.status].label }}
        </span>

        <div class="toolbar-spacer"></div>

        <button mat-icon-button [matMenuTriggerFor]="statusMenu"
                *ngIf="protocol()" matTooltip="Change status">
          <mat-icon>swap_horiz</mat-icon>
        </button>
        <mat-menu #statusMenu="matMenu">
          <button mat-menu-item (click)="setStatus('draft')"
                  *ngIf="canTransitionTo('draft')">
            <mat-icon>description</mat-icon> Move to Draft
          </button>
          <button mat-menu-item (click)="setStatus('running')"
                  *ngIf="canTransitionTo('running')">
            <mat-icon>play_arrow</mat-icon> Start Running
          </button>
          <button mat-menu-item (click)="setStatus('paused')"
                  *ngIf="canTransitionTo('paused')">
            <mat-icon>pause</mat-icon> Pause
          </button>
          <button mat-menu-item (click)="setStatus('completed')"
                  *ngIf="canTransitionTo('completed')">
            <mat-icon>check_circle</mat-icon> Mark Completed
          </button>
          <button mat-menu-item (click)="setStatus('archived')"
                  *ngIf="canTransitionTo('archived')">
            <mat-icon>archive</mat-icon> Archive
          </button>
        </mat-menu>

        <a mat-icon-button matTooltip="View on GitHub" [href]="repoUrl()" target="_blank">
          <mat-icon>cloud</mat-icon>
        </a>

        <button
          mat-raised-button
          color="primary"
          [disabled]="errors().length > 0 || isReadOnly() || isSaving()"
          (click)="save()"
        >
          <mat-spinner *ngIf="isSaving()" diameter="16" style="display:inline-block;margin-right:6px;"></mat-spinner>
          <mat-icon *ngIf="!isSaving()">save</mat-icon>
          {{ isSaving() ? 'Saving…' : 'Save' }}
        </button>
      </div>

      <div class="readonly-banner" *ngIf="isReadOnly()">
        This protocol is {{ protocol()?.status }} and cannot be edited.
      </div>

      <mat-tab-group animationDuration="150ms" class="builder-tabs">
        <mat-tab label="Protocol">
          <div class="builder-content">
            <div class="form-panel">
              <jsonforms
                [data]="data()"
                [schema]="schema"
                [uischema]="uischema"
                [renderers]="renderers"
                [readonly]="isReadOnly()"
                (dataChange)="onDataChange($event)"
                (errors)="onErrors($event)"
              ></jsonforms>

              <div class="builder-footer" *ngIf="errors().length > 0">
                <p class="error-count">{{ errors().length }} validation issue(s)</p>
              </div>
            </div>

            <app-mobile-preview class="preview-panel" [data]="data()" />
          </div>
        </mat-tab>

        <mat-tab label="Assets">
          <app-assets-manager [embedded]="true" />
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styleUrl: './protocol-builder.component.css',
  imports: [
    CommonModule,
    FormsModule,
    JsonForms,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MobilePreviewComponent,
    AssetsManagerComponent,
  ],
  providers: [FlowOptionsService],
})
export class ProtocolBuilderComponent implements OnInit, OnDestroy {
  schema = protocolSchema as any;
  renderers = [
    ...angularMaterialRenderers,
    { tester: rankWith(5, isObjectArrayControl), renderer: ArrayLayoutRenderer },
    { tester: flowSelectTester, renderer: FlowSelectRenderer },
    { tester: timeControlTester, renderer: TimeControlRenderer },
    { tester: timespanTester, renderer: TimespanRenderer },
    { tester: iconSelectTester, renderer: IconSelectRenderer },
    { tester: mediaSelectTester, renderer: MediaSelectRenderer },
  ];
  uischema = uischema;
  statusConfig = STATUS_CONFIG;

  data = signal<Record<string, unknown>>({});
  errors = signal<unknown[]>([]);
  protocol = signal<Protocol | null>(null);
  protocolName = signal('');
  isSaving = signal(false);

  private protocolId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private protocolFacade: ProtocolFacade,
    private snackBar: MatSnackBar,
    private flowOptions: FlowOptionsService,
    private protocolCtx: ProtocolContextService,
  ) {}

  ngOnInit() {
    this.protocolId = this.route.snapshot.paramMap.get('id');
    this.protocolCtx.setCurrentProtocol(this.protocolId);
    if (this.protocolId) {
      this.protocolFacade.getProtocol$(this.protocolId).subscribe(p => {
        if (!p) {
          this.router.navigate(['/protocol-builder']);
          return;
        }
        this.protocol.set(p);
        this.protocolName.set(p.name);
        this.protocolCtx.setCurrentProtocol(this.protocolId, p.name);
        // Asset loading is handled inside getProtocol$ via the facade
        const formData = toFormData(p.data);
        this.data.set(formData);
        this.updateFlowOptions(formData);
      });
    }
  }

  isReadOnly(): boolean {
    const p = this.protocol();
    return !!p && (p.status === 'archived' || p.status === 'completed');
  }

  repoUrl(): string {
    return `https://github.com/${GITHUB_ORG}/${slugify(this.protocolName() || 'untitled')}`;
  }

  onNameChange(event: Event) {
    this.protocolName.set((event.target as HTMLInputElement).value);
  }

  onDataChange(updated: Record<string, unknown>) {
    const withPaths = autoGenerateFlowPaths(updated);
    this.data.set(withPaths);
    this.updateFlowOptions(withPaths);
  }

  onErrors(validationErrors: unknown[]) {
    this.errors.set(validationErrors ?? []);
  }

  save() {
    const p = this.protocol();
    if (!p) return;

    const name = this.protocolName() || 'Untitled Protocol';
    const updated: Protocol = { ...p, name, data: toProtocolData(this.data()) };
    this.isSaving.set(true);
    this.protocolFacade.saveProtocol(updated).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.snackBar.open('Protocol saved and pushed to GitHub', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.isSaving.set(false);
        const msg = err?.error?.message ?? err?.message ?? 'Unknown error';
        this.snackBar.open(`Saved locally. GitHub push failed: ${msg}`, 'Dismiss', { duration: 6000 });
      },
    });
  }

  setStatus(status: ProtocolStatus) {
    const p = this.protocol();
    if (!p) return;
    this.protocolFacade.setStatus(p.id, status);
    this.snackBar.open(`Status changed to ${STATUS_CONFIG[status].label}`, 'OK', { duration: 2000 });
  }

  canTransitionTo(target: ProtocolStatus): boolean {
    const p = this.protocol();
    if (!p || p.status === target) return false;

    const transitions: Record<ProtocolStatus, ProtocolStatus[]> = {
      draft: ['running', 'archived'],
      running: ['paused', 'completed'],
      paused: ['running', 'draft', 'completed', 'archived'],
      completed: ['archived', 'draft'],
      archived: ['draft'],
    };
    return transitions[p.status].includes(target);
  }

  ngOnDestroy() {
    this.protocolCtx.setCurrentProtocol(null);
  }

  goBack() {
    this.router.navigate(['/protocol-builder']);
  }

  private updateFlowOptions(data: Record<string, unknown>): void {
    const flows = data['flows'] as any[] | undefined;
    this.flowOptions.options = (flows ?? [])
      .filter((f: any) => f.path)
      .map((f: any) => ({ value: f.path as string, label: (f.name || f.path) as string }));
  }
}

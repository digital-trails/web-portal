import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonFormsAngularService, JsonFormsControl } from '@jsonforms/angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import {
  and,
  formatIs,
  rankWith,
  StatePropsOfControl,
  Tester,
  uiTypeIs,
} from '@jsonforms/core';
import { FlowOptionsService } from './flow-options.service';

const hasFlowSelectOption: Tester = (uischema: any) =>
  !!uischema?.options?.flowSelect;

type UrlType = 'none' | 'flow' | 'url';

@Component({
  selector: 'flow-select-renderer',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatInputModule],
  template: `
    <div *ngIf="!hidden" style="display: flex; gap: 12px; align-items: flex-start;">
      <mat-form-field appearance="fill" style="width: 180px; flex-shrink: 0;">
        <mat-label>{{ label }} Type</mat-label>
        <mat-select [value]="urlType" (selectionChange)="onTypeChange($event.value)"
                    [disabled]="!enabled">
          <mat-option value="none">None</mat-option>
          <mat-option value="flow">Flow</mat-option>
          <mat-option value="url">Web URL</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="fill" style="flex: 1;" *ngIf="urlType === 'flow'">
        <mat-label>{{ label }}</mat-label>
        <mat-select [value]="data" (selectionChange)="onChange($event)"
                    [disabled]="!enabled || selectOptions.length === 0">
          <mat-option *ngFor="let opt of selectOptions" [value]="opt.value">
            {{ opt.label }}
          </mat-option>
        </mat-select>
        <mat-hint *ngIf="selectOptions.length === 0">
          No flows available — add a flow in the Flows tab first
        </mat-hint>
      </mat-form-field>

      <mat-form-field appearance="fill" style="flex: 1;" *ngIf="urlType === 'url'">
        <mat-label>{{ label }}</mat-label>
        <input matInput [value]="data || ''" (input)="onUrlInput($event)"
               [disabled]="!enabled" placeholder="https://..." />
        <mat-hint *ngIf="shouldShowUnfocusedDescription()">{{ description }}</mat-hint>
      </mat-form-field>

      <mat-error *ngIf="error" style="flex: 1; padding-top: 8px;">{{ error }}</mat-error>
    </div>
  `,
})
export class FlowSelectRenderer extends JsonFormsControl {
  selectOptions: { value: string; label: string }[] = [];
  urlType: UrlType = 'none';

  constructor(
    jsonformsService: JsonFormsAngularService,
    private flowOptions: FlowOptionsService,
  ) {
    super(jsonformsService);
  }

  override mapAdditionalProps(_props: StatePropsOfControl) {
    this.selectOptions = this.flowOptions.options;
    this.urlType = this.detectType(this.data);
  }

  private detectType(value: any): UrlType {
    if (!value) return 'none';
    const s = String(value);
    if (s.startsWith('flow://') || s.startsWith('navpage://') || s.startsWith('navmodal://')) return 'flow';
    return 'url';
  }

  onTypeChange(type: UrlType) {
    this.urlType = type;
    if (type === 'none') {
      this.onChange({ value: undefined });
    }
  }

  onUrlInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.onChange({ value: value || undefined });
  }
}

export const flowSelectTester = rankWith(6, and(uiTypeIs('Control'), hasFlowSelectOption));

@Component({
  selector: 'time-control-renderer',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="fill" style="width: 100%" *ngIf="!hidden">
      <mat-label>{{ label }}</mat-label>
      <input matInput type="time"
             [value]="timeValue"
             (change)="onTimeChange($event)"
             [disabled]="!enabled"
             [id]="id" />
      <mat-hint *ngIf="shouldShowUnfocusedDescription()">{{ description }}</mat-hint>
      <mat-error *ngIf="error">{{ error }}</mat-error>
    </mat-form-field>
  `,
  styles: [`
    input[type="time"]::-webkit-calendar-picker-indicator {
      filter: invert(0.8);
      cursor: pointer;
    }
  `],
})
export class TimeControlRenderer extends JsonFormsControl {
  timeValue = '';

  constructor(jsonformsService: JsonFormsAngularService) {
    super(jsonformsService);
  }

  override mapAdditionalProps(props: StatePropsOfControl) {
    if (!props.data) {
      this.timeValue = '';
      return;
    }
    const parts = String(props.data).split(':');
    this.timeValue = parts.length >= 2
      ? `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
      : '';
  }

  onTimeChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.onChange({ value: value ? `${value}:00` : undefined });
  }
}

export const timeControlTester = rankWith(5, and(uiTypeIs('Control'), formatIs('time')));

interface TimespanParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function parseTimespan(value: string | null | undefined): TimespanParts {
  if (!value) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const s = String(value);
  let days = 0;
  let timePart = s;
  if (s.includes('.')) {
    const dotIdx = s.indexOf('.');
    days = parseInt(s.substring(0, dotIdx), 10) || 0;
    timePart = s.substring(dotIdx + 1);
  }
  const parts = timePart.split(':');
  return {
    days,
    hours: parseInt(parts[0], 10) || 0,
    minutes: parseInt(parts[1], 10) || 0,
    seconds: parseInt(parts[2], 10) || 0,
  };
}

function formatTimespan(p: TimespanParts): string | undefined {
  if (!p.days && !p.hours && !p.minutes && !p.seconds) return undefined;
  const hh = String(p.hours).padStart(2, '0');
  const mm = String(p.minutes).padStart(2, '0');
  const ss = String(p.seconds).padStart(2, '0');
  return p.days ? `${p.days}.${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
}

@Component({
  selector: 'timespan-renderer',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule],
  template: `
    <div *ngIf="!hidden" class="timespan-row">
      <span class="timespan-label">{{ label }}</span>
      <mat-form-field appearance="fill" class="timespan-field">
        <mat-label>Days</mat-label>
        <input matInput type="number" min="0"
               [value]="parts.days" (input)="onPartChange('days', $event)"
               [disabled]="!enabled" />
      </mat-form-field>
      <mat-form-field appearance="fill" class="timespan-field">
        <mat-label>Hours</mat-label>
        <input matInput type="number" min="0" max="23"
               [value]="parts.hours" (input)="onPartChange('hours', $event)"
               [disabled]="!enabled" />
      </mat-form-field>
      <mat-form-field appearance="fill" class="timespan-field">
        <mat-label>Minutes</mat-label>
        <input matInput type="number" min="0" max="59"
               [value]="parts.minutes" (input)="onPartChange('minutes', $event)"
               [disabled]="!enabled" />
      </mat-form-field>
      <mat-form-field appearance="fill" class="timespan-field">
        <mat-label>Seconds</mat-label>
        <input matInput type="number" min="0" max="59"
               [value]="parts.seconds" (input)="onPartChange('seconds', $event)"
               [disabled]="!enabled" />
      </mat-form-field>
    </div>
  `,
  styles: [`
    .timespan-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .timespan-label {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.7);
      min-width: 80px;
      flex-shrink: 0;
    }
    .timespan-field {
      flex: 1;
      max-width: 100px;
    }
    input[type="number"]::-webkit-inner-spin-button {
      filter: invert(0.8);
    }
  `],
})
export class TimespanRenderer extends JsonFormsControl {
  parts: TimespanParts = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  constructor(jsonformsService: JsonFormsAngularService) {
    super(jsonformsService);
  }

  override mapAdditionalProps(props: StatePropsOfControl) {
    this.parts = parseTimespan(props.data);
  }

  onPartChange(field: keyof TimespanParts, event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10) || 0;
    this.parts = { ...this.parts, [field]: Math.max(0, val) };
    this.onChange({ value: formatTimespan(this.parts) });
  }
}

export const timespanTester = rankWith(5, and(uiTypeIs('Control'), formatIs('timespan')));


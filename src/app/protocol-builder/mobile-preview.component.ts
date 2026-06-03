import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import viewDefs from '../store/protocol/protocol.views.json';

const DEFAULT_THEME: Record<string, string> = {
  Accent: '#333333',
  Text: '#ffffff',
  Primary: '#6200ee',
  Secondary: '#2a2a2a',
  SecondaryButton: '#444444',
  Destructive: '#cf6679',
  Success: '#03dac6',
};

@Component({
  selector: 'app-mobile-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mobile-preview-panel">
      <div class="preview-controls">
        <select
          class="mode-select"
          [value]="previewMode()"
          (change)="onModeChange($event)"
        >
          <option value="home">Home Screen</option>
          <option
            *ngFor="let flow of flows(); let i = index"
            [value]="'flow:' + i"
          >
            {{ flow.name || flow.path || 'Flow ' + (i + 1) }}
          </option>
        </select>
      </div>

      <div class="phone-frame">
        <div class="phone-notch"></div>
        <div class="phone-status-bar">
          <span>9:41</span>
          <span class="status-icons">
            <span class="material-icons sb-icon">signal_cellular_alt</span>
            <span class="material-icons sb-icon">wifi</span>
            <span class="material-icons sb-icon">battery_full</span>
          </span>
        </div>

        <div class="phone-screen">
          <!-- Home Screen mode -->
          <ng-container *ngIf="previewMode() === 'home'">
            <div class="screen-title" *ngIf="homeTitle()">
              {{ homeTitle() }}
            </div>
            <div class="home-elements-stack">
              <ng-container *ngFor="let el of homeElements()">
                <ng-container
                  *ngTemplateOutlet="
                    elementRenderer;
                    context: { $implicit: el, defs: viewDefs.elements }
                  "
                ></ng-container>
              </ng-container>
            </div>
            <div *ngIf="homeElements().length === 0" class="empty-placeholder">
              No home elements defined
            </div>
          </ng-container>

          <!-- Flow mode -->
          <ng-container *ngIf="previewMode() !== 'home'">
            <!-- Flow header bar -->
            <div class="flow-header">
              <span class="material-icons flow-header-icon" *ngIf="currentPage() > 0">arrow_back_ios</span>
              <span class="flow-header-icon" *ngIf="currentPage() === 0" style="width:20px"></span>
              <div class="flow-header-center">
                <img
                  *ngIf="currentPageData()?.header_icon && isImgSrc(currentPageData()?.header_icon)"
                  [src]="currentPageData()?.header_icon"
                  class="flow-header-img"
                />
                <span
                  *ngIf="currentPageData()?.header_icon && !isImgSrc(currentPageData()?.header_icon)"
                  class="material-icons" style="font-size:20px"
                >{{ currentPageData()?.header_icon }}</span>
                <span class="flow-header-title">
                  {{ currentPageData()?.header_text || currentFlow()?.name || 'Flow' }}
                </span>
                <span
                  *ngIf="currentPageData()?.header_info"
                  class="material-icons flow-info-icon"
                >info_outline</span>
              </div>
              <span class="material-icons flow-header-icon">close</span>
            </div>

            <div class="flow-separator"></div>

            <!-- Flow page elements -->
            <div class="flow-elements-stack">
              <ng-container *ngFor="let el of currentPageElements()">
                <ng-container
                  *ngTemplateOutlet="
                    elementRenderer;
                    context: {
                      $implicit: el,
                      defs: viewDefs.flowElements
                    }
                  "
                ></ng-container>
              </ng-container>
            </div>

            <div
              *ngIf="currentPageElements().length === 0"
              class="empty-placeholder"
            >
              {{ totalPages() === 0 ? 'No pages in this flow' : 'Empty page' }}
            </div>

            <!-- Next/Done button -->
            <div class="flow-bottom-btn" *ngIf="totalPages() > 0">
              {{ currentPage() >= totalPages() - 1 ? 'Done' : 'Next' }}
            </div>
          </ng-container>
        </div>

        <div class="phone-home-bar"></div>
      </div>

      <!-- Page navigation for flow mode -->
      <div
        class="page-nav"
        *ngIf="previewMode() !== 'home' && totalPages() > 1"
      >
        <button
          class="nav-btn"
          (click)="prevPage()"
          [disabled]="currentPage() === 0"
        >
          <span class="material-icons">chevron_left</span>
        </button>
        <span class="page-indicator">
          Page {{ currentPage() + 1 }} / {{ totalPages() }}
        </span>
        <button
          class="nav-btn"
          (click)="nextPage()"
          [disabled]="currentPage() >= totalPages() - 1"
        >
          <span class="material-icons">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- Element renderer: dispatches by type to view definition -->
    <ng-template #elementRenderer let-element let-defs="defs">
      <ng-container *ngIf="getViewDef(element?.type, defs) as def">
        <div class="element-wrapper">
          <ng-container
            *ngTemplateOutlet="
              viewNode;
              context: { $implicit: def, ctx: element }
            "
          ></ng-container>
        </div>
      </ng-container>
    </ng-template>

    <!-- Recursive view node template -->
    <ng-template #viewNode let-node let-ctx="ctx">
      <!-- Layout node -->
      <div
        *ngIf="node.layout"
        [ngStyle]="getLayoutStyle(node)"
        [class]="'layout-' + node.layout"
      >
        <ng-container *ngFor="let slot of node.slots || []">
          <ng-container
            *ngTemplateOutlet="
              viewNode;
              context: { $implicit: slot, ctx: ctx }
            "
          ></ng-container>
        </ng-container>

        <ng-container *ngIf="node.items">
          <ng-container
            *ngFor="let item of resolveArray(node.items.from, ctx)"
          >
            <ng-container
              *ngTemplateOutlet="
                viewNode;
                context: { $implicit: node.items.item, ctx: wrapPrimitive(item) }
              "
            ></ng-container>
          </ng-container>
        </ng-container>

        <ng-container *ngIf="node.children?.recurse">
          <ng-container
            *ngFor="let child of resolveArray(node.children.from, ctx)"
          >
            <ng-container
              *ngTemplateOutlet="
                elementRenderer;
                context: { $implicit: child, defs: viewDefs.elements }
              "
            ></ng-container>
          </ng-container>
        </ng-container>
      </div>

      <!-- Text leaf -->
      <span
        *ngIf="node.text && !node.layout"
        [ngStyle]="getTextStyle(node)"
        class="preview-text"
      >
        {{ resolveText(node.text, ctx) }}
      </span>

      <!-- Icon leaf: image URL -->
      <img
        *ngIf="node.icon && !node.text && !node.layout && isImageValue(node.icon, ctx)"
        [src]="resolveField(ctx, node.icon.from)"
        [ngStyle]="getIconStyle(node)"
        class="preview-img"
      />
      <!-- Icon leaf: material icon name -->
      <span
        *ngIf="node.icon && !node.text && !node.layout && !isImageValue(node.icon, ctx)"
        [ngStyle]="getIconStyle(node)"
        class="preview-icon material-icons"
      >
        {{ resolveIcon(node.icon, ctx) }}
      </span>
    </ng-template>
  `,
  styles: [
    `
      .mobile-preview-panel {
        width: 370px;
        flex-shrink: 0;
      }

      .preview-controls {
        margin-bottom: 12px;
      }

      .mode-select {
        width: 100%;
        padding: 8px 12px;
        background: #2a2a2a;
        color: #e0e0e0;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 6px;
        font-size: 0.875rem;
        outline: none;
        cursor: pointer;
      }
      .mode-select:focus {
        border-color: #64b5f6;
      }
      .mode-select option {
        background: #2a2a2a;
        color: #e0e0e0;
      }

      /* Phone frame */
      .phone-frame {
        background: #111;
        border-radius: 36px;
        padding: 0 10px 10px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5),
          inset 0 0 0 2px #333;
        overflow: hidden;
      }

      .phone-notch {
        width: 100px;
        height: 22px;
        background: #111;
        border-radius: 0 0 14px 14px;
        margin: 0 auto;
      }

      .phone-status-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2px 16px 6px;
        font-size: 12px;
        font-weight: 600;
        color: #fff;
      }
      .status-icons {
        display: flex;
        gap: 4px;
        align-items: center;
      }
      .sb-icon {
        font-size: 14px;
      }

      .phone-screen {
        background: #121212;
        border-radius: 4px;
        overflow-y: auto;
        height: 560px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
      }
      .phone-screen::-webkit-scrollbar {
        width: 4px;
      }
      .phone-screen::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
      }

      .phone-home-bar {
        height: 5px;
        width: 100px;
        margin: 8px auto 4px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
      }

      /* Screen content */
      .screen-title {
        font-size: 20px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 12px;
      }

      .home-elements-stack {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .element-wrapper {
        width: 100%;
      }

      .empty-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 120px;
        color: rgba(255, 255, 255, 0.3);
        font-size: 13px;
        font-style: italic;
      }

      /* Flow header */
      .flow-header {
        display: flex;
        align-items: center;
        padding: 6px 0 10px;
        gap: 4px;
      }
      .flow-header-icon {
        font-size: 20px;
        color: #fff;
        opacity: 0.7;
        flex-shrink: 0;
      }
      .flow-header-center {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-width: 0;
      }
      .flow-header-title {
        font-size: 18px;
        font-weight: 600;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .flow-header-img {
        width: 24px;
        height: 24px;
        object-fit: contain;
        border-radius: 4px;
      }
      .flow-info-icon {
        font-size: 18px;
        color: #fff;
        opacity: 0.5;
      }
      .flow-separator {
        height: 2px;
        background: rgba(255,255,255,0.08);
        margin-bottom: 8px;
      }

      .flow-elements-stack {
        display: flex;
        flex-direction: column;
        gap: 25px;
        flex: 1;
      }

      .flow-bottom-btn {
        margin-top: auto;
        padding: 14px;
        text-align: center;
        font-size: 14px;
        font-weight: 600;
        color: #fff;
        background: #6200ee;
        border-radius: 7px;
        margin-top: 16px;
      }

      /* Layout classes */
      .layout-vstack {
        display: flex;
        flex-direction: column;
      }
      .layout-hstack {
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      .layout-container {
        display: flex;
        flex-direction: column;
      }
      .layout-grid {
        display: grid;
      }
      .layout-hscroll {
        display: flex;
        flex-direction: row;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .layout-hscroll::-webkit-scrollbar {
        display: none;
      }
      .layout-hscroll > * {
        flex-shrink: 0;
      }

      /* Text & icon */
      .preview-text {
        display: block;
        word-wrap: break-word;
        line-height: 1.4;
      }
      .preview-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.6;
      }
      .preview-img {
        object-fit: contain;
        border-radius: 4px;
      }

      /* Page navigation */
      .page-nav {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-top: 12px;
      }
      .nav-btn {
        background: #2a2a2a;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #e0e0e0;
        cursor: pointer;
        padding: 0;
      }
      .nav-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      .nav-btn .material-icons {
        font-size: 20px;
      }
      .page-indicator {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);
      }
    `,
  ],
})
export class MobilePreviewComponent {
  data = input.required<Record<string, unknown>>();

  viewDefs = viewDefs;
  private tokens = viewDefs.tokens as Record<string, number | string>;

  previewMode = signal<string>('home');
  currentPage = signal(0);

  private theme = computed<Record<string, string>>(() => {
    const d = this.data();
    const td = (d?.['theme_dark'] ?? d?.['themes'] ?? {}) as Record<
      string,
      string
    >;
    return { ...DEFAULT_THEME, ...td };
  });

  flows = computed(() => {
    const d = this.data();
    return (d?.['flows'] as any[]) ?? [];
  });

  homeTitle = computed(() => {
    const home = this.data()?.['home'] as any;
    return home?.Title ?? '';
  });

  homeElements = computed(() => {
    const home = this.data()?.['home'] as any;
    return (home?.Elements as any[]) ?? [];
  });

  currentFlow = computed(() => {
    const mode = this.previewMode();
    if (!mode.startsWith('flow:')) return null;
    const idx = parseInt(mode.split(':')[1], 10);
    return this.flows()[idx] ?? null;
  });

  currentFlowPages = computed(() => {
    return (this.currentFlow()?.pages as any[]) ?? [];
  });

  totalPages = computed(() => this.currentFlowPages().length);

  currentPageData = computed(() => {
    return this.currentFlowPages()[this.currentPage()] ?? null;
  });

  currentPageElements = computed(() => {
    return (this.currentPageData()?.elements as any[]) ?? [];
  });

  onModeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.previewMode.set(value);
    this.currentPage.set(0);
  }

  prevPage() {
    this.currentPage.update((p) => Math.max(0, p - 1));
  }

  nextPage() {
    this.currentPage.update((p) =>
      Math.min(this.totalPages() - 1, p + 1),
    );
  }

  getViewDef(type: string | undefined, defs: Record<string, any>): any {
    if (!type || !defs) return null;
    return defs[type] ?? null;
  }

  isImgSrc(val: any): boolean {
    if (!val || typeof val !== 'string') return false;
    return val.startsWith('data:image') || val.startsWith('http') || /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(val);
  }

  // --- Style resolution ---

  getLayoutStyle(node: any): Record<string, string> {
    const style: Record<string, string> = {};
    const s = node.style || {};

    if (s.padding != null) style['padding'] = this.px(s.padding);
    if (s.gap != null) style['gap'] = this.px(s.gap);
    if (s.background) style['background-color'] = String(this.resolve(s.background));
    if (s.radius != null) style['border-radius'] = this.px(s.radius);
    if (s.flex != null) style['flex'] = String(s.flex);
    if (s.height != null) style['height'] = this.px(s.height);
    if (s.minHeight != null) style['min-height'] = this.px(s.minHeight);
    if (s.width != null) {
      const w = this.resolve(s.width);
      style['width'] = typeof w === 'number' ? w + 'px' : String(w);
    }
    if (s.alignItems) style['align-items'] = s.alignItems;
    if (s.justifyContent) style['justify-content'] = s.justifyContent;
    if (s.opacity != null) style['opacity'] = String(s.opacity);
    if (s.borderWidth != null && s.borderColor) {
      style['border'] = `${this.px(s.borderWidth)} solid ${String(this.resolve(s.borderColor))}`;
      style['border-color'] = String(this.resolve(s.borderColor));
      style['border-style'] = 'solid';
      style['border-width'] = this.px(s.borderWidth);
    }

    if (node.layout === 'grid' && node.columns) {
      style['grid-template-columns'] = `repeat(${node.columns}, 1fr)`;
    }

    return style;
  }

  getTextStyle(node: any): Record<string, string> {
    const style: Record<string, string> = {};
    const s = node.style || {};
    if (s.fontSize != null) style['font-size'] = this.px(s.fontSize);
    if (s.color) style['color'] = String(this.resolve(s.color));
    if (s.flex != null) style['flex'] = String(s.flex);
    if (s.fontWeight) style['font-weight'] = s.fontWeight;
    if (s.textAlign) style['text-align'] = s.textAlign;
    if (s.opacity != null) style['opacity'] = String(s.opacity);
    if (s.letterSpacing) style['letter-spacing'] = s.letterSpacing;
    return style;
  }

  getIconStyle(node: any): Record<string, string> {
    const style: Record<string, string> = {};
    const s = node.style || {};
    if (s.width != null) {
      const w = this.resolve(s.width);
      const px = typeof w === 'number' ? w + 'px' : String(w);
      style['font-size'] = px;
      style['width'] = px;
      style['height'] = px;
    }
    if (s.color) style['color'] = String(this.resolve(s.color));
    if (s.opacity != null) style['opacity'] = String(s.opacity);
    return style;
  }

  // --- Data resolution ---

  resolveText(
    ref: { from?: string; literal?: string } | undefined,
    ctx: any,
  ): string {
    if (!ref) return '';
    if (ref.literal) return ref.literal;
    if (ref.from) {
      const val = this.resolveField(ctx, ref.from);
      if (val != null && val !== '') {
        if (Array.isArray(val)) return val.join(', ');
        return String(val);
      }
      return ref.from.split('.').pop() ?? '';
    }
    return '';
  }

  resolveIcon(
    ref: { from?: string } | undefined,
    ctx: any,
  ): string {
    if (!ref?.from) return 'image';
    const val = this.resolveField(ctx, ref.from);
    if (val && typeof val === 'string') {
      if (val.includes('/') || val.includes('.')) return 'image';
      return val;
    }
    return 'image';
  }

  resolveArray(path: string, ctx: any): any[] {
    const arr = this.resolveField(ctx, path);
    return Array.isArray(arr) ? arr : [];
  }

  wrapPrimitive(item: any): any {
    if (item != null && typeof item !== 'object') {
      return { value: item, Name: item, Text: item };
    }
    return item;
  }

  isImageValue(ref: { from?: string } | undefined, ctx: any): boolean {
    if (!ref?.from) return false;
    const val = this.resolveField(ctx, ref.from);
    if (!val || typeof val !== 'string') return false;
    return val.startsWith('data:image') || val.startsWith('http') || /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(val);
  }

  // --- Helpers ---

  resolveField(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((cur, key) => cur?.[key], obj);
  }

  private resolve(val: string | number): string | number {
    if (typeof val === 'number') return val;
    if (val.startsWith('token:')) {
      return this.tokens[val.slice(6)] ?? 0;
    }
    if (val.startsWith('theme:')) {
      return this.theme()[val.slice(6)] ?? '#888';
    }
    return val;
  }

  private px(val: string | number): string {
    const resolved = this.resolve(val);
    return typeof resolved === 'number' ? resolved + 'px' : String(resolved);
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export type AssetType = 'icon' | 'image' | 'video';

export interface Asset {
  id: string;
  protocolId: string; // repo name (slug)
  name: string;
  filename: string;
  type: AssetType;
  mimeType: string;
  content: string;    // base64 data URL
  size: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AssetService {
  private caches = new Map<string, BehaviorSubject<Asset[]>>();

  /** Called when a protocol is loaded from GitHub — seeds the in-memory cache. */
  loadAssets(repoName: string, assets: Asset[]): void {
    this.cacheFor(repoName).next(assets);
  }

  getAssetsForProtocol$(repoName: string): Observable<Asset[]> {
    if (!repoName) return of([]);
    return this.cacheFor(repoName).asObservable();
  }

  getAssetsByTypeForProtocol$(repoName: string, type: AssetType): Observable<Asset[]> {
    return this.getAssetsForProtocol$(repoName).pipe(
      map(assets => assets.filter(a => a.type === type))
    );
  }

  /** Returns current in-memory assets for inclusion in the push zip. */
  getAllAssets(repoName: string): Asset[] {
    return this.caches.get(repoName)?.value ?? [];
  }

  async addAsset(partial: {
    protocolId: string;
    name: string;
    filename: string;
    type: AssetType;
    mimeType: string;
    content: string;
    size: number;
  }): Promise<Asset> {
    const asset: Asset = {
      ...partial,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const cache = this.cacheFor(partial.protocolId);
    cache.next([...cache.value, asset]);
    return asset;
  }

  async deleteAsset(asset: Asset): Promise<void> {
    const cache = this.cacheFor(asset.protocolId);
    cache.next(cache.value.filter(a => a.id !== asset.id));
  }

  async updateAssetName(asset: Asset, newName: string): Promise<void> {
    const cache = this.cacheFor(asset.protocolId);
    cache.next(cache.value.map(a => a.id === asset.id ? { ...a, name: newName } : a));
  }

  getAssetPath(asset: Asset): string {
    const ext = asset.filename.split('.').pop() ?? '';
    const folder = asset.type === 'icon' ? 'assets' : asset.type === 'image' ? 'images' : 'videos';
    return `/${folder}/${asset.name}${ext ? '.' + ext : ''}`;
  }

  private cacheFor(repoName: string): BehaviorSubject<Asset[]> {
    if (!this.caches.has(repoName)) {
      this.caches.set(repoName, new BehaviorSubject<Asset[]>([]));
    }
    return this.caches.get(repoName)!;
  }
}

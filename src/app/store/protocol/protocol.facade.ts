import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "../../app.module";
import { HttpFacade } from "../../http.facade";
import { ProtocolSelectors } from "./protocol.selectors";
import { Observable, catchError, of, switchMap, take, tap, throwError } from "rxjs";
import { StudyCodes } from "../../models/study-codes";
import { Protocol, ProtocolStatus } from "../../models/protocol";
import { ProtocolActions } from "./protocol.actions";
import { GitHubRepo, GitHubService } from "../../services/github.service";
import { AssetService } from "../../services/asset.service";

const STORAGE_KEY = 'dt_protocols';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

@Injectable({ providedIn: 'root' })
export class ProtocolFacade {
  private storageLoaded = false;
  private assetsLoadedFor = new Set<string>();

  constructor(
    private store: Store<AppState>,
    private githubService: GitHubService,
    private assetService: AssetService,
  ) {}

  // ── Protocol list ────────────────────────────────────────────────────────────

  getProtocols$(): Observable<Protocol[]> {
    if (!this.storageLoaded) {
      this.storageLoaded = true;
      const stored = this.readFromStorage();
      this.store.dispatch(ProtocolActions.setProtocols({ protocols: stored }));

      // Fetch from GitHub in background and merge — never blocks initial render
      this.githubService.listProtocols().pipe(
        catchError(() => of([] as GitHubRepo[]))
      ).subscribe(repos => {
        const merged = this.mergeWithGitHub(stored, repos);
        this.store.dispatch(ProtocolActions.setProtocols({ protocols: merged }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      });
    }
    return this.store.select(ProtocolSelectors.selectProtocols);
  }

  // ── Single protocol ──────────────────────────────────────────────────────────

  /**
   * Returns the protocol from the store. If the protocol is a stub (empty data,
   * i.e. discovered from GitHub but never opened locally), fetches full data
   * from GitHub and hydrates the store. Also triggers asset loading.
   */
  getProtocol$(id: string): Observable<Protocol | undefined> {
    if (!this.storageLoaded) this.getProtocols$();
    const obs = this.store.select(ProtocolSelectors.selectProtocolById(id));
    obs.pipe(take(1)).subscribe(p => {
      if (!p) return;
      if (Object.keys(p.data).length === 0) {
        // Stub protocol — hydrate from GitHub
        const repoName = slugify(p.name);
        this.githubService.getProtocol(repoName).subscribe(result => {
          if (result?.protocol) {
            const hydrated: Protocol = { ...p, data: result.protocol };
            this.store.dispatch(ProtocolActions.updateProtocol({ protocol: hydrated }));
            this.persistToStorage();
          }
          if (result?.assets?.length) {
            this.assetService.loadAssets(repoName, result.assets);
            this.assetsLoadedFor.add(repoName);
          }
        });
      } else {
        this.ensureAssetsLoaded(p.name);
      }
    });
    return obs;
  }

  /**
   * Loads assets from GitHub for the given protocol name, once per session.
   * Safe to call multiple times — subsequent calls are no-ops.
   */
  ensureAssetsLoaded(protocolName: string): void {
    const repoName = slugify(protocolName);
    if (this.assetsLoadedFor.has(repoName)) return;
    this.assetsLoadedFor.add(repoName);
    this.githubService.getProtocol(repoName).subscribe(result => {
      if (result?.assets?.length) {
        this.assetService.loadAssets(repoName, result.assets);
      }
    });
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  createProtocol(name: string, data: Record<string, unknown> = {}): Protocol {
    const now = new Date().toISOString();
    const protocol: Protocol = {
      id: crypto.randomUUID(),
      name,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      data,
    };
    this.store.dispatch(ProtocolActions.addProtocol({ protocol }));
    this.persistToStorage();
    // Create the GitHub repo in the background — don't block the user
    this.githubService.createProtocol(slugify(name)).pipe(
      catchError(err => { console.warn('GitHub repo creation failed:', err); return of(null); })
    ).subscribe();
    return protocol;
  }

  /**
   * Saves the protocol locally (NgRx + localStorage) AND pushes a zip to GitHub
   * containing protocol.json, flows, and all in-memory assets.
   */
  saveProtocol(protocol: Protocol): Observable<void> {
    const updated = { ...protocol, updatedAt: new Date().toISOString() };
    this.store.dispatch(ProtocolActions.updateProtocol({ protocol: updated }));
    this.persistToStorage();

    const repoName = slugify(protocol.name);
    const assets = this.assetService.getAllAssets(repoName);
    return this.githubService.pushProtocol(repoName, protocol.data, assets);
  }

  /** Local-only update (status changes, renames that don't trigger a push). */
  updateProtocol(protocol: Protocol): void {
    const updated = { ...protocol, updatedAt: new Date().toISOString() };
    this.store.dispatch(ProtocolActions.updateProtocol({ protocol: updated }));
    this.persistToStorage();
  }

  deleteProtocol(id: string): void {
    this.store.select(ProtocolSelectors.selectProtocolById(id)).pipe(take(1)).subscribe(p => {
      if (p) {
        this.githubService.deleteProtocol(slugify(p.name)).pipe(
          catchError(err => { console.warn('GitHub repo deletion failed:', err); return of(null); })
        ).subscribe();
      }
    });
    this.store.dispatch(ProtocolActions.deleteProtocol({ id }));
    this.persistToStorage();
  }

  setStatus(id: string, status: ProtocolStatus): void {
    this.store.dispatch(ProtocolActions.setProtocolStatus({ id, status }));
    this.persistToStorage();
  }

  duplicateProtocol(source: Protocol): Protocol {
    const now = new Date().toISOString();
    const copy: Protocol = {
      id: crypto.randomUUID(),
      name: `${source.name} (Copy)`,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      data: structuredClone(source.data),
    };
    this.store.dispatch(ProtocolActions.addProtocol({ protocol: copy }));
    this.persistToStorage();
    return copy;
  }

  repoUrl(protocolName: string): string {
    return this.githubService.repoUrl(slugify(protocolName));
  }

  // ── Storage ──────────────────────────────────────────────────────────────────

  private readFromStorage(): Protocol[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private persistToStorage(): void {
    this.store.select(ProtocolSelectors.selectProtocols).pipe(take(1)).subscribe(protocols => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(protocols));
    });
  }

  // ── GitHub merge ─────────────────────────────────────────────────────────────

  private mergeWithGitHub(local: Protocol[], repos: GitHubRepo[]): Protocol[] {
    const result: Protocol[] = [...local];
    const seen = new Set(local.map(p => slugify(p.name)));

    for (const repo of repos) {
      if (seen.has(repo.name)) continue; // local version takes precedence
      // GitHub repo not found locally — create a stub
      result.push({
        id: crypto.randomUUID(),
        name: repo.description || repo.name,
        status: 'draft',
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        data: {},
      });
    }

    return result;
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

interface ProtocolContext {
  id: string | null;
  repoName: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProtocolContextService {
  private ctx$ = new BehaviorSubject<ProtocolContext>({ id: null, repoName: null });

  setCurrentProtocol(id: string | null, name?: string | null): void {
    this.ctx$.next({ id, repoName: name ? slugify(name) : null });
  }

  getProtocolId$(): Observable<string | null> {
    return this.ctx$.pipe(map(c => c.id));
  }

  getCurrentProtocolId(): string | null {
    return this.ctx$.value.id;
  }

  getRepoName$(): Observable<string | null> {
    return this.ctx$.pipe(map(c => c.repoName));
  }

  getCurrentRepoName(): string | null {
    return this.ctx$.value.repoName;
  }

  snapshot(): ProtocolContext {
    return this.ctx$.value;
  }
}

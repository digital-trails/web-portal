import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import JSZip from 'jszip';
import { Asset } from './asset.service';
import { HttpFacade } from '../http.facade';

export interface GitHubRepo {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  private: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProtocolWithAssets extends GitHubRepo {
  assets: Asset[];
  protocol?: Record<string, unknown>; // src/protocol.json content
}

const API = 'https://digital-trails.org/api/protocols';
export const GITHUB_ORG = 'digital-trails-protocols1';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

@Injectable({ providedIn: 'root' })
export class GitHubService {
  constructor(private http: HttpFacade) {}

  listProtocols(): Observable<GitHubRepo[]> {
    return this.http.get<GitHubRepo[]>(API);
  }

  createProtocol(name: string, description = ''): Observable<GitHubRepo> {
    return this.http.post(API, { name, description });
  }

  getProtocol(name: string): Observable<ProtocolWithAssets | null> {
    return this.http.get<ProtocolWithAssets>(`${API}/${name}`).pipe(
      catchError(() => of(null))
    );
  }

  pushProtocol(repoName: string, protocolJson: Record<string, unknown>, assets: Asset[]): Observable<void> {
    return from(this.buildZip(protocolJson, assets)).pipe(
      switchMap(zipBase64 =>
        this.http.patch(`${API}/${repoName}`, { zip: zipBase64 })
      )
    );
  }

  deleteProtocol(name: string): Observable<void> {
    return this.http.delete(`${API}/${name}`);
  }

  repoUrl(name: string): string {
    return `https://github.com/${GITHUB_ORG}/${name}`;
  }

  private async buildZip(protocolJson: Record<string, unknown>, assets: Asset[]): Promise<string> {
    const zip = new JSZip();
    const src = zip.folder('src')!;

    const { flowFiles, protocolWithoutFlows } = this.extractFlows(protocolJson);
    src.file('protocol.json', JSON.stringify(protocolWithoutFlows, null, 2));

    const flowsFolder = src.folder('flows')!;
    for (const { slug, content } of flowFiles) {
      flowsFolder.file(`${slug}.json`, JSON.stringify(content, null, 2));
    }

    for (const asset of assets) {
      const ext = asset.filename.split('.').pop() ?? '';
      const folder = asset.type === 'icon' ? 'assets' : asset.type === 'image' ? 'images' : 'videos';
      const filename = `${asset.name}${ext ? '.' + ext : ''}`;
      const base64 = asset.content.split(',')[1] ?? asset.content;
      src.folder(folder)!.file(filename, base64, { base64: true });
    }

    return zip.generateAsync({ type: 'base64', compression: 'DEFLATE' });
  }

  private extractFlows(protocolJson: Record<string, unknown>): {
    flowFiles: { slug: string; content: unknown }[];
    protocolWithoutFlows: Record<string, unknown>;
  } {
    const flows = protocolJson['flows'];
    if (!Array.isArray(flows)) {
      return { flowFiles: [], protocolWithoutFlows: protocolJson };
    }

    const flowFiles: { slug: string; content: unknown }[] = [];
    const flowRefs: unknown[] = [];

    for (const flow of flows as Record<string, unknown>[]) {
      const name = (flow['name'] as string) || (flow['path'] as string) || 'flow';
      const slug = slugify(name);
      const { name: _n, path: _p, ...flowContent } = flow;
      flowFiles.push({ slug, content: { name, path: flow['path'], ...flowContent } });
      flowRefs.push({ name: flow['name'], path: flow['path'] });
    }

    return {
      flowFiles,
      protocolWithoutFlows: { ...protocolJson, flows: flowRefs },
    };
  }
}

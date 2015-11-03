/// <reference path="../typings/tsd.d.ts"/>
import { IStorageObject } from './storageObject';
import SyncStorage from './syncStorage';
import * as Rx from 'rx';
import Observable = Rx.Observable;

export enum pageType { blob, compare, pull, commit, blame, tree }
export enum lineType { hit, missed, irrelevant }

export abstract class OverlayWindow {
  protected static baseUrl: string = 'https://coveralls.io/builds';
  protected static emptyCoverage: JSON = JSON.parse('{}');
  protected filePath: string = null;
  protected commitSha: string = null;
  protected baseSha: string = null;
  protected page: pageType = null;
  protected owner: string = null;
  protected coverageAvailable: boolean = false;
  protected invalidating: boolean = false;
  protected coverage: { [key: string]: JSON; } = { };

  protected abstract acquireReference(value: string[]): string;
  protected abstract prepareOverlay(): void;
  protected abstract visualizeOverlay(value: any): void;

  constructor(protected preferences: IStorageObject) {
    this.initialize();
  }

  log(title: string, data?: any): void {
    if (!this.preferences.debugEnabled) {
      return;
    }

    data ? console.log(title, data) : console.log(title);
  }

  initialize(): void {
    this.preferences.setupUrl(document.URL);
    let href = (this.preferences.debug_url || document.URL).split('/');
    this.log('::initialize', href);

    this.owner = `${href[3]}/${href[4]}`;
    this.page = (<any>pageType)[href[5]];
    this.commitSha = this.acquireReference(href);

    if (this.commitSha) {
      this.invalidateOverlay();
    }
  }

  private retrieveCoverageObservable(id: string): Observable<JSON> {
    this.log('::retrieveCoverage', id);
    this.coverageAvailable = false;

    let split = id.split('/');
    let url = (split.length > 2) ?
      `${OverlayWindow.baseUrl}/${split[0]}/source.json?filename=${split.slice(1).join('/')}` :
      `${OverlayWindow.baseUrl}/${id}.json`;

    this.log('::retrieveCoverage', url);

    let settings: JQueryAjaxSettings;
    settings = {
      type: 'get',
      dataType: 'json'
    };

    return Rx.Observable.fromPromise($.when($.ajax(url, settings)));
  }

  private readCoverageObservable(id: string): Observable<JSON> {
    const stored = this.coverage[id];
    if (stored) {
      return Observable.of(stored);
    }

    let observable = Observable.fromCallback<any>(SyncStorage.loadCoverage);
    return observable(this.coverage, id).map(x => {
      if (!x) {
        return this.retrieveCoverageObservable(id);
      } else {
        return x;
      }
    }).concatAll();
  }

  protected invalidateOverlay(): void {
    if (this.invalidating) {
      this.log('::invalidateOverlay', 'invalidate ongoing');
      return;
    }

    let id = this.filePath ? `${this.commitSha}/${this.filePath}` : this.commitSha;
    this.log('::invalidateOverlay', 'invalidating');
    this.invalidating = true;

    const visualize: (coverage: JSON) => void = (coverage: JSON) => {
      this.coverage[id] = coverage;
      SyncStorage.saveCoverage(this.coverage, () => { });
      this.visualizeOverlay(coverage);
    };

    this.readCoverageObservable(id).finally(() => {
      this.invalidating = false;
    }).subscribe(visualize,
      (err: JQueryXHR) => {
        if (err.status === 500) {
          visualize(OverlayWindow.emptyCoverage);
        }
    });
  }

  protected static ratio(hit: number, total: number): string {
    if (hit >= total) {
      return '100';
    } else if (total > hit && hit > 0) {
      return ((hit / total) * 10000 / 100).toFixed(2);
    }
    return '0';
  }

  protected generateCoverageMap(coverage: JSON): Array<lineType> {
    this.coverageAvailable = coverage && coverage !== OverlayWindow.emptyCoverage;

    if (this.coverageAvailable === false) {
      return null;
    }

    return $.map(coverage, (element: number) => {
      if (element === undefined || element === null) {
        return lineType.irrelevant;
      } else if (element > 0) {
        return lineType.hit;
      }
      return lineType.missed;
    });
  }
}
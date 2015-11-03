export interface IStorageObject {
  overlayEnabled: boolean;
  debugEnabled: boolean;
  callback: any;
  debug_url: any;
  urls: Array<any>;
  setupUrl(url: string): void;
}

export class StorageObject implements IStorageObject {
  private _urls: Array<string> = [];
  private _callback: Function = null;

  get overlayEnabled(): boolean {
    return this._overlayEnabled;
  }
  set overlayEnabled(value: boolean) {
    this._overlayEnabled = value;
  }

  get debugEnabled(): boolean {
    return this._debugEnabled;
  }

  set debugEnabled(value: boolean) {
    this._debugEnabled = value;
  }

  get callback(): Function {
    return this._callback;
  }

  set callback(value: Function) {
    this._callback = value;
  }

  get debug_url(): any {
    return false;
  }

  get urls(): Array<string> {
    return this._urls;
  }

  setupUrl(url: string): void {
    let href = (this.debug_url || document.URL).split('/');
    if (href.length > 2 && href[2].indexOf('github.com') > 0) {
      this._urls.push('https://coveralls.io');
    }
  }

  constructor(private _overlayEnabled: boolean = true,
              private _debugEnabled: boolean = false) {
  }
}

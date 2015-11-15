import { IStorageObject } from '../../storageObject';
import { ChromeStorage } from './chromeStorage';

class Options {
  private static storage: ChromeStorage = new ChromeStorage();
  constructor() {
    this.restoreState();
    this.bindBehaviors();
  }

  private restoreState(): void {
    Options.storage.loadOption((value: IStorageObject) => {
      (<HTMLInputElement>document.getElementById('overlay')).checked = value.overlayEnabled;
      (<HTMLInputElement>document.getElementById('debug')).checked = value.debugEnabled;
    });
  }

  private bindBehaviors(): void {
    window.document.getElementById('save').addEventListener('click', this.saveOptions);
  }

  private saveOptions(event: MouseEvent): void {
    let overlayEnabled = (<HTMLInputElement>document.getElementById('overlay')).checked;
    let debugEnabled = (<HTMLInputElement>document.getElementById('debug')).checked;

    Options.storage.saveOption(overlayEnabled, debugEnabled, () => {
      let status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => { status.textContent = ''; }, 750);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Options();
});
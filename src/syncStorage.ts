/// <reference path="../typings/tsd.d.ts"/>

import { IStorageObject, StorageObject } from './storageObject';

export default class SyncStorage {
  static loadOption(callback: (preferences: IStorageObject) => void): void {
    chrome.storage.sync.get({
        overlayEnabled: true,
        debugEnabled: false
      }, (items: any) => {
        if (items['overlayEnabled'] === undefined) {
          items['overlayEnabled'] = true;
        }
        callback(new StorageObject(items['overlayEnabled'], items['debugEnabled']));
      });
  };

  static saveOption(overlayEnabled: boolean, debugEnabled: boolean, callback: () => void): void {
    chrome.storage.sync.set({
        overlayEnabled: overlayEnabled,
        debugEnabled: debugEnabled
      }, callback);
  };

  static loadCoverage(value: any, id: string, callback: (coverage: JSON) => void): void {
    chrome.storage.local.get(value, (items: any) => {
      let value = items[id];
      if (callback) {
        callback(value);
      }
    });
  };

  static saveCoverage(value: any, callback: () => void): void {
    chrome.storage.local.set(value, callback);
  };
}
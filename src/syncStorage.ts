/// <reference path="../typings/tsd.d.ts"/>
import { IStorageObject, StorageObject } from './storageObject';

export interface ISyncStorage {
  loadOption(callback: (preferences: IStorageObject) => void): void;
  saveOption(overlayEnabled: boolean, debugEnabled: boolean, callback: () => void): void;
  loadCoverage(value: any, id: string, callback: (coverage: JSON) => void): void;
  saveCoverage(value: any, callback: () => void): void;
}
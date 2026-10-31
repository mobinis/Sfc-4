import { AppState } from '../types';

export function hasMeaningfulStateData(state: unknown): boolean;
export function migrateSchema(rawState: unknown): AppState;

export class NativeStorageService {
  isFilesystemAvailable: boolean;
  loadState(): Promise<AppState>;
  saveState(state: AppState): void;
  writeToFilesystem(state: AppState): Promise<void>;
  exportBackupSnapshot(state: AppState): string;
  importBackupSnapshot(jsonString: string): AppState;
}

export const nativeStorageService: NativeStorageService;

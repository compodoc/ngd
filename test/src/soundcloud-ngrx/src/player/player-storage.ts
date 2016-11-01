import { PLAYER_STORAGE_KEY } from 'src/constants';
import { localStorageAdapter } from 'src/utils/local-storage';


export const playerStorage = {
  clear(): void {
    localStorageAdapter.removeItem(PLAYER_STORAGE_KEY);
  },

  get data(): any {
    return localStorageAdapter.getItem(PLAYER_STORAGE_KEY) || {};
  },

  set data(value: any) {
    localStorageAdapter.setItem(PLAYER_STORAGE_KEY, value);
  },

  get volume(): number {
    return playerStorage.data.volume;
  },

  set volume(value: number) {
    let data = playerStorage.data;
    data.volume = value;
    playerStorage.data = data;
  }
};

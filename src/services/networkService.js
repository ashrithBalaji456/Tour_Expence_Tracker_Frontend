import { Network } from '@capacitor/network';
import { isNative } from '../utils/platform';

class NetworkService {
  constructor() {
    this.isOnline = true;
    this.connectionType = 'unknown';
    this.listeners = new Set();
    this._initialized = false;
  }

  async init() {
    if (this._initialized) return;
    this._initialized = true;

    if (isNative()) {
      try {
        const status = await Network.getStatus();
        this.isOnline = status.connected;
        this.connectionType = status.connectionType;

        Network.addListener('networkStatusChange', (status) => {
          this.isOnline = status.connected;
          this.connectionType = status.connectionType;
          this._notifyListeners();
        });
      } catch (e) {
        console.warn('[NetworkService] Failed to init native network listener:', e);
      }
    } else if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;

      window.addEventListener('online', () => {
        this.isOnline = true;
        this._notifyListeners();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this._notifyListeners();
      });
    }
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      connectionType: this.connectionType,
    };
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.getStatus());
    return () => {
      this.listeners.delete(callback);
    };
  }

  _notifyListeners() {
    const status = this.getStatus();
    this.listeners.forEach((callback) => {
      try {
        callback(status);
      } catch (e) {
        console.error('[NetworkService] Error in listener:', e);
      }
    });
  }
}

export const networkService = new NetworkService();


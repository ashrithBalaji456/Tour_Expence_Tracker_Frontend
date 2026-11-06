import { Preferences } from '@capacitor/preferences';
import { isNative } from './platform';

// In-memory cache for synchronous access (e.g. in Axios interceptors)
const memoryCache = new Map();

// Helper to safely read from localStorage on web
const safeLocalStorageGet = (key) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    // localStorage may be disabled in private browsing
  }
  return null;
};

const safeLocalStorageSet = (key, value) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {
    // Ignore storage errors
  }
};

const safeLocalStorageRemove = (key) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {
    // Ignore storage errors
  }
};

export const storageService = {
  /**
   * Preload keys on app startup so synchronous access is immediately accurate.
   */
  async init() {
    const keys = ['token', 'username', 'activeGroupId'];
    if (isNative()) {
      for (const key of keys) {
        try {
          const { value } = await Preferences.get({ key });
          if (value !== null && value !== undefined) {
            memoryCache.set(key, value);
          } else {
            // Check fallback in webview localStorage
            const localVal = safeLocalStorageGet(key);
            if (localVal) {
              memoryCache.set(key, localVal);
              await Preferences.set({ key, value: localVal });
            }
          }
        } catch (e) {
          console.warn(`[Storage] Failed to read ${key} from Preferences:`, e);
          const localVal = safeLocalStorageGet(key);
          if (localVal) memoryCache.set(key, localVal);
        }
      }
    } else {
      // In web, populate memory cache from localStorage
      for (const key of keys) {
        const val = safeLocalStorageGet(key);
        if (val) memoryCache.set(key, val);
      }
    }
  },

  /**
   * Synchronous getter backed by in-memory cache and localStorage fallback.
   */
  getItem(key) {
    if (memoryCache.has(key)) {
      return memoryCache.get(key);
    }
    const val = safeLocalStorageGet(key);
    if (val !== null) {
      memoryCache.set(key, val);
      return val;
    }
    return null;
  },

  getItemSync(key) {
    return this.getItem(key);
  },

  /**
   * Asynchronous getter reading directly from native preferences if available.
   */
  async getItemAsync(key) {
    if (isNative()) {
      try {
        const { value } = await Preferences.get({ key });
        if (value !== null && value !== undefined) {
          memoryCache.set(key, value);
          return value;
        }
      } catch (e) {
        console.warn(`[Storage] getItemAsync failed for ${key}:`, e);
      }
    }
    return this.getItem(key);
  },

  /**
   * Sets value in memory cache, localStorage, and native Preferences.
   */
  async setItem(key, value) {
    const stringValue = String(value);
    memoryCache.set(key, stringValue);
    safeLocalStorageSet(key, stringValue);

    if (isNative()) {
      try {
        await Preferences.set({ key, value: stringValue });
      } catch (e) {
        console.warn(`[Storage] Failed to set ${key} in Preferences:`, e);
      }
    }
  },

  /**
   * Synchronous write to memory cache and localStorage, firing async native write in background.
   */
  setItemSync(key, value) {
    const stringValue = String(value);
    memoryCache.set(key, stringValue);
    safeLocalStorageSet(key, stringValue);

    if (isNative()) {
      Preferences.set({ key, value: stringValue }).catch((err) => {
        console.warn(`[Storage] Background Preferences.set failed for ${key}:`, err);
      });
    }
  },

  /**
   * Removes key from all layers.
   */
  async removeItem(key) {
    memoryCache.delete(key);
    safeLocalStorageRemove(key);

    if (isNative()) {
      try {
        await Preferences.remove({ key });
      } catch (e) {
        console.warn(`[Storage] Failed to remove ${key} in Preferences:`, e);
      }
    }
  },

  removeItemSync(key) {
    memoryCache.delete(key);
    safeLocalStorageRemove(key);

    if (isNative()) {
      Preferences.remove({ key }).catch((err) => {
        console.warn(`[Storage] Background Preferences.remove failed for ${key}:`, err);
      });
    }
  },

  async clear() {
    memoryCache.clear();
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (e) {}

    if (isNative()) {
      try {
        await Preferences.clear();
      } catch (e) {}
    }
  },

  // Specialized helpers
  getToken() {
    return this.getItem('token');
  },
  async getTokenAsync() {
    return this.getItemAsync('token');
  },
  setToken(token) {
    this.setItemSync('token', token);
  },
  removeToken() {
    this.removeItemSync('token');
  },

  getUsername() {
    return this.getItem('username');
  },
  setUsername(username) {
    this.setItemSync('username', username);
  },

  getActiveGroupId() {
    return this.getItem('activeGroupId');
  },
  setActiveGroupId(groupId) {
    this.setItemSync('activeGroupId', groupId);
  },
  removeActiveGroupId() {
    this.removeItemSync('activeGroupId');
  }
};


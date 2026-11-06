import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapApp } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Keyboard } from '@capacitor/keyboard';
import { isNative } from '../utils/platform';

// Stack of back button handlers for modal and navigation management
const backActionStack = [];

export const nativeService = {
  /**
   * Initializes native Android plugins (StatusBar, SplashScreen, Keyboard, Back button)
   */
  async init() {
    if (!isNative()) return;

    try {
      // 1. Status Bar Setup
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0B0F19' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (e) {
      console.warn('[NativeService] StatusBar init error:', e);
    }

    try {
      // 2. Keyboard Setup
      await Keyboard.setScroll({ isDisabled: false });
    } catch (e) {
      console.warn('[NativeService] Keyboard init error:', e);
    }

    try {
      // 3. Android Hardware Back Button listener
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (backActionStack.length > 0) {
          const handler = backActionStack[backActionStack.length - 1];
          const handled = handler();
          if (handled !== false) {
            return;
          }
        }

        // If no modal or custom view consumed it
        if (canGoBack) {
          window.history.back();
        } else {
          // Double-tap or confirm to exit can be handled by app root, or minimize app
          CapApp.minimizeApp();
        }
      });
    } catch (e) {
      console.warn('[NativeService] BackButton listener error:', e);
    }
  },

  /**
   * Hide the splash screen once the initial React render and data fetch is complete
   */
  async hideSplashScreen() {
    if (!isNative()) return;
    try {
      await SplashScreen.hide({ fadeOutDuration: 300 });
    } catch (e) {
      console.warn('[NativeService] SplashScreen.hide error:', e);
    }
  },

  /**
   * Push a back button handler. Returns an unregister function.
   */
  registerBackHandler(handler) {
    backActionStack.push(handler);
    return () => {
      const idx = backActionStack.lastIndexOf(handler);
      if (idx !== -1) {
        backActionStack.splice(idx, 1);
      }
    };
  },

  /**
   * Tactile Haptic Feedback
   */
  async hapticLight() {
    if (!isNative()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {}
  },

  async hapticMedium() {
    if (!isNative()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {}
  },

  async hapticSuccess() {
    if (!isNative()) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {}
  },

  async hapticWarning() {
    if (!isNative()) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (e) {}
  },

  /**
   * Native Share with web fallback
   */
  async shareContent({ title, text, url, dialogTitle = 'Share Trip Summary' }) {
    if (isNative()) {
      try {
        await Share.share({
          title,
          text,
          url,
          dialogTitle,
        });
        return true;
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.warn('[NativeService] Native share error:', e);
        }
      }
    }

    // Web fallback
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.warn('[NativeService] Navigator share error:', e);
        }
      }
    }

    // Clipboard fallback
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        const shareText = [title, text, url].filter(Boolean).join('\n\n');
        await navigator.clipboard.writeText(shareText);
        return 'COPIED';
      } catch (e) {}
    }

    return false;
  },
};


import { Capacitor } from '@capacitor/core';

export const isNative = () => {
  return typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();
};

export const isAndroid = () => {
  return typeof Capacitor !== 'undefined' && Capacitor.getPlatform() === 'android';
};

export const isWeb = () => {
  return !isNative();
};

export const getPlatform = () => {
  return typeof Capacitor !== 'undefined' ? Capacitor.getPlatform() : 'web';
};


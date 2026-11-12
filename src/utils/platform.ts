import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();
export const isWails = !!(window as any).go?.main?.App;
export const isWeb = !isNative && !isWails;

export const getPlatform = () => {
  if (isNative) return 'mobile';
  if (isWails) return 'desktop';
  return 'web';
};

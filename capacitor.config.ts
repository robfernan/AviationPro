// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aviationpro.app',
  appName: 'AviationPro',
  webDir: 'dist', // Ensure this matches your Vite output!
  server: { androidScheme: 'https' }
};

export default config;
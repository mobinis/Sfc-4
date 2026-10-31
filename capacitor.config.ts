import type { CapacitorConfig } from '@capacitor/cli';
import { APP_CONFIG } from './src/config';

const config: CapacitorConfig = {
  appId: APP_CONFIG.appId || 'com.selfcare.hero.core',
  appName: APP_CONFIG.appName || 'SelfCare Hero',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: false
  },
  plugins: {
    Preferences: {
      group: APP_CONFIG.variantId || 'core'
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#87A96B',
      sound: 'beep.wav'
    }
  }
};

export default config;

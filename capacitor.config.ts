import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.corizo.mybudget',
  appName: 'MyBudget',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;

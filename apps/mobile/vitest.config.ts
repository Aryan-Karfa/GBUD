import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      'react-native': path.resolve(__dirname, './src/__mocks__/react-native.ts'),
      'expo-secure-store': path.resolve(__dirname, './src/__mocks__/expo-secure-store.ts'),
    },
  },
});

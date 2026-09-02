import { describe, it, expect } from 'vitest';
import { resolveApiUrl } from '../config/env';
import appConfig from '../../app.json';
import easConfig from '../../eas.json';

describe('Phase 14 Mobile Production Configuration Hardening', () => {
  describe('API URL Resolution & HTTPS Enforcement', () => {
    it('allows HTTP in development mode (localhost, 10.0.2.2 emulator, LAN)', () => {
      expect(resolveApiUrl('http://localhost:4000', false)).toBe('http://localhost:4000');
      expect(resolveApiUrl('http://10.0.2.2:4000', false)).toBe('http://10.0.2.2:4000');
      expect(resolveApiUrl('http://192.168.1.50:4000', false)).toBe('http://192.168.1.50:4000');
      // Defaults to localhost in dev if empty
      expect(resolveApiUrl(undefined, false)).toBe('http://localhost:4000');
    });

    it('strictly enforces HTTPS in production mode and permits valid HTTPS URLs', () => {
      expect(resolveApiUrl('https://api.gbud.app', true)).toBe('https://api.gbud.app');
      expect(resolveApiUrl('https://api.gbud.app/', true)).toBe('https://api.gbud.app');
    });

    it('strictly rejects insecure HTTP URLs in production mode', () => {
      expect(() => resolveApiUrl('http://api.gbud.app', true)).toThrow(
        /Insecure HTTP protocol is not permitted in production/
      );
      expect(() => resolveApiUrl('http://10.0.2.2:4000', true)).toThrow(
        /Insecure HTTP protocol is not permitted in production/
      );
    });

    it('rejects missing or empty API base URLs in production mode', () => {
      expect(() => resolveApiUrl('', true)).toThrow(/API base URL is required/);
      expect(() => resolveApiUrl(undefined, true)).toThrow(/API base URL is required/);
    });

    it('rejects invalid URL protocols in both development and production', () => {
      expect(() => resolveApiUrl('ftp://api.gbud.app', false)).toThrow(/Invalid protocol in API URL/);
      expect(() => resolveApiUrl('javascript:alert(1)', true)).toThrow(/Invalid protocol in API URL/);
    });
  });

  describe('Android App Identity & Configuration (app.json)', () => {
    it('configures explicit Android application identity and versioning', () => {
      const android = appConfig.expo.android;
      expect(android.package).toBe('com.gbud.app');
      expect(android.versionCode).toBe(1);
      expect(typeof android.versionCode).toBe('number');
      expect(android.versionCode).toBeGreaterThan(0);
    });

    it('maintains dark mode theme and portrait orientation', () => {
      expect(appConfig.expo.orientation).toBe('portrait');
      expect(appConfig.expo.userInterfaceStyle).toBe('dark');
      expect(appConfig.expo.android.adaptiveIcon.backgroundColor).toBe('#09090b');
      expect(appConfig.expo.androidNavigationBar.backgroundColor).toBe('#09090b');
    });
  });

  describe('EAS Build Profiles (eas.json)', () => {
    it('defines development, preview (APK), and production (App Bundle) profiles', () => {
      const builds = easConfig.build;
      expect(builds).toHaveProperty('development');
      expect(builds).toHaveProperty('preview');
      expect(builds).toHaveProperty('production');

      // Preview builds internal APK for physical device validation
      expect(builds.preview.android.buildType).toBe('apk');

      // Production builds Google Play App Bundle (.aab)
      expect(builds.production.android.buildType).toBe('app-bundle');
      expect(builds.production.distribution).toBe('store');
    });
  });
});

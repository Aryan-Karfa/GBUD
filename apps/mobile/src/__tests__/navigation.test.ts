import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NavigationManager } from '../navigation/navigation.manager';
import { BackHandler } from 'react-native';

describe('Navigation Architecture & Android BackHandler', () => {
  let nav: NavigationManager;

  beforeEach(() => {
    vi.restoreAllMocks();
    (BackHandler as any)._reset();
    nav = new NavigationManager();
  });

  it('should initialize with default routes (Login in auth, Home in main)', () => {
    expect(nav.getAuthScreen()).toBe('Login');
    expect(nav.getCurrentTab()).toBe('Home');
  });

  it('should navigate between Login and Register in unauthenticated flow', () => {
    nav.setAuthStatus('UNAUTHENTICATED');

    nav.navigateAuth('Register');
    expect(nav.getAuthScreen()).toBe('Register');

    nav.navigateAuth('Login');
    expect(nav.getAuthScreen()).toBe('Login');
  });

  it('should navigate between tabs in authenticated flow', () => {
    nav.setAuthStatus('AUTHENTICATED');

    nav.navigateTab('Train');
    expect(nav.getCurrentTab()).toBe('Train');

    nav.navigateTab('Fuel');
    expect(nav.getCurrentTab()).toBe('Fuel');

    nav.navigateTab('Progress');
    expect(nav.getCurrentTab()).toBe('Progress');

    nav.navigateTab('Profile');
    expect(nav.getCurrentTab()).toBe('Profile');

    nav.navigateTab('Home');
    expect(nav.getCurrentTab()).toBe('Home');
  });

  it('should handle Android back on Register by returning to Login', () => {
    nav.setAuthStatus('UNAUTHENTICATED');
    nav.navigateAuth('Register');
    expect(nav.getAuthScreen()).toBe('Register');

    const handled = nav.goBack();
    expect(handled).toBe(true);
    expect(nav.getAuthScreen()).toBe('Login');

    // On Login, goBack() returns false to let Android system exit/minimize
    const handledOnLogin = nav.goBack();
    expect(handledOnLogin).toBe(false);
  });

  it('should handle Android back on secondary tabs by returning to Home', () => {
    nav.setAuthStatus('AUTHENTICATED');

    nav.navigateTab('Profile');
    expect(nav.getCurrentTab()).toBe('Profile');

    const handledProfile = nav.goBack();
    expect(handledProfile).toBe(true);
    expect(nav.getCurrentTab()).toBe('Home');

    nav.navigateTab('Train');
    expect(nav.getCurrentTab()).toBe('Train');

    const handledTrain = nav.goBack();
    expect(handledTrain).toBe(true);
    expect(nav.getCurrentTab()).toBe('Home');

    // On Home, goBack() returns false to allow normal Android back exit
    const handledOnHome = nav.goBack();
    expect(handledOnHome).toBe(false);
  });

  it('should integrate with hardwareBackPress listener', () => {
    nav.setAuthStatus('AUTHENTICATED');
    nav.navigateTab('Fuel');

    // Register hardware back press listener linked to nav.goBack
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      return nav.goBack();
    });

    const handled = (BackHandler as any)._triggerBackPress();
    expect(handled).toBe(true);
    expect(nav.getCurrentTab()).toBe('Home');

    sub.remove();
  });

  it('should notify subscribers on navigation transitions', () => {
    const subscriber = vi.fn();
    const unsubscribe = nav.subscribe(subscriber);

    nav.navigateAuth('Register');
    expect(subscriber).toHaveBeenCalledTimes(1);

    nav.navigateTab('Train');
    expect(subscriber).toHaveBeenCalledTimes(2);

    unsubscribe();
    nav.navigateTab('Fuel');
    expect(subscriber).toHaveBeenCalledTimes(2);
  });
});

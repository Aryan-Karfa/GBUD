import { AuthRoute, MainTab } from './navigation.types';
import { AuthStatus } from '../auth/auth.types';

export class NavigationManager {
  private authScreen: AuthRoute = 'Login';
  private currentTab: MainTab = 'Home';
  private authStatus: AuthStatus = 'UNAUTHENTICATED';
  private listeners: Set<() => void> = new Set();

  public getAuthScreen(): AuthRoute {
    return this.authScreen;
  }

  public getCurrentTab(): MainTab {
    return this.currentTab;
  }

  public setAuthStatus(status: AuthStatus): void {
    this.authStatus = status;
  }

  public navigateAuth(screen: AuthRoute): void {
    if (this.authScreen !== screen) {
      this.authScreen = screen;
      this.notify();
    }
  }

  public navigateTab(tab: MainTab): void {
    if (this.currentTab !== tab) {
      this.currentTab = tab;
      this.notify();
    }
  }

  public goBack(): boolean {
    if (this.authStatus === 'UNAUTHENTICATED') {
      if (this.authScreen === 'Register') {
        this.authScreen = 'Login';
        this.notify();
        return true;
      }
      return false; // On Login, let Android handle default back/exit
    }

    if (this.authStatus === 'AUTHENTICATED') {
      if (this.currentTab !== 'Home') {
        this.currentTab = 'Home';
        this.notify();
        return true;
      }
      return false; // On Home, let Android handle default back/exit
    }

    return false;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public reset(): void {
    this.authScreen = 'Login';
    this.currentTab = 'Home';
    this.authStatus = 'UNAUTHENTICATED';
    this.notify();
  }
}

export const navigationManager = new NavigationManager();

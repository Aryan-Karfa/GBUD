import {
  AuthRoute,
  MainTab,
  TrainScreen,
  TrainRouteParams,
  FuelScreen,
  FuelRouteParams,
  ProgressScreen,
  ProgressRouteParams,
} from './navigation.types';
import { AuthStatus } from '../auth/auth.types';

export interface TrainStackEntry {
  screen: TrainScreen;
  params?: any;
}

export interface FuelStackEntry {
  screen: FuelScreen;
  params?: any;
}

export interface ProgressStackEntry {
  screen: ProgressScreen;
  params?: any;
}

export class NavigationManager {
  private authScreen: AuthRoute = 'Login';
  private currentTab: MainTab = 'Home';
  private authStatus: AuthStatus = 'UNAUTHENTICATED';
  private trainStack: TrainStackEntry[] = [{ screen: 'TrainHome', params: {} }];
  private fuelStack: FuelStackEntry[] = [{ screen: 'FuelHome', params: {} }];
  private progressStack: ProgressStackEntry[] = [{ screen: 'ProgressHome', params: {} }];
  private backInterceptor: (() => boolean) | null = null;
  private listeners: Set<() => void> = new Set();

  public getAuthScreen(): AuthRoute {
    return this.authScreen;
  }

  public getCurrentTab(): MainTab {
    return this.currentTab;
  }

  public getTrainScreen(): TrainScreen {
    const current = this.trainStack[this.trainStack.length - 1];
    return current?.screen || 'TrainHome';
  }

  public getTrainParams(): any {
    const current = this.trainStack[this.trainStack.length - 1];
    return current?.params || {};
  }

  public getFuelScreen(): FuelScreen {
    const current = this.fuelStack[this.fuelStack.length - 1];
    return current?.screen || 'FuelHome';
  }

  public getFuelParams(): any {
    const current = this.fuelStack[this.fuelStack.length - 1];
    return current?.params || {};
  }

  public getProgressScreen(): ProgressScreen {
    const current = this.progressStack[this.progressStack.length - 1];
    return current?.screen || 'ProgressHome';
  }

  public getProgressParams(): any {
    const current = this.progressStack[this.progressStack.length - 1];
    return current?.params || {};
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

  public navigateTrain<T extends TrainScreen>(screen: T, params?: TrainRouteParams[T]): void {
    this.currentTab = 'Train';
    if (screen === 'TrainHome') {
      this.trainStack = [{ screen: 'TrainHome', params: params || {} }];
    } else {
      this.trainStack.push({ screen, params: params || {} });
    }
    this.notify();
  }

  public navigateFuel<T extends FuelScreen>(screen: T, params?: FuelRouteParams[T]): void {
    this.currentTab = 'Fuel';
    if (screen === 'FuelHome') {
      this.fuelStack = [{ screen: 'FuelHome', params: params || {} }];
    } else {
      this.fuelStack.push({ screen, params: params || {} });
    }
    this.notify();
  }

  public navigateProgress<T extends ProgressScreen>(screen: T, params?: ProgressRouteParams[T]): void {
    this.currentTab = 'Progress';
    if (screen === 'ProgressHome') {
      this.progressStack = [{ screen: 'ProgressHome', params: params || {} }];
    } else {
      this.progressStack.push({ screen, params: params || {} });
    }
    this.notify();
  }

  public registerBackInterceptor(interceptor: (() => boolean) | null): void {
    this.backInterceptor = interceptor;
  }

  public goBack(): boolean {
    // 1. Check back interceptor first
    if (this.backInterceptor) {
      const handled = this.backInterceptor();
      if (handled) {
        return true;
      }
    }

    // 2. Unauthenticated flows
    if (this.authStatus === 'UNAUTHENTICATED') {
      if (this.authScreen === 'Register') {
        this.authScreen = 'Login';
        this.notify();
        return true;
      }
      return false; // On Login, let Android handle default back/exit
    }

    // 3. Authenticated flows
    if (this.authStatus === 'AUTHENTICATED') {
      // In Train tab: pop sub-screens
      if (this.currentTab === 'Train') {
        if (this.trainStack.length > 1) {
          this.trainStack.pop();
          this.notify();
          return true;
        }
        // If at root of Train (TrainHome), back goes to Home tab
        this.currentTab = 'Home';
        this.notify();
        return true;
      }

      // In Fuel tab: pop sub-screens
      if (this.currentTab === 'Fuel') {
        if (this.fuelStack.length > 1) {
          this.fuelStack.pop();
          this.notify();
          return true;
        }
        // If at root of Fuel (FuelHome), back goes to Home tab
        this.currentTab = 'Home';
        this.notify();
        return true;
      }

      // In Progress tab: pop sub-screens
      if (this.currentTab === 'Progress') {
        if (this.progressStack.length > 1) {
          this.progressStack.pop();
          this.notify();
          return true;
        }
        // If at root of Progress (ProgressHome), back goes to Home tab
        this.currentTab = 'Home';
        this.notify();
        return true;
      }

      // In any other non-Home tab: back goes to Home
      if (this.currentTab !== 'Home') {
        this.currentTab = 'Home';
        this.notify();
        return true;
      }

      // On Home, let Android handle default back/exit
      return false;
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
    this.trainStack = [{ screen: 'TrainHome', params: {} }];
    this.fuelStack = [{ screen: 'FuelHome', params: {} }];
    this.progressStack = [{ screen: 'ProgressHome', params: {} }];
    this.backInterceptor = null;
    this.notify();
  }
}

export const navigationManager = new NavigationManager();

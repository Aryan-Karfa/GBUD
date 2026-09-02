import { TrainScreen, TrainRouteParams } from '../features/train/train.types';
import { FuelScreen, FuelRouteParams } from '../features/fuel/fuel.types';

export type AuthRoute = 'Login' | 'Register';
export type MainTab = 'Home' | 'Train' | 'Fuel' | 'Progress' | 'Profile';

export type { TrainScreen, TrainRouteParams, FuelScreen, FuelRouteParams };

export interface NavigationContextType {
  authScreen: AuthRoute;
  currentTab: MainTab;
  trainScreen: TrainScreen;
  trainParams: any;
  fuelScreen: FuelScreen;
  fuelParams: any;
  navigateAuth: (screen: AuthRoute) => void;
  navigateTab: (tab: MainTab) => void;
  navigateTrain: <T extends TrainScreen>(screen: T, params?: TrainRouteParams[T]) => void;
  navigateFuel: <T extends FuelScreen>(screen: T, params?: FuelRouteParams[T]) => void;
  goBack: () => boolean;
  registerBackInterceptor: (interceptor: (() => boolean) | null) => void;
}

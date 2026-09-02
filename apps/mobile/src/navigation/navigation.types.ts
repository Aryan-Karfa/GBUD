import { TrainScreen, TrainRouteParams } from '../features/train/train.types';
import { FuelScreen, FuelRouteParams } from '../features/fuel/fuel.types';
import { ProgressScreen, ProgressRouteParams } from '../features/progress/progress.types';

export type AuthRoute = 'Login' | 'Register';
export type MainTab = 'Home' | 'Train' | 'Fuel' | 'Progress' | 'Profile';

export type {
  TrainScreen,
  TrainRouteParams,
  FuelScreen,
  FuelRouteParams,
  ProgressScreen,
  ProgressRouteParams,
};

export interface NavigationContextType {
  authScreen: AuthRoute;
  currentTab: MainTab;
  trainScreen: TrainScreen;
  trainParams: any;
  fuelScreen: FuelScreen;
  fuelParams: any;
  progressScreen: ProgressScreen;
  progressParams: any;
  navigateAuth: (screen: AuthRoute) => void;
  navigateTab: (tab: MainTab) => void;
  navigateTrain: <T extends TrainScreen>(screen: T, params?: TrainRouteParams[T]) => void;
  navigateFuel: <T extends FuelScreen>(screen: T, params?: FuelRouteParams[T]) => void;
  navigateProgress: <T extends ProgressScreen>(screen: T, params?: ProgressRouteParams[T]) => void;
  goBack: () => boolean;
  registerBackInterceptor: (interceptor: (() => boolean) | null) => void;
}


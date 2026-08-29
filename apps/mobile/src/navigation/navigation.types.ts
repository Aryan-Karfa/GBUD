export type AuthRoute = 'Login' | 'Register';
export type MainTab = 'Home' | 'Train' | 'Fuel' | 'Progress' | 'Profile';

export interface NavigationContextType {
  authScreen: AuthRoute;
  currentTab: MainTab;
  navigateAuth: (screen: AuthRoute) => void;
  navigateTab: (tab: MainTab) => void;
  goBack: () => boolean;
}

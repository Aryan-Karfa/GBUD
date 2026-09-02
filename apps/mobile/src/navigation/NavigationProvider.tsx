import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { BackHandler } from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import {
  AuthRoute,
  MainTab,
  TrainScreen,
  TrainRouteParams,
  FuelScreen,
  FuelRouteParams,
  NavigationContextType,
} from './navigation.types';
import { navigationManager } from './navigation.manager';

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthRoute>(() => navigationManager.getAuthScreen());
  const [currentTab, setCurrentTab] = useState<MainTab>(() => navigationManager.getCurrentTab());
  const [trainScreen, setTrainScreen] = useState<TrainScreen>(() => navigationManager.getTrainScreen());
  const [trainParams, setTrainParams] = useState<any>(() => navigationManager.getTrainParams());
  const [fuelScreen, setFuelScreen] = useState<FuelScreen>(() => navigationManager.getFuelScreen());
  const [fuelParams, setFuelParams] = useState<any>(() => navigationManager.getFuelParams());

  // Sync auth status with navigation manager
  useEffect(() => {
    navigationManager.setAuthStatus(status);
  }, [status]);

  // Subscribe to navigation manager state updates
  useEffect(() => {
    const unsubscribe = navigationManager.subscribe(() => {
      setAuthScreen(navigationManager.getAuthScreen());
      setCurrentTab(navigationManager.getCurrentTab());
      setTrainScreen(navigationManager.getTrainScreen());
      setTrainParams(navigationManager.getTrainParams());
      setFuelScreen(navigationManager.getFuelScreen());
      setFuelParams(navigationManager.getFuelParams());
    });
    return unsubscribe;
  }, []);

  const navigateAuth = useCallback((screen: AuthRoute) => {
    navigationManager.navigateAuth(screen);
  }, []);

  const navigateTab = useCallback((tab: MainTab) => {
    navigationManager.navigateTab(tab);
  }, []);

  const navigateTrain = useCallback(
    <T extends TrainScreen>(screen: T, params?: TrainRouteParams[T]) => {
      navigationManager.navigateTrain(screen, params);
    },
    []
  );

  const navigateFuel = useCallback(
    <T extends FuelScreen>(screen: T, params?: FuelRouteParams[T]) => {
      navigationManager.navigateFuel(screen, params);
    },
    []
  );

  const registerBackInterceptor = useCallback(
    (interceptor: (() => boolean) | null) => {
      navigationManager.registerBackInterceptor(interceptor);
    },
    []
  );

  const goBack = useCallback((): boolean => {
    return navigationManager.goBack();
  }, []);

  useEffect(() => {
    const onHardwareBackPress = () => {
      return navigationManager.goBack();
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onHardwareBackPress
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        authScreen,
        currentTab,
        trainScreen,
        trainParams,
        fuelScreen,
        fuelParams,
        navigateAuth,
        navigateTab,
        navigateTrain,
        navigateFuel,
        goBack,
        registerBackInterceptor,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

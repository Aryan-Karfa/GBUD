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
import { AuthRoute, MainTab, NavigationContextType } from './navigation.types';
import { navigationManager } from './navigation.manager';

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthRoute>(() => navigationManager.getAuthScreen());
  const [currentTab, setCurrentTab] = useState<MainTab>(() => navigationManager.getCurrentTab());

  // Sync auth status with navigation manager
  useEffect(() => {
    navigationManager.setAuthStatus(status);
  }, [status]);

  // Subscribe to navigation manager state updates
  useEffect(() => {
    const unsubscribe = navigationManager.subscribe(() => {
      setAuthScreen(navigationManager.getAuthScreen());
      setCurrentTab(navigationManager.getCurrentTab());
    });
    return unsubscribe;
  }, []);

  const navigateAuth = useCallback((screen: AuthRoute) => {
    navigationManager.navigateAuth(screen);
  }, []);

  const navigateTab = useCallback((tab: MainTab) => {
    navigationManager.navigateTab(tab);
  }, []);

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
        navigateAuth,
        navigateTab,
        goBack,
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

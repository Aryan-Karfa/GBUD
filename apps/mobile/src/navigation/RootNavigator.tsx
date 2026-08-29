import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { AppBootstrap } from '../app/AppBootstrap';

export const RootNavigator: React.FC = () => {
  const { status } = useAuth();

  switch (status) {
    case 'BOOTSTRAPPING':
      return <AppBootstrap />;
    case 'UNAUTHENTICATED':
      return <AuthNavigator />;
    case 'AUTHENTICATED':
      return <MainNavigator />;
    default:
      return <AppBootstrap />;
  }
};

import React from 'react';
import { useNavigation } from './NavigationProvider';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

export const AuthNavigator: React.FC = () => {
  const { authScreen } = useNavigation();

  if (authScreen === 'Register') {
    return <RegisterScreen />;
  }

  return <LoginScreen />;
};

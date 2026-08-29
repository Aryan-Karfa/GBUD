import React, { ReactNode } from 'react';
import { AuthProvider } from '../auth/AuthProvider';
import { NavigationProvider } from '../navigation/NavigationProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <NavigationProvider>{children}</NavigationProvider>
    </AuthProvider>
  );
}

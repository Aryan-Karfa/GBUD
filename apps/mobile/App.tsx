import React from 'react';
import { StatusBar } from 'react-native';
import { AppProviders } from './src/app/AppProviders';
import { RootNavigator } from './src/navigation/RootNavigator';
import { theme } from './src/theme/theme';

export default function App() {
  return (
    <AppProviders>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background.primary}
        translucent={false}
      />
      <RootNavigator />
    </AppProviders>
  );
}

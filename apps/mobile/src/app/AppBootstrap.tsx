import React from 'react';
import { LoadingScreen } from '../components/feedback/LoadingScreen';

export const AppBootstrap: React.FC = () => {
  return <LoadingScreen message="Initializing GBUD..." testID="app-bootstrap" />;
};

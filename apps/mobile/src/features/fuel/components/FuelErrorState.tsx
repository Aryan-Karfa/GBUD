import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ErrorState } from '../../../components/feedback/ErrorState';

export interface FuelErrorStateProps {
  error: string;
  onRetry?: () => void;
  title?: string;
  testID?: string;
}

export const FuelErrorState: React.FC<FuelErrorStateProps> = ({
  error,
  onRetry,
  title = 'Nutrition Data Unavailable',
  testID = 'fuel-error-state',
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <ErrorState
        message={error}
        title={title}
        onRetry={onRetry}
        retryLabel="Try Again"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
  },
});

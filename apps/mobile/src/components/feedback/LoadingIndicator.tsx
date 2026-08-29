import React from 'react';
import { ActivityIndicator, View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';

export interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle | ViewStyle[];
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'small',
  color = theme.colors.brand.emerald,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
  },
});

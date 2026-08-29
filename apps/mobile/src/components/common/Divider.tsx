import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';

export interface DividerProps {
  color?: string;
  marginVertical?: number;
  style?: ViewStyle | ViewStyle[];
}

export const Divider: React.FC<DividerProps> = ({
  color = theme.colors.borders.border,
  marginVertical = theme.spacing.md,
  style,
}) => {
  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: color,
          marginVertical,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});

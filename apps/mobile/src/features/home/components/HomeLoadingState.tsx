import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, LoadingIndicator, Text } from '../../../components';
import { theme } from '../../../theme/theme';

export interface HomeLoadingStateProps {
  style?: object;
}

export const HomeLoadingState: React.FC<HomeLoadingStateProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]} testID="home-loading-state">
      <Card elevation="elevation2" style={styles.card}>
        <LoadingIndicator size="large" />
        <Text variant="caption" color={theme.colors.text.muted} align="center" style={styles.text}>
          Loading your daily dashboard...
        </Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.xl,
  },
  card: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.lg,
  },
  text: {
    marginTop: theme.spacing.md,
  },
});

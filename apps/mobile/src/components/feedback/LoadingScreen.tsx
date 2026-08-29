import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../theme/theme';
import { Text } from '../common/Text';

export interface LoadingScreenProps {
  message?: string;
  testID?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  testID = 'loading-screen',
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.content}>
        <Text variant="hero" weight="heavy" color={theme.colors.brand.emerald} style={styles.logo}>
          GBUD
        </Text>
        <Text variant="caption" weight="medium" color={theme.colors.text.secondary} style={styles.tagline}>
          TRAIN • FUEL • PROGRESS
        </Text>
        <ActivityIndicator
          size="large"
          color={theme.colors.brand.emerald}
          style={styles.spinner}
        />
        {message ? (
          <Text variant="body" color={theme.colors.text.muted} align="center" style={styles.message}>
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 320,
  },
  logo: {
    letterSpacing: 4,
    marginBottom: theme.spacing.xs,
  },
  tagline: {
    letterSpacing: 2,
    marginBottom: theme.spacing.xl,
  },
  spinner: {
    marginVertical: theme.spacing.md,
  },
  message: {
    marginTop: theme.spacing.sm,
  },
});

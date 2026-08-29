import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen, Text, Card, Button } from '../../components';
import { useNavigation } from '../../navigation/NavigationProvider';
import { theme } from '../../theme/theme';

export const TrainPlaceholderScreen: React.FC = () => {
  const { navigateTab } = useNavigation();

  return (
    <Screen padding="lg" testID="train-placeholder-screen">
      <View style={styles.header}>
        <View style={styles.tag}>
          <Text variant="caption" weight="bold" color={theme.colors.brand.emerald}>
            PHASE 10
          </Text>
        </View>
        <Text variant="heading" weight="bold" style={styles.title}>
          TRAIN Experience
        </Text>
        <Text variant="caption" color={theme.colors.text.secondary}>
          Workout Planning & Live Execution
        </Text>
      </View>

      <Card elevation="elevation4" style={styles.infoCard}>
        <Text style={styles.icon}>🏋️</Text>
        <Text variant="subheading" weight="bold" align="center" style={styles.cardTitle}>
          Coming in Phase 10
        </Text>
        <Text variant="body" color={theme.colors.text.secondary} align="center" style={styles.description}>
          The complete Android workout experience will include routine templates, exercise catalogs, real-time set and rep tracking, rest timers, and personal record tracking.
        </Text>

        <View style={styles.featureList}>
          <Text variant="caption" color={theme.colors.text.muted} style={styles.featureItem}>
            • Workout template builder & editor
          </Text>
          <Text variant="caption" color={theme.colors.text.muted} style={styles.featureItem}>
            • Live workout session execution
          </Text>
          <Text variant="caption" color={theme.colors.text.muted} style={styles.featureItem}>
            • Comprehensive exercise library
          </Text>
          <Text variant="caption" color={theme.colors.text.muted} style={styles.featureItem}>
            • Set logging with RPE & rest intervals
          </Text>
        </View>

        <Button
          label="Back to Home"
          onPress={() => navigateTab('Home')}
          variant="secondary"
          size="md"
          style={styles.homeButton}
          testID="train-back-to-home"
        />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs,
  },
  title: {
    marginBottom: theme.spacing.xs / 2,
  },
  infoCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  icon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    marginBottom: theme.spacing.sm,
  },
  description: {
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  featureList: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.xl,
  },
  featureItem: {
    marginVertical: theme.spacing.xs / 2,
  },
  homeButton: {
    marginTop: theme.spacing.xs,
  },
});

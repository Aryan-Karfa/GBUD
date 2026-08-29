import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen, Text, Card, Button } from '../../components';
import { useNavigation } from '../../navigation/NavigationProvider';
import { theme } from '../../theme/theme';

export const FuelPlaceholderScreen: React.FC = () => {
  const { navigateTab } = useNavigation();

  return (
    <Screen padding="lg" testID="fuel-placeholder-screen">
      <View style={styles.header}>
        <View style={styles.tag}>
          <Text variant="caption" weight="bold" color={theme.colors.brand.amber}>
            PHASE 11
          </Text>
        </View>
        <Text variant="heading" weight="bold" style={styles.title}>
          FUEL Experience
        </Text>
        <Text variant="caption" color={theme.colors.text.secondary}>
          Nutrition, Meal Tracking & Macro Targets
        </Text>
      </View>

      <Card elevation="elevation4" style={styles.infoCard}>
        <Text style={styles.icon}>🥗</Text>
        <Text variant="subheading" weight="bold" align="center" style={styles.cardTitle}>
          Coming in Phase 11
        </Text>
        <Text variant="body" color={theme.colors.text.secondary} align="center" style={styles.description}>
          The complete Android nutrition experience will feature verified food catalogs, meal logs with quantity-scaled snapshots, daily caloric & macro intake summaries, and time-based targets.
        </Text>

        <View style={styles.featureList}>
          <Text variant="caption" color={theme.colors.text.muted} style={styles.featureItem}>
            • Verified system & custom food database
          </Text>
          <Text variant="caption" color={theme.colors.text.muted} style={styles.featureItem}>
            • Daily meal logging (Breakfast, Lunch, Dinner, Snacks)
          </Text>
          <Text variant="caption" color={theme.colors.text.muted} style={styles.featureItem}>
            • Quantity-scaled macro calculations
          </Text>
          <Text variant="caption" color={theme.colors.text.muted} style={styles.featureItem}>
            • Time-based nutrition targets & comparisons
          </Text>
        </View>

        <Button
          label="Back to Home"
          onPress={() => navigateTab('Home')}
          variant="secondary"
          size="md"
          style={styles.homeButton}
          testID="fuel-back-to-home"
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
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
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

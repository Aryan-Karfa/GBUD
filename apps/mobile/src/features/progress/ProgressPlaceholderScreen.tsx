import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen, Text, Card, Button } from '../../components';
import { useNavigation } from '../../navigation/NavigationProvider';
import { theme } from '../../theme/theme';

export const ProgressPlaceholderScreen: React.FC = () => {
  const { navigateTab } = useNavigation();

  return (
    <Screen padding="lg" testID="progress-placeholder-screen">
      <View style={styles.header}>
        <View style={styles.tag}>
          <Text variant="caption" weight="bold" color={theme.colors.brand.cyan}>
            PHASE 12
          </Text>
        </View>
        <Text variant="heading" weight="bold" style={styles.title}>
          PROGRESS Experience
        </Text>
        <Text variant="caption" color={theme.colors.text.secondary}>
          Strength Progression & Training Analytics
        </Text>
      </View>

      <Card elevation="elevation4" style={styles.infoCard}>
        <Text style={styles.icon}>📈</Text>
        <Text variant="subheading" weight="bold" align="center" style={styles.cardTitle}>
          Coming in Phase 12
        </Text>
        <Text variant="body" color={theme.colors.text.secondary} align="center" style={styles.description}>
          The complete Android analytics experience will deliver training volume trends, muscle group breakdowns, 1RM estimated progression, body composition metrics, and interactive charts.
        </Text>

        <View style={styles.featureList}>
          <Text variant="caption" color={theme.colors.text.muted} style={styles.featureItem}>
            • Volume and frequency trends over time
          </Text>
          <Text variant="caption" color={theme.colors.text.muted} style={styles.featureItem}>
            • Estimated 1RM calculation & PR timeline
          </Text>
          <Text variant="caption" color={theme.colors.text.muted} style={styles.featureItem}>
            • Muscle volume distribution charts
          </Text>
          <Text variant="caption" color={theme.colors.text.muted} style={styles.featureItem}>
            • Weight & body metric progression
          </Text>
        </View>

        <Button
          label="Back to Home"
          onPress={() => navigateTab('Home')}
          variant="secondary"
          size="md"
          style={styles.homeButton}
          testID="progress-back-to-home"
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
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
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

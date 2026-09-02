import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from '../../../components';
import { theme } from '../../../theme/theme';

export interface HomeEmptyStateProps {
  onStartTraining: () => void;
  onStartFuel: () => void;
  style?: object;
}

export const HomeEmptyState: React.FC<HomeEmptyStateProps> = ({
  onStartTraining,
  onStartFuel,
  style,
}) => {
  return (
    <View style={[styles.container, style]} testID="home-empty-state">
      <Card elevation="elevation2" style={styles.card}>
        <View style={styles.badge}>
          <Text variant="caption" weight="bold" color={theme.colors.brand.emerald}>
            GET STARTED
          </Text>
        </View>

        <Text variant="heading" weight="bold" color={theme.colors.text.primary} style={styles.title}>
          Welcome to GBUD
        </Text>
        <Text variant="caption" color={theme.colors.text.secondary} align="center" style={styles.description}>
          Your daily command center for structured strength training, calm nutrition tracking, and factual progression.
        </Text>

        <View style={styles.domainPillars}>
          <View style={styles.pillar}>
            <Text style={styles.pillarIcon}>🏋️</Text>
            <Text variant="body" weight="bold" color={theme.colors.text.primary}>
              TRAIN
            </Text>
            <Text variant="caption" color={theme.colors.text.muted} align="center">
              Build routines and log your lifts
            </Text>
          </View>

          <View style={styles.pillar}>
            <Text style={styles.pillarIcon}>🥗</Text>
            <Text variant="body" weight="bold" color={theme.colors.text.primary}>
              FUEL
            </Text>
            <Text variant="caption" color={theme.colors.text.muted} align="center">
              Log meals and track intake
            </Text>
          </View>

          <View style={styles.pillar}>
            <Text style={styles.pillarIcon}>📈</Text>
            <Text variant="body" weight="bold" color={theme.colors.text.primary}>
              PROGRESS
            </Text>
            <Text variant="caption" color={theme.colors.text.muted} align="center">
              Watch volume and PR milestones
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Button
            label="Start First Workout"
            variant="primary"
            size="md"
            onPress={onStartTraining}
            style={styles.primaryAction}
            testID="empty-start-training-btn"
          />
          <Button
            label="Log First Meal"
            variant="secondary"
            size="md"
            onPress={onStartFuel}
            style={styles.secondaryAction}
            testID="empty-start-fuel-btn"
          />
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  card: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderRadius: theme.radius.lg,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.radius.xs,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    marginBottom: theme.spacing.sm,
  },
  title: {
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  description: {
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
    maxWidth: 320,
  },
  domainPillars: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  pillar: {
    flex: 1,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    gap: 4,
  },
  pillarIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  actionsRow: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  primaryAction: {
    width: '100%',
  },
  secondaryAction: {
    width: '100%',
  },
});

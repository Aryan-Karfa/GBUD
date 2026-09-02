import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Card, Text, Button } from '../../../components';
import { theme } from '../../../theme/theme';
import { ProgressDashboardDTO } from '../home.types';

export interface ProgressHomeCardProps {
  dashboard: ProgressDashboardDTO | null;
  onViewProgress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ProgressHomeCard: React.FC<ProgressHomeCardProps> = ({
  dashboard,
  onViewProgress,
  style,
}) => {
  const summary = dashboard?.summary || null;
  const volume = dashboard?.totalVolume || null;
  const latestPR = dashboard?.prHighlights?.[0] || null;

  return (
    <Card elevation="elevation2" style={[styles.card, style as ViewStyle]} testID="progress-home-card">
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text variant="caption" weight="bold" color={theme.colors.brand.cyan} style={styles.badgeText}>
            PROGRESS
          </Text>
        </View>

        {summary && summary.completedWorkouts > 0 ? (
          <Text variant="caption" color={theme.colors.text.muted}>
            {summary.completedWorkouts} completed session{summary.completedWorkouts !== 1 ? 's' : ''}
          </Text>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text variant="subheading" weight="bold" color={theme.colors.text.primary} style={styles.title}>
          Training Progression
        </Text>

        {summary && (summary.completedWorkouts > 0 || (volume && volume.totalVolume > 0)) ? (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text variant="caption" color={theme.colors.text.muted}>
                TOTAL WORKLOAD
              </Text>
              <Text variant="subheading" weight="bold" color={theme.colors.brand.cyan} style={styles.statValue}>
                {volume ? volume.totalVolume.toLocaleString() : 0}{' '}
                <Text variant="caption" color={theme.colors.text.muted}>{volume?.unit || 'kg'}</Text>
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text variant="caption" color={theme.colors.text.muted}>
                TRAINING DAYS
              </Text>
              <Text variant="subheading" weight="bold" color={theme.colors.text.primary} style={styles.statValue}>
                {summary.trainingDays}
              </Text>
            </View>
          </View>
        ) : (
          <Text variant="caption" color={theme.colors.text.secondary} style={styles.subtitle}>
            Monitor total volume lifted, workout consistency, and personal records.
          </Text>
        )}

        {/* Latest PR Milestone Highlight */}
        {latestPR && (
          <View style={styles.prBox}>
            <Text variant="caption" weight="bold" color={theme.colors.brand.emerald} style={styles.prLabel}>
              RECENT PR MILESTONE
            </Text>
            <Text variant="body" weight="medium" color={theme.colors.text.primary} numberOfLines={1}>
              {latestPR.exerciseName}
            </Text>
            <Text variant="caption" color={theme.colors.text.secondary}>
              {latestPR.estimated1RM !== null
                ? `${latestPR.estimated1RM} kg (est. 1RM)`
                : `${latestPR.maxWeight} kg best weight`}
            </Text>
          </View>
        )}
      </View>

      <Button
        label="View Progress →"
        variant="secondary"
        size="md"
        onPress={onViewProgress}
        style={styles.viewButton}
        testID="view-progress-btn"
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.radius.xs,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
  },
  badgeText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  content: {
    marginBottom: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginVertical: theme.spacing.xs,
  },
  statBox: {
    flex: 1,
  },
  statValue: {
    marginTop: theme.spacing.xs / 4,
  },
  prBox: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    gap: 2,
  },
  prLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  viewButton: {
    width: '100%',
  },
});

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Screen, Text, Card, Button, LoadingIndicator } from '../../../components';
import { theme } from '../../../theme/theme';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useExercisePerformance } from '../hooks/useExercisePerformance';
import {
  ExercisePerformanceCard,
  ExerciseSelector,
  ProgressSectionHeader,
  ProgressErrorState,
} from '../components';

export const ExercisePerformanceScreen: React.FC = () => {
  const { navigateProgress, progressParams } = useNavigation();
  const [selectorVisible, setSelectorVisible] = useState(!progressParams?.exerciseId);

  const {
    selectedExerciseId,
    selectedExerciseName,
    performance,
    loading,
    error,
    selectExercise,
    refresh,
  } = useExercisePerformance({
    initialExerciseId: progressParams?.exerciseId,
    initialExerciseName: progressParams?.exerciseName,
  });

  return (
    <Screen padding="md" testID="exercise-performance-screen">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={theme.colors.brand.emerald}
            colors={[theme.colors.brand.emerald]}
          />
        }
      >
        <View style={styles.header}>
          <Text variant="heading" weight="bold" color={theme.colors.text.primary} style={styles.title}>
            Exercise Performance
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            In-depth movement progression & session history
          </Text>
        </View>

        {/* Selected Exercise Banner */}
        <TouchableOpacity
          style={styles.selectorTrigger}
          onPress={() => setSelectorVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Change selected exercise"
        >
          <Card elevation="elevation2" style={styles.selectorCard}>
            <View style={styles.selectorRow}>
              <View>
                <Text variant="caption" color={theme.colors.text.muted}>
                  SELECTED MOVEMENT
                </Text>
                <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
                  {selectedExerciseName || 'Select an exercise'}
                </Text>
              </View>
              <Text variant="caption" weight="bold" color={theme.colors.brand.emerald}>
                Change ▾
              </Text>
            </View>
          </Card>
        </TouchableOpacity>

        <ExerciseSelector
          visible={selectorVisible}
          onSelect={(id, name) => selectExercise(id, name)}
          onClose={() => setSelectorVisible(false)}
        />

        {error && <ProgressErrorState error={error} onRetry={refresh} />}

        {!selectedExerciseId ? (
          <View style={styles.placeholderContainer}>
            <Text variant="body" color={theme.colors.text.muted} align="center">
              Please choose an exercise to review performance analytics.
            </Text>
            <Button
              label="Select Exercise"
              variant="primary"
              size="md"
              onPress={() => setSelectorVisible(true)}
              style={styles.chooseBtn}
            />
          </View>
        ) : loading && !performance ? (
          <View style={styles.loaderContainer}>
            <LoadingIndicator size="large" />
          </View>
        ) : performance ? (
          <>
            <ExercisePerformanceCard performance={performance} style={styles.card} />

            <View style={styles.trendActionRow}>
              <Button
                label="View Progression Trend Chart →"
                variant="secondary"
                size="md"
                onPress={() =>
                  navigateProgress('ExerciseTrend', {
                    exerciseId: selectedExerciseId,
                    exerciseName: selectedExerciseName || performance.exercise.name,
                  })
                }
              />
            </View>

            {performance.recent && performance.recent.length > 0 && (
              <View style={styles.recentSection}>
                <ProgressSectionHeader title="Recent Sessions with Movement" />
                {performance.recent.map((session, idx) => (
                  <Card key={`${session.id}-${idx}`} elevation="elevation2" style={styles.sessionCard}>
                    <View style={styles.sessionHeader}>
                      <Text variant="body" weight="bold" color={theme.colors.text.primary}>
                        Workout Session
                      </Text>
                      <Text variant="caption" color={theme.colors.text.muted}>
                        {session.startedAt ? session.startedAt.slice(0, 10) : ''}
                      </Text>
                    </View>
                    <Text variant="caption" color={theme.colors.text.secondary}>
                      Status: {session.status}
                    </Text>
                  </Card>
                ))}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs / 2,
  },
  selectorTrigger: {
    marginBottom: theme.spacing.lg,
  },
  selectorCard: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholderContainer: {
    paddingVertical: theme.spacing.xxl,
    alignItems: 'center',
  },
  chooseBtn: {
    marginTop: theme.spacing.md,
  },
  loaderContainer: {
    paddingVertical: theme.spacing.xxl,
    alignItems: 'center',
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  trendActionRow: {
    marginBottom: theme.spacing.lg,
  },
  recentSection: {
    marginBottom: theme.spacing.lg,
  },
  sessionCard: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.xs,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs / 2,
  },
});

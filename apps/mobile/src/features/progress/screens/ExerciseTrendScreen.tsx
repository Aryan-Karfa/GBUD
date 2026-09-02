import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Screen, Text, Card, Button, LoadingIndicator } from '../../../components';
import { theme } from '../../../theme/theme';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useExercisePerformance } from '../hooks/useExercisePerformance';
import { ExerciseTrendChart, ExerciseSelector, ProgressErrorState } from '../components';

export const ExerciseTrendScreen: React.FC = () => {
  const { progressParams } = useNavigation();
  const [selectorVisible, setSelectorVisible] = useState(!progressParams?.exerciseId);

  const {
    selectedExerciseId,
    selectedExerciseName,
    trendPoints,
    loading,
    error,
    selectExercise,
    refresh,
  } = useExercisePerformance({
    initialExerciseId: progressParams?.exerciseId,
    initialExerciseName: progressParams?.exerciseName,
  });

  return (
    <Screen padding="md" testID="exercise-trend-screen">
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
            Exercise Trend
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            Longitudinal progression curves for strength & estimated 1RM
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
              Please choose an exercise to review historical progression trends.
            </Text>
            <Button
              label="Select Exercise"
              variant="primary"
              size="md"
              onPress={() => setSelectorVisible(true)}
              style={styles.chooseBtn}
            />
          </View>
        ) : loading && trendPoints.length === 0 ? (
          <View style={styles.loaderContainer}>
            <LoadingIndicator size="large" />
          </View>
        ) : (
          <ExerciseTrendChart
            points={trendPoints}
            exerciseName={selectedExerciseName || undefined}
            style={styles.chartCard}
          />
        )}
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
  chartCard: {
    marginBottom: theme.spacing.lg,
  },
});

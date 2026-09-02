import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useExercises } from '../hooks/useExercises';
import { ExerciseDTO } from '../train.types';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/layout/Card';
import { Text } from '../../../components/common/Text';
import { MuscleGroupBadge } from '../components/MuscleGroupBadge';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { theme } from '../../../theme/theme';

export const ExerciseDetailScreen: React.FC = () => {
  const { trainParams, goBack } = useNavigation();
  const exerciseId = trainParams?.exerciseId;
  const { getExerciseById } = useExercises({ autoFetch: false });

  const [exercise, setExercise] = useState<ExerciseDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!exerciseId) {
      setError('Exercise ID is required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getExerciseById(exerciseId)
      .then((data) => {
        if (isMounted) {
          if (data) {
            setExercise(data);
          } else {
            setError('Exercise not found');
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load exercise details');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [exerciseId, getExerciseById]);

  return (
    <Screen scrollable={true} testID="exercise-detail-screen">
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => goBack()} style={styles.backButton} testID="exercise-detail-back">
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text variant="heading" style={styles.headerTitle} numberOfLines={1}>
            Exercise Details
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <LoadingIndicator />
            <Text variant="caption" color={theme.colors.text.muted} style={{ marginTop: 8 }}>
              Loading exercise details...
            </Text>
          </View>
        ) : error || !exercise ? (
          <View style={styles.center}>
            <ErrorState message={error || 'Exercise not found'} onRetry={() => goBack()} />
          </View>
        ) : (
          <View style={styles.content}>
            {/* Title Card */}
            <Card style={styles.card}>
              <View style={styles.titleRow}>
                <Text variant="title" style={styles.title}>
                  {exercise.name}
                </Text>
                <MuscleGroupBadge muscleGroup={exercise.muscleGroup} />
              </View>

              <View style={styles.metaRow}>
                {exercise.equipment && (
                  <View style={styles.metaItem}>
                    <Text variant="caption" style={styles.metaLabel}>
                      EQUIPMENT
                    </Text>
                    <Text variant="body" style={styles.metaValue}>
                      {exercise.equipment}
                    </Text>
                  </View>
                )}

                {exercise.movementPattern && (
                  <View style={styles.metaItem}>
                    <Text variant="caption" style={styles.metaLabel}>
                      PATTERN
                    </Text>
                    <Text variant="body" style={styles.metaValue}>
                      {exercise.movementPattern}
                    </Text>
                  </View>
                )}

                {exercise.exerciseType && (
                  <View style={styles.metaItem}>
                    <Text variant="caption" style={styles.metaLabel}>
                      TYPE
                    </Text>
                    <Text variant="body" style={styles.metaValue}>
                      {exercise.exerciseType}
                    </Text>
                  </View>
                )}
              </View>
            </Card>

            {/* Description Card */}
            {exercise.description && (
              <Card style={styles.card}>
                <Text variant="heading" style={styles.sectionHeading}>
                  Description
                </Text>
                <Text variant="body" style={styles.bodyText}>
                  {exercise.description}
                </Text>
              </Card>
            )}

            {/* Instructions Card */}
            {exercise.instructions && (
              <Card style={styles.card}>
                <Text variant="heading" style={styles.sectionHeading}>
                  Instructions
                </Text>
                <Text variant="body" style={styles.bodyText}>
                  {exercise.instructions}
                </Text>
              </Card>
            )}
          </View>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  backButton: {
    paddingRight: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  backIcon: {
    fontSize: 22,
    color: theme.colors.text.primary,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
  },
  center: {
    paddingVertical: theme.spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: theme.spacing.sm,
  },
  card: {
    padding: theme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: theme.spacing.sm,
  },
  metaItem: {
    minWidth: 90,
  },
  metaLabel: {
    fontSize: 9,
    color: theme.colors.text.muted,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weights.semibold,
  },
  sectionHeading: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  bodyText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
});

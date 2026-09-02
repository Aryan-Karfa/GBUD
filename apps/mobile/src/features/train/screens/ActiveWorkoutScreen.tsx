import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useWorkoutSession } from '../hooks/useWorkoutSession';
import { WorkoutProgressHeader } from '../components/WorkoutProgressHeader';
import { WorkoutExerciseRow } from '../components/WorkoutExerciseRow';
import { WorkoutActionBar } from '../components/WorkoutActionBar';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/layout/Card';
import { Text } from '../../../components/common/Text';
import { Button } from '../../../components/common/Button';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { theme } from '../../../theme/theme';

export const ActiveWorkoutScreen: React.FC = () => {
  const { trainParams, navigateTrain, registerBackInterceptor } = useNavigation();
  const targetSessionId = trainParams?.sessionId;

  const {
    session,
    isLoading,
    isMutating,
    error,
    fetchSession,
    checkActiveSession,
    addSet,
    updateSet,
    deleteSet,
    completeSession,
    abandonSession,
  } = useWorkoutSession({ autoCheckActive: !targetSessionId });

  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  // Load session
  useEffect(() => {
    if (targetSessionId) {
      fetchSession(targetSessionId);
    } else {
      checkActiveSession().then((active) => {
        if (active) {
          fetchSession(active.id);
        }
      });
    }
  }, [targetSessionId, fetchSession, checkActiveSession]);

  // Intercept Android hardware back button
  useEffect(() => {
    const handleBack = () => {
      setShowLeaveModal(true);
      return true; // prevent default exit/pop
    };

    registerBackInterceptor(handleBack);

    return () => {
      registerBackInterceptor(null);
    };
  }, [registerBackInterceptor]);

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    registerBackInterceptor(null);
    navigateTrain('TrainHome');
  };

  const handleComplete = async () => {
    if (!session) return;
    try {
      const completed = await completeSession(session.id);
      registerBackInterceptor(null);
      navigateTrain('WorkoutHistoryDetail', { sessionId: completed.id });
    } catch {
      // error is handled in hook
    }
  };

  const handleAbandon = async () => {
    if (!session) return;
    try {
      await abandonSession(session.id);
      registerBackInterceptor(null);
      navigateTrain('TrainHome');
    } catch {
      // error is handled in hook
    }
  };

  const sortedExercises = [...(session?.sessionExercises || [])].sort(
    (a, b) => a.order - b.order
  );

  const totalCompletedSets = sortedExercises.reduce(
    (acc, ex) => acc + (ex.sets?.length || 0),
    0
  );

  return (
    <Screen scrollable={false} testID="active-workout-screen">
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => setShowLeaveModal(true)}
            style={styles.backBtn}
            testID="active-workout-back-btn"
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text variant="heading" style={styles.topBarTitle} numberOfLines={1}>
            Live Workout
          </Text>
          <Button
            variant="ghost"
            size="sm"
            label="Leave"
            fullWidth={false}
            onPress={() => setShowLeaveModal(true)}
            testID="active-workout-leave-btn"
          />
        </View>

        {isLoading && !session ? (
          <View style={styles.center}>
            <LoadingIndicator />
            <Text variant="caption" color={theme.colors.text.muted} style={{ marginTop: 8 }}>
              Connecting to active session...
            </Text>
          </View>
        ) : error && !session ? (
          <View style={styles.center}>
            <ErrorState
              message={error}
              onRetry={() => {
                if (targetSessionId) fetchSession(targetSessionId);
                else checkActiveSession();
              }}
            />
          </View>
        ) : !session ? (
          <View style={styles.center}>
            <Card style={styles.noSessionCard}>
              <Text variant="title">No Active Workout</Text>
              <Text variant="body" style={styles.noSessionText}>
                You do not have an active workout in progress.
              </Text>
              <Button
                variant="primary"
                size="md"
                label="View Templates"
                onPress={() => navigateTrain('WorkoutTemplates')}
              />
            </Card>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Progress and Live Duration Header */}
              <WorkoutProgressHeader
                title="Current Session"
                startedAt={session.startedAt}
                exerciseCount={sortedExercises.length}
                completedSetsCount={totalCompletedSets}
                status={session.status}
              />

              {/* Error banner if set mutation fails */}
              {error && (
                <View style={styles.mutationErrorBanner}>
                  <Text variant="error" style={styles.mutationErrorText}>
                    {error}
                  </Text>
                </View>
              )}

              {/* Session Exercises and Sets */}
              {sortedExercises.map((exercise) => (
                <WorkoutExerciseRow
                  key={exercise.id}
                  sessionExercise={exercise}
                  readOnly={false}
                  isMutating={isMutating}
                  onAddSet={(values) => addSet(session.id, exercise.id, values)}
                  onUpdateSet={(setId, values) =>
                    updateSet(session.id, exercise.id, setId, values)
                  }
                  onDeleteSet={(setId) => deleteSet(session.id, exercise.id, setId)}
                  testID={`active-exercise-${exercise.id}`}
                />
              ))}
            </ScrollView>

            {/* Bottom Action Bar (Complete / Abandon) */}
            <WorkoutActionBar
              onComplete={handleComplete}
              onAbandon={handleAbandon}
              isCompleting={isMutating}
              isAbandoning={isMutating}
            />
          </>
        )}

        {/* Leave Workout Dialog */}
        <Modal
          visible={showLeaveModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLeaveModal(false)}
          testID="leave-workout-modal"
        >
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text variant="title" style={styles.modalTitle}>
                Leave Active Workout?
              </Text>
              <Text variant="body" style={styles.modalBody}>
                Your workout will remain active in progress. You can resume and continue
                logging sets at any time.
              </Text>
              <View style={styles.modalActions}>
                <Button
                  variant="primary"
                  size="md"
                  label="Stay"
                  fullWidth={false}
                  onPress={() => setShowLeaveModal(false)}
                  testID="leave-modal-stay-btn"
                />
                <Button
                  variant="outline"
                  size="md"
                  label="Leave"
                  fullWidth={false}
                  onPress={handleConfirmLeave}
                  testID="leave-modal-leave-btn"
                />
              </View>
            </Card>
          </View>
        </Modal>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: theme.spacing.sm,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borders.border,
  },
  backBtn: {
    paddingRight: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  backIcon: {
    fontSize: 22,
    color: theme.colors.text.primary,
  },
  topBarTitle: {
    flex: 1,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  noSessionCard: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  noSessionText: {
    marginVertical: theme.spacing.md,
    textAlign: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  mutationErrorBanner: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: theme.radius.sm,
  },
  mutationErrorText: {
    fontSize: theme.typography.sizes.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    width: '100%',
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  modalBody: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
});

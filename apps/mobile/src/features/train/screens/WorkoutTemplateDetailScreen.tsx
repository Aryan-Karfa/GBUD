import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useWorkoutTemplates } from '../hooks/useWorkoutTemplates';
import { useWorkoutSession } from '../hooks/useWorkoutSession';
import { WorkoutTemplateDTO } from '../train.types';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/layout/Card';
import { Text } from '../../../components/common/Text';
import { Button } from '../../../components/common/Button';
import { MuscleGroupBadge } from '../components/MuscleGroupBadge';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { theme } from '../../../theme/theme';

export const WorkoutTemplateDetailScreen: React.FC = () => {
  const { trainParams, navigateTrain, goBack } = useNavigation();
  const templateId = trainParams?.templateId;
  const { getTemplateById, deleteTemplate, isMutating } = useWorkoutTemplates({
    autoFetch: false,
  });
  const { startSession, activeSession } = useWorkoutSession({ autoCheckActive: false });

  const [template, setTemplate] = useState<WorkoutTemplateDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!templateId) {
      setError('Template ID is required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getTemplateById(templateId)
      .then((data) => {
        if (isMounted) {
          if (data) {
            setTemplate(data);
          } else {
            setError('Template not found');
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load template');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [templateId, getTemplateById]);

  const handleStartWorkout = async () => {
    if (!template) return;
    setIsStarting(true);
    setStartError(null);
    try {
      const session = await startSession(template.id);
      navigateTrain('ActiveWorkout', { sessionId: session.id });
    } catch (err: any) {
      if (err.status === 409 || err.code === 'CONFLICT') {
        setStartError('A workout is already in progress.');
      } else {
        setStartError(err.message || 'Failed to start workout');
      }
    } finally {
      setIsStarting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!template) return;
    setShowDeleteModal(false);
    try {
      await deleteTemplate(template.id);
      goBack();
    } catch (err: any) {
      setError(err.message || 'Failed to delete template');
    }
  };

  const sortedExercises = [...(template?.exercises || [])].sort(
    (a, b) => a.order - b.order
  );

  return (
    <Screen scrollable={true} testID="template-detail-screen">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => goBack()} style={styles.backButton} testID="template-detail-back">
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text variant="heading" style={styles.headerTitle} numberOfLines={1}>
            Template Details
          </Text>
          {template && (
            <Button
              variant="ghost"
              size="sm"
              label="Edit"
              fullWidth={false}
              onPress={() =>
                navigateTrain('WorkoutTemplateEditor', { templateId: template.id })
              }
              testID="template-detail-edit-btn"
            />
          )}
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <LoadingIndicator />
            <Text variant="caption" color={theme.colors.text.muted} style={{ marginTop: 8 }}>
              Loading template details...
            </Text>
          </View>
        ) : error || !template ? (
          <View style={styles.center}>
            <ErrorState message={error || 'Template not found'} onRetry={() => goBack()} />
          </View>
        ) : (
          <View style={styles.content}>
            {/* Template Info Card */}
            <Card style={styles.card}>
              <Text variant="title" style={styles.title}>
                {template.name}
              </Text>
              {template.description ? (
                <Text variant="body" style={styles.description}>
                  {template.description}
                </Text>
              ) : null}

              <View style={styles.metaRow}>
                <Text variant="caption" style={styles.exerciseCount}>
                  {sortedExercises.length}{' '}
                  {sortedExercises.length === 1 ? 'Exercise' : 'Exercises'}
                </Text>
              </View>

              {/* Start Workout CTA */}
              <View style={styles.startRow}>
                <Button
                  variant="primary"
                  size="md"
                  label="Start Workout"
                  onPress={handleStartWorkout}
                  isLoading={isStarting}
                  testID="start-from-detail-btn"
                />
              </View>

              {startError && (
                <View style={styles.conflictBanner}>
                  <Text variant="error" style={styles.conflictText}>
                    {startError}
                  </Text>
                  {activeSession && (
                    <Button
                      variant="outline"
                      size="sm"
                      label="Go to Active Workout"
                      fullWidth={false}
                      onPress={() =>
                        navigateTrain('ActiveWorkout', { sessionId: activeSession.id })
                      }
                      style={styles.conflictBtn}
                    />
                  )}
                </View>
              )}
            </Card>

            {/* Exercise List */}
            <Text variant="subheading" style={styles.sectionTitle}>
              Planned Exercises
            </Text>

            {sortedExercises.length === 0 ? (
              <Card style={styles.emptyExercisesCard}>
                <Text variant="muted" style={styles.emptyText}>
                  No exercises added to this template yet.
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  label="Add Exercises"
                  fullWidth={false}
                  onPress={() =>
                    navigateTrain('WorkoutTemplateEditor', { templateId: template.id })
                  }
                  style={{ marginTop: theme.spacing.sm }}
                />
              </Card>
            ) : (
              sortedExercises.map((e) => (
                <Card key={e.id} style={styles.exerciseCard} testID={`template-exercise-${e.id}`}>
                  <View style={styles.exerciseHeader}>
                    <View style={styles.orderBadge}>
                      <Text variant="caption" style={styles.orderText}>
                        #{e.order}
                      </Text>
                    </View>
                    <View style={styles.exerciseInfo}>
                      <Text variant="heading" style={styles.exerciseName}>
                        {e.exercise?.name || 'Exercise'}
                      </Text>
                      {e.notes ? (
                        <Text variant="muted" style={styles.exerciseNotes}>
                          {e.notes}
                        </Text>
                      ) : null}
                    </View>
                    <MuscleGroupBadge muscleGroup={e.exercise?.muscleGroup} size="sm" />
                  </View>
                </Card>
              ))
            )}

            {/* Danger Zone: Delete Template */}
            <View style={styles.dangerZone}>
              <Button
                variant="danger"
                size="sm"
                label="Delete Template"
                fullWidth={false}
                onPress={() => setShowDeleteModal(true)}
                disabled={isMutating}
                testID="delete-template-btn"
              />
            </View>
          </View>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
          testID="delete-template-modal"
        >
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text variant="title" style={styles.modalTitle}>
                Delete Workout Template?
              </Text>
              <Text variant="body" style={styles.modalBody}>
                Are you sure you want to delete "{template?.name}"? Existing logged workout
                history will not be affected.
              </Text>
              <View style={styles.modalActions}>
                <Button
                  variant="ghost"
                  size="md"
                  label="Cancel"
                  fullWidth={false}
                  onPress={() => setShowDeleteModal(false)}
                />
                <Button
                  variant="danger"
                  size="md"
                  label="Yes, Delete"
                  fullWidth={false}
                  onPress={handleConfirmDelete}
                  isLoading={isMutating}
                  testID="confirm-delete-template-btn"
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
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
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
    flex: 1,
  },
  center: {
    paddingVertical: theme.spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: theme.spacing.md,
  },
  card: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  exerciseCount: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.brand.emerald,
    fontWeight: theme.typography.weights.semibold,
  },
  startRow: {
    marginTop: theme.spacing.xs,
  },
  conflictBanner: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: theme.radius.sm,
  },
  conflictText: {
    fontSize: theme.typography.sizes.xs,
  },
  conflictBtn: {
    marginTop: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  emptyExercisesCard: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.sizes.sm,
  },
  exerciseCard: {
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  orderText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.brand.emerald,
  },
  exerciseInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  exerciseName: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
  },
  exerciseNotes: {
    fontSize: 11,
    marginTop: 2,
  },
  dangerZone: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'flex-start',
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

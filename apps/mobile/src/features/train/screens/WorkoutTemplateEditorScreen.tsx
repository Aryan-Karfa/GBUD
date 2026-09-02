import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useWorkoutTemplates } from '../hooks/useWorkoutTemplates';
import { ExerciseDTO, TemplateEditorExerciseItem } from '../train.types';
import { ExercisePicker } from '../components/ExercisePicker';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/layout/Card';
import { Text } from '../../../components/common/Text';
import { Input } from '../../../components/forms/Input';
import { Button } from '../../../components/common/Button';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { theme } from '../../../theme/theme';

export const WorkoutTemplateEditorScreen: React.FC = () => {
  const { trainParams, goBack, navigateTrain } = useNavigation();
  const templateId = trainParams?.templateId;
  const isEditMode = Boolean(templateId);

  const {
    getTemplateById,
    createTemplate,
    updateTemplate,
    reorderExercises,
    isMutating,
  } = useWorkoutTemplates({ autoFetch: false });

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [exercises, setExercises] = useState<TemplateEditorExerciseItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(isEditMode);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (templateId) {
      setIsLoading(true);
      getTemplateById(templateId)
        .then((t) => {
          if (t) {
            setName(t.name);
            setDescription(t.description || '');
            const sorted = [...(t.exercises || [])].sort((a, b) => a.order - b.order);
            setExercises(
              sorted.map((e) => ({
                exerciseId: e.exerciseId,
                exerciseName: e.exercise?.name || 'Exercise',
                muscleGroup: e.exercise?.muscleGroup,
                notes: e.notes || undefined,
              }))
            );
          }
          setIsLoading(false);
        })
        .catch((err) => {
          setApiError(err.message || 'Failed to load template');
          setIsLoading(false);
        });
    }
  }, [templateId, getTemplateById]);

  const handleAddExerciseFromPicker = (selected: ExerciseDTO) => {
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: selected.id,
        exerciseName: selected.name,
        muscleGroup: selected.muscleGroup,
      },
    ]);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setExercises((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= exercises.length - 1) return;
    setExercises((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleRemove = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setValidationError(null);
    setApiError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('Template name is required');
      return;
    }

    try {
      if (isEditMode && templateId) {
        // 1. Update name and description
        await updateTemplate(templateId, {
          name: trimmedName,
          description: description.trim() || undefined,
        });

        // 2. Sync exercises if modified
        if (exercises.length > 0) {
          const exerciseIds = exercises.map((e) => e.exerciseId);
          try {
            await reorderExercises(templateId, exerciseIds);
          } catch {
            // Reorder may fail if exercises differ, which is fine
          }
        }

        goBack();
      } else {
        // Create new template with exercises
        const created = await createTemplate(
          {
            name: trimmedName,
            description: description.trim() || undefined,
          },
          exercises.map((e) => ({
            exerciseId: e.exerciseId,
            notes: e.notes,
          }))
        );

        navigateTrain('WorkoutTemplateDetail', { templateId: created.id });
      }
    } catch (err: any) {
      setApiError(err.message || 'Failed to save workout template');
    }
  };

  return (
    <Screen scrollable={true} testID="template-editor-screen">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => goBack()} style={styles.backButton} testID="editor-back-btn">
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text variant="heading" style={styles.headerTitle}>
            {isEditMode ? 'Edit Template' : 'New Template'}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <LoadingIndicator />
            <Text variant="caption" color={theme.colors.text.muted} style={{ marginTop: 8 }}>
              Loading template...
            </Text>
          </View>
        ) : (
          <View style={styles.form}>
            {apiError && <ErrorState message={apiError} testID="editor-api-error" />}

            {/* Template Information */}
            <Card style={styles.card}>
              <Input
                label="Template Name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (validationError) setValidationError(null);
                }}
                placeholder="e.g. Upper Body Strength"
                error={validationError}
                testID="template-name-input"
              />

              <Input
                label="Description (Optional)"
                value={description}
                onChangeText={setDescription}
                placeholder="e.g. Heavy push/pull focus"
                multiline
                numberOfLines={2}
                testID="template-desc-input"
              />
            </Card>

            {/* Planned Exercises Section */}
            <View style={styles.exerciseHeader}>
              <Text variant="subheading" style={styles.sectionTitle}>
                Exercises ({exercises.length})
              </Text>
              <Button
                variant="outline"
                size="sm"
                label="+ Add Exercise"
                fullWidth={false}
                onPress={() => setShowPicker(true)}
                testID="editor-add-exercise-btn"
              />
            </View>

            {exercises.length === 0 ? (
              <Card style={styles.emptyExercisesCard}>
                <Text variant="muted" style={styles.emptyText}>
                  No exercises added yet. Tap "+ Add Exercise" to pick exercises from the catalog.
                </Text>
              </Card>
            ) : (
              exercises.map((item, idx) => (
                <Card key={`${item.exerciseId}-${idx}`} style={styles.exerciseCard} testID={`editor-exercise-${idx}`}>
                  <View style={styles.exerciseRow}>
                    <View style={styles.orderBadge}>
                      <Text variant="caption" style={styles.orderText}>
                        #{idx + 1}
                      </Text>
                    </View>
                    <View style={styles.exerciseInfo}>
                      <Text variant="heading" style={styles.exerciseName} numberOfLines={1}>
                        {item.exerciseName}
                      </Text>
                      {item.muscleGroup && (
                        <Text variant="caption" style={styles.exerciseMuscle}>
                          {item.muscleGroup}
                        </Text>
                      )}
                    </View>

                    {/* Move Up / Move Down Controls */}
                    <View style={styles.reorderControls}>
                      <TouchableOpacity
                        onPress={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        style={[styles.reorderBtn, idx === 0 && styles.reorderBtnDisabled]}
                        testID={`move-up-${idx}`}
                      >
                        <Text style={styles.reorderArrow}>▲</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleMoveDown(idx)}
                        disabled={idx === exercises.length - 1}
                        style={[
                          styles.reorderBtn,
                          idx === exercises.length - 1 && styles.reorderBtnDisabled,
                        ]}
                        testID={`move-down-${idx}`}
                      >
                        <Text style={styles.reorderArrow}>▼</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleRemove(idx)}
                        style={styles.removeBtn}
                        testID={`remove-exercise-${idx}`}
                      >
                        <Text style={styles.removeText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))
            )}

            {/* Save Button */}
            <View style={styles.saveSection}>
              <Button
                variant="primary"
                size="lg"
                label={isEditMode ? 'Save Changes' : 'Create Template'}
                onPress={handleSave}
                isLoading={isMutating}
                testID="editor-save-btn"
              />
            </View>
          </View>
        )}

        {/* Exercise Picker Modal */}
        <ExercisePicker
          visible={showPicker}
          onClose={() => setShowPicker(false)}
          onSelectExercise={handleAddExerciseFromPicker}
          excludedExerciseIds={exercises.map((e) => e.exerciseId)}
        />
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
  },
  center: {
    paddingVertical: theme.spacing.xxxl,
    alignItems: 'center',
  },
  form: {
    gap: theme.spacing.md,
  },
  card: {
    padding: theme.spacing.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
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
    textAlign: 'center',
  },
  exerciseCard: {
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  exerciseRow: {
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
  exerciseMuscle: {
    fontSize: 10,
    color: theme.colors.text.muted,
    marginTop: 2,
  },
  reorderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reorderBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderBtnDisabled: {
    opacity: 0.3,
  },
  reorderArrow: {
    fontSize: 10,
    color: theme.colors.text.secondary,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  removeText: {
    fontSize: 12,
    color: theme.colors.status.error,
    fontWeight: theme.typography.weights.bold,
  },
  saveSection: {
    marginTop: theme.spacing.lg,
  },
});

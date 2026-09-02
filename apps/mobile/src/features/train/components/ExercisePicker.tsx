import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ExerciseDTO } from '../train.types';
import { useExercises } from '../hooks/useExercises';
import { ExerciseListItem } from './ExerciseListItem';
import { Text } from '../../../components/common/Text';
import { Input } from '../../../components/forms/Input';
import { Button } from '../../../components/common/Button';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { theme } from '../../../theme/theme';

export interface ExercisePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseDTO) => void;
  excludedExerciseIds?: string[];
  testID?: string;
}

const MUSCLE_GROUPS = ['ALL', 'CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE'];

export const ExercisePicker: React.FC<ExercisePickerProps> = ({
  visible,
  onClose,
  onSelectExercise,
  excludedExerciseIds = [],
  testID = 'exercise-picker-modal',
}) => {
  const { exercises, isLoading, search, setSearch, muscleGroup, setMuscleGroup } = useExercises();

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => !excludedExerciseIds.includes(ex.id));
  }, [exercises, excludedExerciseIds]);

  const handleSelect = (exercise: ExerciseDTO) => {
    onSelectExercise(exercise);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="title" style={styles.title}>
            Select Exercise
          </Text>
          <Button
            variant="ghost"
            size="sm"
            label="Close"
            fullWidth={false}
            onPress={onClose}
            testID="picker-close-button"
          />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search exercises..."
            autoCapitalize="none"
            testID="picker-search-input"
          />
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipContent}
        >
          {MUSCLE_GROUPS.map((mg) => {
            const isSelected = (muscleGroup === '' && mg === 'ALL') || muscleGroup === mg;
            return (
              <TouchableOpacity
                key={mg}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setMuscleGroup(mg === 'ALL' ? '' : mg)}
                testID={`picker-filter-${mg.toLowerCase()}`}
              >
                <Text
                  style={[styles.chipText, isSelected && styles.chipTextSelected]}
                >
                  {mg}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* List Content */}
        {isLoading ? (
          <View style={styles.center}>
            <LoadingIndicator />
            <Text variant="caption" color={theme.colors.text.muted} style={{ marginTop: 8 }}>
              Loading exercises...
            </Text>
          </View>
        ) : filteredExercises.length === 0 ? (
          <View style={styles.center}>
            <Text variant="muted">No exercises found.</Text>
          </View>
        ) : (
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {filteredExercises.map((exercise) => (
              <ExerciseListItem
                key={exercise.id}
                exercise={exercise}
                onPress={() => handleSelect(exercise)}
                testID={`picker-item-${exercise.id}`}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    paddingTop: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borders.border,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text.primary,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  chipScroll: {
    maxHeight: 40,
    marginVertical: theme.spacing.xs,
  },
  chipContent: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaces.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaces.cardBorder,
  },
  chipSelected: {
    borderColor: theme.colors.brand.emerald,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  chipText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.medium,
  },
  chipTextSelected: {
    color: theme.colors.brand.emerald,
    fontWeight: theme.typography.weights.semibold,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
});

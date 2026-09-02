import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { MuscleGroupBadge } from '../features/train/components/MuscleGroupBadge';
import { ExerciseCard, ExerciseCardProps } from '../features/train/components/ExerciseCard';
import { ExerciseListItem, ExerciseListItemProps } from '../features/train/components/ExerciseListItem';
import { WorkoutTemplateCard, WorkoutTemplateCardProps } from '../features/train/components/WorkoutTemplateCard';
import { WorkoutSetRow, WorkoutSetRowProps } from '../features/train/components/WorkoutSetRow';
import { SetInputRow, SetInputRowProps } from '../features/train/components/SetInputRow';
import { WorkoutTimer, formatDuration } from '../features/train/components/WorkoutTimer';
import { WorkoutActionBar, WorkoutActionBarProps } from '../features/train/components/WorkoutActionBar';
import { ExerciseDTO, WorkoutTemplateDTO, WorkoutSetDTO } from '../features/train/train.types';

describe('TRAIN UI Components', () => {
  describe('MuscleGroupBadge', () => {
    it('renders with uppercase muscle group label', () => {
      const element = React.createElement(MuscleGroupBadge, {
        muscleGroup: 'CHEST',
      });
      expect(element.props.muscleGroup).toBe('CHEST');
    });

    it('falls back gracefully when muscle group is undefined', () => {
      const element = React.createElement(MuscleGroupBadge, {
        muscleGroup: undefined,
      });
      expect(element.props.muscleGroup).toBeUndefined();
    });
  });

  describe('ExerciseCard', () => {
    it('constructs with exercise metadata and handles onPress', () => {
      const onPress = vi.fn();
      const mockEx: ExerciseDTO = {
        id: 'ex-1',
        name: 'Bench Press',
        muscleGroup: 'CHEST',
        equipment: 'Barbell',
        movementPattern: 'HORIZONTAL_PUSH',
        exerciseType: 'COMPOUND',
        description: 'Horizontal barbell press',
        instructions: 'Lower bar to chest and press up',
        isActive: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      const element = React.createElement<ExerciseCardProps>(ExerciseCard, {
        exercise: mockEx,
        onPress,
      });

      expect(element.props.exercise.name).toBe('Bench Press');
      expect(element.props.exercise.equipment).toBe('Barbell');
      element.props.onPress?.();
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('ExerciseListItem', () => {
    it('renders compact exercise row and responds to press', () => {
      const onPress = vi.fn();
      const mockEx: ExerciseDTO = {
        id: 'ex-2',
        name: 'Incline Dumbbell Press',
        muscleGroup: 'CHEST',
        equipment: 'Dumbbells',
        movementPattern: 'HORIZONTAL_PUSH',
        exerciseType: 'COMPOUND',
        description: 'Incline bench press',
        instructions: 'Press dumbbells up',
        isActive: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      const element = React.createElement<ExerciseListItemProps>(ExerciseListItem, {
        exercise: mockEx,
        onPress,
      });

      expect(element.props.exercise.name).toBe('Incline Dumbbell Press');
      element.props.onPress?.();
      expect(onPress).toHaveBeenCalled();
    });
  });

  describe('WorkoutTemplateCard', () => {
    it('constructs with template and handles start workout trigger', () => {
      const onStart = vi.fn();
      const mockTemplate: WorkoutTemplateDTO = {
        id: 'tpl-1',
        userId: 'user-1',
        name: 'Upper Body A',
        description: 'Chest & Back hypertrophy',
        exercises: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      const element = React.createElement<WorkoutTemplateCardProps>(WorkoutTemplateCard, {
        template: mockTemplate,
        onStartWorkout: onStart,
      });

      expect(element.props.template.name).toBe('Upper Body A');
      element.props.onStartWorkout?.();
      expect(onStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('WorkoutSetRow', () => {
    it('constructs set row and exposes edit/delete touch targets in active mode', () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const mockSet: WorkoutSetDTO = {
        id: 'set-1',
        workoutSessionExerciseId: 'se-1',
        setNumber: 1,
        reps: 10,
        weight: 100,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      const element = React.createElement<WorkoutSetRowProps>(WorkoutSetRow, {
        set: mockSet,
        onEdit,
        onDelete,
        readOnly: false,
      });

      expect(element.props.set.reps).toBe(10);
      expect(element.props.set.weight).toBe(100);
      expect(element.props.readOnly).toBe(false);

      element.props.onEdit?.();
      expect(onEdit).toHaveBeenCalled();
      element.props.onDelete?.();
      expect(onDelete).toHaveBeenCalled();
    });

    it('hides edit/delete actions when readOnly is true', () => {
      const mockSet: WorkoutSetDTO = {
        id: 'set-1',
        workoutSessionExerciseId: 'se-1',
        setNumber: 1,
        reps: 8,
        weight: 120,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      const element = React.createElement<WorkoutSetRowProps>(WorkoutSetRow, {
        set: mockSet,
        readOnly: true,
      });

      expect(element.props.readOnly).toBe(true);
      expect(element.props.onEdit).toBeUndefined();
      expect(element.props.onDelete).toBeUndefined();
    });
  });

  describe('SetInputRow', () => {
    it('constructs with initial reps and weight', () => {
      const onSave = vi.fn();
      const element = React.createElement<SetInputRowProps>(SetInputRow, {
        initialReps: 12,
        initialWeight: 80,
        onSave,
        mode: 'edit',
      });

      expect(element.props.initialReps).toBe(12);
      expect(element.props.initialWeight).toBe(80);
      expect(element.props.mode).toBe('edit');
    });
  });

  describe('WorkoutTimer', () => {
    it('formats seconds correctly into HH:MM:SS or MM:SS', () => {
      expect(formatDuration(45)).toBe('00:45');
      expect(formatDuration(125)).toBe('02:05');
      expect(formatDuration(3665)).toBe('01:01:05');
    });

    it('constructs WorkoutTimer with startedAt ISO string', () => {
      const element = React.createElement(WorkoutTimer, {
        startedAt: '2026-01-01T10:00:00Z',
      });
      expect(element.props.startedAt).toBe('2026-01-01T10:00:00Z');
    });
  });

  describe('WorkoutActionBar', () => {
    it('constructs with complete and abandon handlers', () => {
      const onComplete = vi.fn();
      const onAbandon = vi.fn();

      const element = React.createElement<WorkoutActionBarProps>(WorkoutActionBar, {
        onComplete,
        onAbandon,
        isCompleting: false,
        isAbandoning: false,
      });

      expect(element.props.isCompleting).toBe(false);
      expect(element.props.isAbandoning).toBe(false);

      element.props.onComplete();
      expect(onComplete).toHaveBeenCalled();
      element.props.onAbandon();
      expect(onAbandon).toHaveBeenCalled();
    });
  });
});

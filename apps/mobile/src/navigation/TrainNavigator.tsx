import React from 'react';
import { useNavigation } from './NavigationProvider';
import { TrainHomeScreen } from '../features/train/screens/TrainHomeScreen';
import { ExerciseLibraryScreen } from '../features/train/screens/ExerciseLibraryScreen';
import { ExerciseDetailScreen } from '../features/train/screens/ExerciseDetailScreen';
import { WorkoutTemplatesScreen } from '../features/train/screens/WorkoutTemplatesScreen';
import { WorkoutTemplateDetailScreen } from '../features/train/screens/WorkoutTemplateDetailScreen';
import { WorkoutTemplateEditorScreen } from '../features/train/screens/WorkoutTemplateEditorScreen';
import { ActiveWorkoutScreen } from '../features/train/screens/ActiveWorkoutScreen';
import { WorkoutHistoryScreen } from '../features/train/screens/WorkoutHistoryScreen';
import { WorkoutHistoryDetailScreen } from '../features/train/screens/WorkoutHistoryDetailScreen';

export const TrainNavigator: React.FC = () => {
  const { trainScreen } = useNavigation();

  switch (trainScreen) {
    case 'TrainHome':
      return <TrainHomeScreen />;
    case 'ExerciseLibrary':
      return <ExerciseLibraryScreen />;
    case 'ExerciseDetail':
      return <ExerciseDetailScreen />;
    case 'WorkoutTemplates':
      return <WorkoutTemplatesScreen />;
    case 'WorkoutTemplateDetail':
      return <WorkoutTemplateDetailScreen />;
    case 'WorkoutTemplateEditor':
      return <WorkoutTemplateEditorScreen />;
    case 'ActiveWorkout':
      return <ActiveWorkoutScreen />;
    case 'WorkoutHistory':
      return <WorkoutHistoryScreen />;
    case 'WorkoutHistoryDetail':
      return <WorkoutHistoryDetailScreen />;
    default:
      return <TrainHomeScreen />;
  }
};

import React from 'react';
import { useNavigation } from './NavigationProvider';
import {
  ProgressHomeScreen,
  ProgressSummaryScreen,
  WorkoutFrequencyScreen,
  TrainingVolumeScreen,
  ExerciseVolumeScreen,
  MuscleVolumeScreen,
  PersonalRecordsScreen,
  ExercisePerformanceScreen,
  ExerciseTrendScreen,
} from '../features/progress';

export const ProgressNavigator: React.FC = () => {
  const { progressScreen } = useNavigation();

  switch (progressScreen) {
    case 'ProgressHome':
      return <ProgressHomeScreen />;

    case 'ProgressSummary':
      return <ProgressSummaryScreen />;

    case 'WorkoutFrequency':
      return <WorkoutFrequencyScreen />;

    case 'TrainingVolume':
      return <TrainingVolumeScreen />;

    case 'ExerciseVolume':
      return <ExerciseVolumeScreen />;

    case 'MuscleVolume':
      return <MuscleVolumeScreen />;

    case 'PersonalRecords':
      return <PersonalRecordsScreen />;

    case 'ExercisePerformance':
      return <ExercisePerformanceScreen />;

    case 'ExerciseTrend':
      return <ExerciseTrendScreen />;

    default:
      return <ProgressHomeScreen />;
  }
};

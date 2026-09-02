import React, { useState, useEffect } from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';
import { Text } from '../../../components/common/Text';
import { theme } from '../../../theme/theme';

export interface WorkoutTimerProps {
  startedAt: string;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00';
  }

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }

  return `${pad(mins)}:${pad(secs)}`;
}

export const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  startedAt,
  style,
  testID = 'workout-timer',
}) => {
  const calculateElapsedSeconds = () => {
    const startMs = new Date(startedAt).getTime();
    if (isNaN(startMs)) return 0;
    const diff = Math.max(0, Date.now() - startMs);
    return Math.floor(diff / 1000);
  };

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(calculateElapsedSeconds);

  useEffect(() => {
    // Immediate initial sync
    setElapsedSeconds(calculateElapsedSeconds());

    const interval = setInterval(() => {
      setElapsedSeconds(calculateElapsedSeconds());
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <Text
      variant="heading"
      style={[styles.timer, style]}
      testID={testID}
    >
      {formatDuration(elapsedSeconds)}
    </Text>
  );
};

const styles = StyleSheet.create({
  timer: {
    fontVariant: ['tabular-nums'],
    color: theme.colors.brand.emerald,
    letterSpacing: 1,
  },
});

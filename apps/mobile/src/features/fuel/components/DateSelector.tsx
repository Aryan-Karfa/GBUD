import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { getTodayDateString, shiftDateString, formatCalendarDate } from '../fuel.types';
import { Text } from '../../../components/common/Text';
import { theme } from '../../../theme/theme';

export interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (newDate: string) => void;
  testID?: string;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
  testID = 'date-selector',
}) => {
  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;

  const handlePrevDay = () => {
    onDateChange(shiftDateString(selectedDate, -1));
  };

  const handleNextDay = () => {
    onDateChange(shiftDateString(selectedDate, 1));
  };

  const handleJumpToToday = () => {
    onDateChange(todayStr);
  };

  return (
    <View style={styles.container} testID={testID}>
      {/* Previous Day Button */}
      <TouchableOpacity
        onPress={handlePrevDay}
        style={styles.arrowButton}
        accessibilityRole="button"
        accessibilityLabel="Previous day"
        testID={`${testID}-prev-btn`}
      >
        <Text style={styles.arrowText}>←</Text>
      </TouchableOpacity>

      {/* Date Display */}
      <View style={styles.dateCenter}>
        <Text variant="heading" style={styles.dateLabel} numberOfLines={1}>
          {formatCalendarDate(selectedDate)}
        </Text>
        {!isToday && (
          <TouchableOpacity
            onPress={handleJumpToToday}
            style={styles.todayBtn}
            accessibilityRole="button"
            accessibilityLabel="Jump to today"
            testID={`${testID}-today-btn`}
          >
            <Text style={styles.todayBtnText}>Back to Today</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Next Day Button */}
      <TouchableOpacity
        onPress={handleNextDay}
        style={styles.arrowButton}
        accessibilityRole="button"
        accessibilityLabel="Next day"
        testID={`${testID}-next-btn`}
      >
        <Text style={styles.arrowText}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surfaces.card,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaces.cardBorder,
    marginBottom: theme.spacing.md,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weights.bold,
  },
  dateCenter: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: theme.spacing.xs,
  },
  dateLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
  },
  todayBtn: {
    marginTop: 2,
  },
  todayBtnText: {
    fontSize: 10,
    color: theme.colors.brand.amber,
    fontWeight: theme.typography.weights.semibold,
  },
});

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StyleProp, ViewStyle } from 'react-native';
import { Text } from '../../../components';
import { theme } from '../../../theme/theme';
import { DateRangePreset, formatCalendarDate } from '../progress.types';

export interface DateRangeSelectorProps {
  selectedPreset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  from?: string;
  to?: string;
  style?: StyleProp<ViewStyle>;
}

const PRESETS: Array<{ key: DateRangePreset; label: string }> = [
  { key: '7D', label: '7D' },
  { key: '30D', label: '30D' },
  { key: '90D', label: '90D' },
  { key: '6M', label: '6M' },
  { key: '1Y', label: '1Y' },
];

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  selectedPreset,
  onPresetChange,
  from,
  to,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presetScroll}
      >
        {PRESETS.map((p) => {
          const isSelected = selectedPreset === p.key;
          return (
            <TouchableOpacity
              key={p.key}
              onPress={() => onPresetChange(p.key)}
              style={[styles.presetChip, isSelected && styles.presetChipSelected]}
              accessibilityRole="button"
              accessibilityLabel={`Select ${p.label} date range`}
              accessibilityState={{ selected: isSelected }}
              testID={`preset-chip-${p.key}`}
            >
              <Text
                variant="caption"
                weight={isSelected ? 'bold' : 'medium'}
                color={isSelected ? theme.colors.text.inverse : theme.colors.text.secondary}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {from && to && (
        <View style={styles.dateRangeTextContainer}>
          <Text variant="caption" color={theme.colors.text.muted}>
            {formatCalendarDate(from)} — {formatCalendarDate(to)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  presetScroll: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs / 2,
  },
  presetChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaces.card,
    borderWidth: 1,
    borderColor: theme.colors.borders.border,
    minWidth: 44,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipSelected: {
    backgroundColor: theme.colors.brand.emerald,
    borderColor: theme.colors.brand.emerald,
  },
  dateRangeTextContainer: {
    marginTop: theme.spacing.xs,
    alignItems: 'center',
  },
});

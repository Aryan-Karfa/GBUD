import React from 'react';
import { View, StyleSheet, ScrollView, StyleProp, ViewStyle } from 'react-native';
import { Text, Card } from '../../../components';
import { theme } from '../../../theme/theme';

export interface VolumeDataPoint {
  label: string;
  volume: number;
}

export interface VolumeTrendChartProps {
  data: VolumeDataPoint[];
  title?: string;
  unit?: string;
  style?: StyleProp<ViewStyle>;
}

export const VolumeTrendChart: React.FC<VolumeTrendChartProps> = ({
  data,
  title = 'Volume Progression',
  unit = 'kg',
  style,
}) => {
  if (!data || data.length === 0) {
    return (
      <Card elevation="elevation2" style={[styles.card, style as ViewStyle]}>
        <Text variant="subheading" weight="bold" color={theme.colors.text.primary} style={styles.title}>
          {title}
        </Text>
        <View style={styles.emptyContainer}>
          <Text variant="body" color={theme.colors.text.muted} align="center">
            No volume trend data available for this period.
          </Text>
        </View>
      </Card>
    );
  }

  const maxVolume = Math.max(...data.map((d) => d.volume), 1);
  const CHART_HEIGHT = 140;

  return (
    <Card elevation="elevation2" style={[styles.card, style as ViewStyle]}>
      <View style={styles.header}>
        <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
          {title}
        </Text>
        <Text variant="caption" color={theme.colors.text.muted}>
          Max: {maxVolume.toLocaleString()} {unit}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartContainer}>
        {data.map((item, index) => {
          const barHeight = Math.max(4, (item.volume / maxVolume) * CHART_HEIGHT);

          return (
            <View key={`${item.label}-${index}`} style={styles.columnContainer}>
              <Text variant="caption" color={theme.colors.text.muted} style={styles.barValue}>
                {item.volume > 0 ? (item.volume >= 1000 ? `${(item.volume / 1000).toFixed(1)}k` : item.volume) : ''}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: theme.colors.brand.emerald,
                    },
                  ]}
                />
              </View>
              <Text variant="caption" color={theme.colors.text.secondary} numberOfLines={1} style={styles.xLabel}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  emptyContainer: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 190,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    gap: theme.spacing.md,
  },
  columnContainer: {
    alignItems: 'center',
    width: 44,
  },
  barValue: {
    fontSize: 10,
    marginBottom: 4,
    height: 14,
    textAlign: 'center',
  },
  barTrack: {
    height: 140,
    width: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: theme.radius.xs,
  },
  xLabel: {
    fontSize: 11,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
    width: 44,
  },
});

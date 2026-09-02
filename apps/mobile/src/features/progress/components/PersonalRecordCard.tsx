import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text } from '../../../components';
import { theme } from '../../../theme/theme';
import { PersonalRecordItemDTO, formatCalendarDate } from '../progress.types';

export interface PersonalRecordCardProps {
  record: PersonalRecordItemDTO;
  onPress?: () => void;
  style?: object;
}

export const PersonalRecordCard: React.FC<PersonalRecordCardProps> = ({
  record,
  onPress,
  style,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Personal record for ${record.exerciseName}`}
      style={style}
    >
      <Card elevation="elevation2" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.tag}>
            <Text variant="caption" weight="bold" color={theme.colors.brand.emerald} style={styles.tagText}>
              PERSONAL RECORD
            </Text>
          </View>
          {record.achievedAt && (
            <Text variant="caption" color={theme.colors.text.muted}>
              {formatCalendarDate(record.achievedAt)}
            </Text>
          )}
        </View>

        <Text variant="subheading" weight="bold" color={theme.colors.text.primary} style={styles.exerciseName}>
          {record.exerciseName}
        </Text>

        <View style={styles.statsRow}>
          {record.estimated1RM !== null && record.estimated1RM !== undefined && (
            <View style={styles.statBox}>
              <Text variant="caption" color={theme.colors.text.muted}>
                EST. 1RM
              </Text>
              <Text variant="body" weight="bold" color={theme.colors.brand.emerald} style={styles.statNumber}>
                {record.estimated1RM} <Text variant="caption" color={theme.colors.text.muted}>kg</Text>
              </Text>
            </View>
          )}

          {record.maxWeight !== null && record.maxWeight !== undefined && (
            <View style={styles.statBox}>
              <Text variant="caption" color={theme.colors.text.muted}>
                BEST WEIGHT
              </Text>
              <Text variant="body" weight="bold" color={theme.colors.text.primary} style={styles.statNumber}>
                {record.maxWeight} <Text variant="caption" color={theme.colors.text.muted}>kg</Text>
              </Text>
            </View>
          )}

          {record.maxReps !== null && record.maxReps !== undefined && (
            <View style={styles.statBox}>
              <Text variant="caption" color={theme.colors.text.muted}>
                BEST REPS
              </Text>
              <Text variant="body" weight="bold" color={theme.colors.text.primary} style={styles.statNumber}>
                {record.maxReps}
              </Text>
            </View>
          )}

          {record.maxVolume !== null && record.maxVolume !== undefined && (
            <View style={styles.statBox}>
              <Text variant="caption" color={theme.colors.text.muted}>
                MAX SET VOL.
              </Text>
              <Text variant="body" weight="bold" color={theme.colors.text.primary} style={styles.statNumber}>
                {record.maxVolume.toLocaleString()} <Text variant="caption" color={theme.colors.text.muted}>kg</Text>
              </Text>
            </View>
          )}
        </View>
      </Card>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  tag: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs / 4,
    borderRadius: theme.radius.xs,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  tagText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  exerciseName: {
    marginBottom: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statBox: {
    minWidth: 80,
  },
  statNumber: {
    marginTop: theme.spacing.xs / 4,
  },
});

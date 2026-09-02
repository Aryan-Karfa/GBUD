import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TextInput } from 'react-native';
import { Screen, Text, LoadingIndicator } from '../../../components';
import { theme } from '../../../theme/theme';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { usePersonalRecords } from '../hooks/usePersonalRecords';
import { DateRangeSelector, PersonalRecordCard, ProgressErrorState } from '../components';

export const PersonalRecordsScreen: React.FC = () => {
  const { navigateProgress, progressParams } = useNavigation();
  const [search, setSearch] = useState('');
  const { personalRecords, loading, error, preset, from, to, setPreset, refresh } =
    usePersonalRecords({
      initialFrom: progressParams?.from,
      initialTo: progressParams?.to,
      initialPreset: '30D',
    });

  const filteredRecords = personalRecords.filter((pr) =>
    pr.exerciseName.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <Screen padding="md" testID="personal-records-screen">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={theme.colors.brand.emerald}
            colors={[theme.colors.brand.emerald]}
          />
        }
      >
        <View style={styles.header}>
          <Text variant="heading" weight="bold" color={theme.colors.text.primary} style={styles.title}>
            Personal Records
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            Best performance metrics and estimated 1RM facts
          </Text>
        </View>

        <DateRangeSelector
          selectedPreset={preset}
          onPresetChange={setPreset}
          from={from}
          to={to}
          style={styles.dateSelector}
        />

        <TextInput
          placeholder="Filter personal records..."
          placeholderTextColor={theme.colors.text.muted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          autoCapitalize="none"
          accessibilityLabel="Filter personal records"
        />

        {error && <ProgressErrorState error={error} onRetry={refresh} />}

        {loading && personalRecords.length === 0 ? (
          <View style={styles.loaderContainer}>
            <LoadingIndicator size="large" />
          </View>
        ) : filteredRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="body" color={theme.colors.text.muted} align="center">
              No personal records logged for this period.
            </Text>
          </View>
        ) : (
          filteredRecords.map((pr, idx) => (
            <PersonalRecordCard
              key={`${pr.exerciseId}-${idx}`}
              record={pr}
              onPress={() =>
                pr.exerciseId
                  ? navigateProgress('ExercisePerformance', {
                      exerciseId: pr.exerciseId,
                      exerciseName: pr.exerciseName,
                    })
                  : undefined
              }
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs / 2,
  },
  dateSelector: {
    marginBottom: theme.spacing.lg,
  },
  searchInput: {
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaces.card,
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.md,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.colors.borders.border,
    marginBottom: theme.spacing.md,
  },
  loaderContainer: {
    paddingVertical: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: theme.spacing.xxl,
    alignItems: 'center',
  },
});

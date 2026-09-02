import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TextInput } from 'react-native';
import { Screen, Text, Card, LoadingIndicator } from '../../../components';
import { theme } from '../../../theme/theme';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useTrainingVolume } from '../hooks/useTrainingVolume';
import { DateRangeSelector, ExerciseVolumeRow, ProgressErrorState } from '../components';

export const ExerciseVolumeScreen: React.FC = () => {
  const { navigateProgress, progressParams } = useNavigation();
  const [search, setSearch] = useState('');
  const { exerciseVolume, loading, error, preset, from, to, setPreset, refresh } =
    useTrainingVolume({
      initialFrom: progressParams?.from,
      initialTo: progressParams?.to,
      initialPreset: '30D',
    });

  const filteredItems = exerciseVolume.filter((e) =>
    e.exerciseName.toLowerCase().includes(search.toLowerCase().trim())
  );
  const maxVolume = exerciseVolume.length > 0 ? Math.max(...exerciseVolume.map((e) => e.totalVolume)) : 1;

  return (
    <Screen padding="md" testID="exercise-volume-screen">
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
            Volume by Exercise
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            Total tonnage lifted per movement
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
          placeholder="Filter exercises..."
          placeholderTextColor={theme.colors.text.muted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          autoCapitalize="none"
          accessibilityLabel="Filter exercises"
        />

        {error && <ProgressErrorState error={error} onRetry={refresh} />}

        {loading && exerciseVolume.length === 0 ? (
          <View style={styles.loaderContainer}>
            <LoadingIndicator size="large" />
          </View>
        ) : (
          <Card elevation="elevation2" style={styles.listCard}>
            {filteredItems.length === 0 ? (
              <Text variant="body" color={theme.colors.text.muted} align="center" style={styles.emptyText}>
                No exercise volume records found.
              </Text>
            ) : (
              filteredItems.map((item, idx) => (
                <ExerciseVolumeRow
                  key={`${item.exerciseId}-${idx}`}
                  item={item}
                  maxVolume={maxVolume}
                  onPress={() =>
                    item.exerciseId
                      ? navigateProgress('ExercisePerformance', {
                          exerciseId: item.exerciseId,
                          exerciseName: item.exerciseName,
                        })
                      : undefined
                  }
                />
              ))
            )}
          </Card>
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
    marginBottom: theme.spacing.md,
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
  listCard: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  emptyText: {
    paddingVertical: theme.spacing.xl,
  },
});

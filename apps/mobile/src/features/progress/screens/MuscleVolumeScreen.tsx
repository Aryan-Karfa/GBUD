import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Screen, Text, Card, LoadingIndicator } from '../../../components';
import { theme } from '../../../theme/theme';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useTrainingVolume } from '../hooks/useTrainingVolume';
import { DateRangeSelector, MuscleVolumeRow, ProgressErrorState } from '../components';

export const MuscleVolumeScreen: React.FC = () => {
  const { progressParams } = useNavigation();
  const { muscleVolume, loading, error, preset, from, to, setPreset, refresh } = useTrainingVolume({
    initialFrom: progressParams?.from,
    initialTo: progressParams?.to,
    initialPreset: '30D',
  });

  const maxVolume = muscleVolume.length > 0 ? Math.max(...muscleVolume.map((m) => m.totalVolume)) : 1;
  const totalTonnage = muscleVolume.reduce((acc, m) => acc + m.totalVolume, 0);

  return (
    <Screen padding="md" testID="muscle-volume-screen">
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
            Volume by Muscle Group
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            Anatomical workload distribution
          </Text>
        </View>

        <DateRangeSelector
          selectedPreset={preset}
          onPresetChange={setPreset}
          from={from}
          to={to}
          style={styles.dateSelector}
        />

        {error && <ProgressErrorState error={error} onRetry={refresh} />}

        {loading && muscleVolume.length === 0 ? (
          <View style={styles.loaderContainer}>
            <LoadingIndicator size="large" />
          </View>
        ) : (
          <>
            <Card elevation="elevation2" style={styles.listCard}>
              {muscleVolume.length === 0 ? (
                <Text variant="body" color={theme.colors.text.muted} align="center" style={styles.emptyText}>
                  No muscle volume records found for this period.
                </Text>
              ) : (
                muscleVolume.map((item, idx) => (
                  <MuscleVolumeRow
                    key={`${item.muscleGroup}-${idx}`}
                    item={item}
                    maxVolume={maxVolume}
                  />
                ))
              )}
            </Card>

            {totalTonnage > 0 && (
              <View style={styles.footerNote}>
                <Text variant="caption" color={theme.colors.text.muted} align="center">
                  Total distributed workload: {totalTonnage.toLocaleString()} kg
                </Text>
              </View>
            )}
          </>
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
  footerNote: {
    marginTop: theme.spacing.lg,
  },
});

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useExercises } from '../hooks/useExercises';
import { ExerciseCard } from '../components/ExerciseCard';
import { Screen } from '../../../components/layout/Screen';
import { Text } from '../../../components/common/Text';
import { Input } from '../../../components/forms/Input';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { theme } from '../../../theme/theme';

const MUSCLE_GROUPS = ['ALL', 'CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE'];

export const ExerciseLibraryScreen: React.FC = () => {
  const { navigateTrain, goBack } = useNavigation();
  const {
    exercises,
    isLoading,
    isRefreshing,
    error,
    search,
    setSearch,
    muscleGroup,
    setMuscleGroup,
    refresh,
  } = useExercises();

  return (
    <Screen scrollable={false} testID="exercise-library-screen">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => goBack()} style={styles.backButton} testID="library-back-btn">
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text variant="title" style={styles.title}>
              Exercise Library
            </Text>
            <Text variant="muted" style={styles.countText}>
              {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search exercises by name..."
            autoCapitalize="none"
            testID="library-search-input"
          />
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {MUSCLE_GROUPS.map((mg) => {
            const isSelected = (muscleGroup === '' && mg === 'ALL') || muscleGroup === mg;
            return (
              <TouchableOpacity
                key={mg}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setMuscleGroup(mg === 'ALL' ? '' : mg)}
                testID={`filter-chip-${mg.toLowerCase()}`}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {mg}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Body Content */}
        {error ? (
          <View style={styles.centerContainer}>
            <ErrorState message={error} onRetry={refresh} testID="library-error" />
          </View>
        ) : isLoading && !isRefreshing ? (
          <View style={styles.centerContainer}>
            <LoadingIndicator />
            <Text variant="caption" color={theme.colors.text.muted} style={{ marginTop: 8 }}>
              Loading exercise library...
            </Text>
          </View>
        ) : exercises.length === 0 ? (
          <View style={styles.centerContainer}>
            <EmptyState
              emoji="🔍"
              title="No exercises found"
              description={
                search
                  ? `No exercises matching "${search}". Try adjusting your filters.`
                  : 'The exercise catalog is currently empty.'
              }
              actionLabel={search ? 'Clear Search' : undefined}
              onAction={search ? () => setSearch('') : undefined}
              testID="library-empty"
            />
          </View>
        ) : (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onPress={() =>
                  navigateTrain('ExerciseDetail', { exerciseId: exercise.id })
                }
                testID={`exercise-card-${exercise.id}`}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  backButton: {
    paddingRight: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  backIcon: {
    fontSize: 22,
    color: theme.colors.text.primary,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text.primary,
  },
  countText: {
    fontSize: 11,
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  filterScroll: {
    maxHeight: 40,
    marginVertical: theme.spacing.xs,
  },
  filterContent: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaces.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaces.cardBorder,
  },
  chipSelected: {
    borderColor: theme.colors.brand.emerald,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  chipText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.medium,
  },
  chipTextSelected: {
    color: theme.colors.brand.emerald,
    fontWeight: theme.typography.weights.semibold,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxxl,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
});

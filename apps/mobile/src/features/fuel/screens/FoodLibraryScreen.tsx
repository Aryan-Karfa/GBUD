import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Text } from '../../../components/common/Text';
import { Input } from '../../../components/forms/Input';
import { Button } from '../../../components/common/Button';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { FoodCard, FuelErrorState } from '../components';
import { useFoods, FoodFilterType } from '../hooks/useFoods';
import { theme } from '../../../theme/theme';

export const FoodLibraryScreen: React.FC = () => {
  const { navigateFuel, goBack } = useNavigation();

  const {
    foods,
    isLoading,
    isRefreshing,
    error,
    search,
    setSearch,
    filter,
    setFilter,
    refresh,
  } = useFoods();

  const filterOptions: { label: string; value: FoodFilterType }[] = [
    { label: 'ALL', value: 'ALL' },
    { label: 'SYSTEM', value: 'SYSTEM' },
    { label: 'CUSTOM', value: 'CUSTOM' },
  ];

  return (
    <Screen padding="md" testID="food-library-screen">
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={goBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back to Fuel Home"
            testID="food-library-back-btn"
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View>
            <Text variant="title" style={styles.title}>
              Food Library
            </Text>
            <Text variant="caption" color={theme.colors.text.secondary}>
              System & Custom Foods
            </Text>
          </View>
        </View>

        <Button
          variant="primary"
          size="sm"
          label="+ Custom"
          fullWidth={false}
          onPress={() => navigateFuel('CustomFoodEditor')}
          testID="create-custom-food-btn"
        />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Search foods..."
          autoCapitalize="none"
          testID="food-search-input"
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {filterOptions.map((opt) => {
          const isSelected = filter === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setFilter(opt.value)}
              style={[styles.filterChip, isSelected && styles.filterChipSelected]}
              testID={`food-filter-${opt.value.toLowerCase()}`}
            >
              <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && (
        <FuelErrorState
          error={error}
          onRetry={refresh}
          testID="food-library-error"
        />
      )}

      {/* List */}
      {isLoading && foods.length === 0 ? (
        <View style={styles.center}>
          <LoadingIndicator />
          <Text variant="caption" color={theme.colors.text.muted} style={{ marginTop: 8 }}>
            Loading food catalog...
          </Text>
        </View>
      ) : foods.length === 0 ? (
        <View style={styles.center} testID="no-foods-state">
          <Text variant="subheading" color={theme.colors.text.secondary} style={{ marginBottom: 4 }}>
            No foods found
          </Text>
          <Text variant="caption" color={theme.colors.text.muted} align="center">
            Try adjusting your search query or create a new custom food item.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={theme.colors.brand.amber}
            />
          }
        >
          {foods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onPress={() => navigateFuel('FoodDetail', { foodId: food.id })}
              testID={`food-card-${food.id}`}
            />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
  },
  searchContainer: {
    marginBottom: theme.spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaces.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaces.cardBorder,
  },
  filterChipSelected: {
    borderColor: theme.colors.brand.amber,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  filterText: {
    fontSize: 11,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.secondary,
  },
  filterTextSelected: {
    color: theme.colors.brand.amber,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
});

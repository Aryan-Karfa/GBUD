import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Screen } from '../../../components';
import { useAuth } from '../../../auth/AuthProvider';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { theme } from '../../../theme/theme';
import { useHomeDashboard } from '../hooks/useHomeDashboard';
import {
  HomeHeader,
  HomeSectionHeader,
  ActiveWorkoutCard,
  TrainingHomeCard,
  FuelHomeCard,
  ProgressHomeCard,
  QuickActionGrid,
  RecentActivityCard,
  HomeLoadingState,
  HomeErrorState,
  HomeEmptyState,
} from '../components';

export const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const { navigateTab, navigateTrain, navigateFuel, navigateProgress } = useNavigation();
  const {
    dashboard,
    loading,
    refreshing,
    todayDate,
    isNewUser,
    refresh,
    retryTraining,
    retryFuel,
    retryProgress,
  } = useHomeDashboard();

  const activeWorkout = dashboard.training.data?.activeWorkout || null;
  const recentWorkout = dashboard.training.data?.recentWorkout || null;
  const todayMeals = dashboard.fuel.data?.todayMeals || [];
  const fuelSummary = dashboard.fuel.data?.summary || null;
  const progressDashboard = dashboard.progress.data?.dashboard || null;
  const latestPR = progressDashboard?.prHighlights?.[0] || null;
  const latestMeal = todayMeals[0] || null;

  const isInitialLoading =
    loading &&
    !dashboard.training.data &&
    !dashboard.fuel.data &&
    !dashboard.progress.data;

  return (
    <Screen padding="md" testID="home-screen">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={theme.colors.brand.emerald}
            colors={[theme.colors.brand.emerald]}
          />
        }
      >
        {/* Top Header & Greeting */}
        <HomeHeader
          username={user?.username}
          dateStr={todayDate}
          onProfilePress={() => navigateTab('Profile')}
        />

        {isInitialLoading ? (
          <HomeLoadingState />
        ) : isNewUser ? (
          <HomeEmptyState
            onStartTraining={() => navigateTrain('WorkoutTemplates')}
            onStartFuel={() => navigateFuel('Meals', { date: todayDate })}
          />
        ) : (
          <>
            {/* Quick Contextual Actions */}
            <QuickActionGrid
              hasActiveWorkout={Boolean(activeWorkout)}
              onWorkoutAction={() => {
                if (activeWorkout) {
                  navigateTrain('ActiveWorkout', { sessionId: activeWorkout.id });
                } else {
                  navigateTrain('WorkoutTemplates');
                }
              }}
              onMealAction={() => navigateFuel('Meals', { date: todayDate })}
              onProgressAction={() => navigateProgress('ProgressHome')}
            />

            {/* Training Domain Section */}
            <HomeSectionHeader title="Training" />
            {dashboard.training.error ? (
              <HomeErrorState
                title="Training Unavailable"
                message={dashboard.training.error}
                onRetry={retryTraining}
                testID="training-error-state"
              />
            ) : activeWorkout ? (
              <ActiveWorkoutCard
                session={activeWorkout}
                onContinue={() => navigateTrain('ActiveWorkout', { sessionId: activeWorkout.id })}
              />
            ) : (
              <TrainingHomeCard
                recentWorkout={recentWorkout}
                onStartWorkout={() => navigateTrain('WorkoutTemplates')}
                onViewHistory={() => navigateTrain('WorkoutHistory')}
              />
            )}

            {/* Fuel Domain Section */}
            <HomeSectionHeader title="Nutrition" />
            {dashboard.fuel.error ? (
              <HomeErrorState
                title="Nutrition Unavailable"
                message={dashboard.fuel.error}
                onRetry={retryFuel}
                testID="fuel-error-state"
              />
            ) : (
              <FuelHomeCard
                todayMeals={todayMeals}
                summary={fuelSummary}
                onViewFuel={() => navigateFuel('FuelHome')}
                onLogMeal={() => navigateFuel('Meals', { date: todayDate })}
              />
            )}

            {/* Progress Domain Section */}
            <HomeSectionHeader title="Analytics" />
            {dashboard.progress.error ? (
              <HomeErrorState
                title="Analytics Unavailable"
                message={dashboard.progress.error}
                onRetry={retryProgress}
                testID="progress-error-state"
              />
            ) : (
              <ProgressHomeCard
                dashboard={progressDashboard}
                onViewProgress={() => navigateProgress('ProgressHome')}
              />
            )}

            {/* Authoritative Recent Activity (omitted cleanly if no activity exists) */}
            <RecentActivityCard
              recentWorkout={recentWorkout}
              latestMeal={latestMeal}
              latestPR={latestPR}
              onWorkoutPress={() => navigateTrain('WorkoutHistory')}
              onMealPress={() => navigateFuel('Meals', { date: todayDate })}
              onPRPress={() => navigateProgress('PersonalRecords')}
            />
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
});

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useWorkoutTemplates } from '../hooks/useWorkoutTemplates';
import { useWorkoutSession } from '../hooks/useWorkoutSession';
import { WorkoutTemplateCard } from '../components/WorkoutTemplateCard';
import { Screen } from '../../../components/layout/Screen';
import { Text } from '../../../components/common/Text';
import { Button } from '../../../components/common/Button';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { theme } from '../../../theme/theme';

export const WorkoutTemplatesScreen: React.FC = () => {
  const { navigateTrain, goBack } = useNavigation();
  const { templates, isLoading, isRefreshing, error, refresh } = useWorkoutTemplates();
  const { startSession, activeSession } = useWorkoutSession({ autoCheckActive: false });
  const [startingTemplateId, setStartingTemplateId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const handleStartWorkout = async (templateId: string) => {
    setStartingTemplateId(templateId);
    setStartError(null);
    try {
      const created = await startSession(templateId);
      navigateTrain('ActiveWorkout', { sessionId: created.id });
    } catch (err: any) {
      if (err.status === 409 || err.code === 'CONFLICT') {
        setStartError('A workout is already in progress. You can resume it below.');
      } else {
        setStartError(err.message || 'Failed to start workout');
      }
    } finally {
      setStartingTemplateId(null);
    }
  };

  return (
    <Screen scrollable={false} testID="workout-templates-screen">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => goBack()} style={styles.backButton} testID="templates-back-btn">
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.titleArea}>
            <Text variant="title" style={styles.title}>
              Workout Templates
            </Text>
            <Text variant="muted" style={styles.subtitle}>
              {templates.length} {templates.length === 1 ? 'template' : 'templates'}
            </Text>
          </View>
          <Button
            variant="primary"
            size="sm"
            label="+ Create"
            fullWidth={false}
            onPress={() => navigateTrain('WorkoutTemplateEditor')}
            testID="create-template-btn"
          />
        </View>

        {/* Start Conflict Error Banner */}
        {startError && (
          <View style={styles.errorBanner}>
            <Text variant="error" style={styles.errorBannerText}>
              {startError}
            </Text>
            {activeSession && (
              <Button
                variant="outline"
                size="sm"
                label="Resume Active Workout"
                fullWidth={false}
                onPress={() =>
                  navigateTrain('ActiveWorkout', { sessionId: activeSession.id })
                }
                style={styles.resumeBtn}
                testID="resume-active-btn"
              />
            )}
          </View>
        )}

        {/* Body Content */}
        {error ? (
          <View style={styles.centerContainer}>
            <ErrorState message={error} onRetry={refresh} testID="templates-error" />
          </View>
        ) : isLoading && !isRefreshing ? (
          <View style={styles.centerContainer}>
            <LoadingIndicator />
            <Text variant="caption" color={theme.colors.text.muted} style={{ marginTop: 8 }}>
              Loading workout templates...
            </Text>
          </View>
        ) : templates.length === 0 ? (
          <View style={styles.centerContainer}>
            <EmptyState
              emoji="📋"
              title="No workout templates yet"
              description="Create a workout template to organize your routine and easily start tracking workouts."
              actionLabel="Create Workout"
              onAction={() => navigateTrain('WorkoutTemplateEditor')}
              testID="templates-empty"
            />
          </View>
        ) : (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {templates.map((template) => (
              <WorkoutTemplateCard
                key={template.id}
                template={template}
                onPress={() =>
                  navigateTrain('WorkoutTemplateDetail', { templateId: template.id })
                }
                onStartWorkout={() => handleStartWorkout(template.id)}
                isStarting={startingTemplateId === template.id}
                testID={`template-card-${template.id}`}
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
    paddingBottom: theme.spacing.sm,
  },
  backButton: {
    paddingRight: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  backIcon: {
    fontSize: 22,
    color: theme.colors.text.primary,
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  errorBanner: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorBannerText: {
    fontSize: theme.typography.sizes.xs,
  },
  resumeBtn: {
    marginTop: theme.spacing.xs,
    borderColor: theme.colors.brand.emerald,
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

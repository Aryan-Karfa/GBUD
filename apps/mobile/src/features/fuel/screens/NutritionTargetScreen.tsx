import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Text } from '../../../components/common/Text';
import { Card } from '../../../components/layout/Card';
import { Input } from '../../../components/forms/Input';
import { Button } from '../../../components/common/Button';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { NutritionTargetCard, FuelErrorState } from '../components';
import { useNutritionTargets } from '../hooks/useNutritionTargets';
import { getTodayDateString, formatCalendarDate } from '../fuel.types';
import { theme } from '../../../theme/theme';

export interface NutritionTargetScreenProps {
  date?: string;
}

export const NutritionTargetScreen: React.FC<NutritionTargetScreenProps> = ({
  date: paramDate,
}) => {
  const { goBack } = useNavigation();
  const activeDate = paramDate || getTodayDateString();

  const {
    currentTarget,
    targets,
    isLoading,
    isMutating,
    error,
    createTarget,
    fetchCurrentTarget,
    fetchTargetHistory,
  } = useNutritionTargets({ date: activeDate });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [effectiveFrom, setEffectiveFrom] = useState(activeDate);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formGlobalError, setFormGlobalError] = useState<string | null>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(effectiveFrom.trim())) {
      errs.effectiveFrom = 'Date must be in YYYY-MM-DD format';
    }

    const cal = parseFloat(calories);
    if (isNaN(cal) || cal < 0) errs.calories = 'Calories must be 0 or greater';

    const p = parseFloat(protein);
    if (isNaN(p) || p < 0) errs.protein = 'Protein must be 0 or greater';

    const c = parseFloat(carbs);
    if (isNaN(c) || c < 0) errs.carbs = 'Carbohydrates must be 0 or greater';

    const f = parseFloat(fat);
    if (isNaN(f) || f < 0) errs.fat = 'Fat must be 0 or greater';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateTarget = async () => {
    if (!validate()) return;
    setFormGlobalError(null);

    try {
      await createTarget({
        effectiveFrom: effectiveFrom.trim(),
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbohydrates: parseFloat(carbs),
        fat: parseFloat(fat),
      });
      setShowCreateForm(false);
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
    } catch (err: any) {
      if (err.status === 409 || err.code === 'CONFLICT') {
        setFormGlobalError('A target is already set for this effective date.');
      } else {
        setFormGlobalError(err.message || 'Failed to create nutrition target');
      }
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchCurrentTarget(activeDate), fetchTargetHistory(1)]);
  };

  return (
    <Screen padding="md" testID="nutrition-target-screen">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={goBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
            testID="target-back-btn"
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View>
            <Text variant="title" style={styles.title}>
              Nutrition Targets
            </Text>
            <Text variant="caption" color={theme.colors.text.secondary}>
              Caloric & Macronutrient Goals
            </Text>
          </View>
        </View>

        <Button
          variant={showCreateForm ? 'secondary' : 'primary'}
          size="sm"
          label={showCreateForm ? 'Cancel' : '+ New Target'}
          fullWidth={false}
          onPress={() => setShowCreateForm(!showCreateForm)}
          testID="toggle-target-form-btn"
        />
      </View>

      {error && (
        <FuelErrorState
          error={error}
          onRetry={handleRefresh}
          testID="target-screen-error"
        />
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            tintColor={theme.colors.brand.amber}
          />
        }
      >
        {/* New Target Form */}
        {showCreateForm && (
          <Card style={styles.formCard} testID="create-target-form">
            <Text variant="caption" style={styles.formSectionLabel}>
              SET EFFECTIVE TARGET
            </Text>

            {formGlobalError && (
              <Text variant="caption" color={theme.colors.status.error} style={{ marginBottom: 8 }}>
                {formGlobalError}
              </Text>
            )}

            <Input
              label="Effective From (YYYY-MM-DD) *"
              value={effectiveFrom}
              onChangeText={(t) => {
                setEffectiveFrom(t);
                if (formErrors.effectiveFrom) setFormErrors((p) => ({ ...p, effectiveFrom: '' }));
              }}
              error={formErrors.effectiveFrom}
              testID="target-date-input"
            />

            <Input
              label="Daily Calories (kcal) *"
              value={calories}
              onChangeText={(t) => {
                setCalories(t);
                if (formErrors.calories) setFormErrors((p) => ({ ...p, calories: '' }));
              }}
              keyboardType="decimal-pad"
              error={formErrors.calories}
              testID="target-calories-input"
            />

            <View style={styles.macroRow}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Protein (g) *"
                  value={protein}
                  onChangeText={(t) => {
                    setProtein(t);
                    if (formErrors.protein) setFormErrors((p) => ({ ...p, protein: '' }));
                  }}
                  keyboardType="decimal-pad"
                  error={formErrors.protein}
                  testID="target-protein-input"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Carbs (g) *"
                  value={carbs}
                  onChangeText={(t) => {
                    setCarbs(t);
                    if (formErrors.carbs) setFormErrors((p) => ({ ...p, carbs: '' }));
                  }}
                  keyboardType="decimal-pad"
                  error={formErrors.carbs}
                  testID="target-carbs-input"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Fat (g) *"
                  value={fat}
                  onChangeText={(t) => {
                    setFat(t);
                    if (formErrors.fat) setFormErrors((p) => ({ ...p, fat: '' }));
                  }}
                  keyboardType="decimal-pad"
                  error={formErrors.fat}
                  testID="target-fat-input"
                />
              </View>
            </View>

            <Button
              variant="primary"
              size="md"
              label="Save Target"
              onPress={handleCreateTarget}
              isLoading={isMutating}
              testID="save-target-btn"
            />
          </Card>
        )}

        {/* Current Effective Target */}
        <View style={styles.section}>
          <Text variant="heading" style={styles.sectionTitle}>
            Effective for {formatCalendarDate(activeDate)}
          </Text>

          {isLoading && !currentTarget ? (
            <View style={styles.centerSmall}>
              <LoadingIndicator />
            </View>
          ) : currentTarget ? (
            <NutritionTargetCard
              target={currentTarget}
              isEffective={true}
              testID="current-target-card"
            />
          ) : (
            <Card style={styles.emptyCard} testID="no-current-target-card">
              <Text variant="subheading" color={theme.colors.text.secondary} style={{ marginBottom: 2 }}>
                No active target
              </Text>
              <Text variant="caption" color={theme.colors.text.muted}>
                No target is effective on or before {activeDate}.
              </Text>
            </Card>
          )}
        </View>

        {/* Target History */}
        <View style={styles.section}>
          <Text variant="heading" style={styles.sectionTitle}>
            Target History ({targets.length})
          </Text>

          {targets.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text variant="caption" color={theme.colors.text.muted}>
                No target history recorded.
              </Text>
            </Card>
          ) : (
            targets.map((tgt) => (
              <NutritionTargetCard
                key={tgt.id}
                target={tgt}
                isEffective={currentTarget?.id === tgt.id}
                testID={`history-target-${tgt.id}`}
              />
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
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
  scrollContent: {
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
  formCard: {
    padding: theme.spacing.md,
    borderColor: theme.colors.brand.amber,
    gap: theme.spacing.sm,
  },
  formSectionLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: theme.colors.brand.amber,
    marginBottom: 4,
  },
  macroRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  section: {
    gap: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  emptyCard: {
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSmall: {
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

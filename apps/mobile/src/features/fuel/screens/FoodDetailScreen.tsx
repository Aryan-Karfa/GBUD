import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Text } from '../../../components/common/Text';
import { Card } from '../../../components/layout/Card';
import { Button } from '../../../components/common/Button';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { FoodTypeBadge, FuelErrorState } from '../components';
import { useFoods } from '../hooks/useFoods';
import { FoodDTO } from '../fuel.types';
import { theme } from '../../../theme/theme';

export interface FoodDetailScreenProps {
  foodId: string;
}

export const FoodDetailScreen: React.FC<FoodDetailScreenProps> = ({ foodId }) => {
  const { navigateFuel, goBack } = useNavigation();
  const { getFoodById, deactivateFood, isMutating } = useFoods();

  const [food, setFood] = useState<FoodDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeactivateVisible, setConfirmDeactivateVisible] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      const res = await getFoodById(foodId);
      if (isMounted) {
        if (res) {
          setFood(res);
        } else {
          setError('Food not found');
        }
        setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [foodId, getFoodById]);

  const handleDeactivate = async () => {
    try {
      await deactivateFood(foodId);
      setConfirmDeactivateVisible(false);
      goBack();
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate food');
    }
  };

  return (
    <Screen padding="md" testID="food-detail-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
          testID="food-detail-back-btn"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text variant="title" style={styles.headerTitle}>
          Food Details
        </Text>
      </View>

      {error && (
        <FuelErrorState
          error={error}
          onRetry={() => {
            setError(null);
            setIsLoading(true);
            getFoodById(foodId).then((res) => {
              if (res) setFood(res);
              setIsLoading(false);
            });
          }}
          testID="food-detail-error"
        />
      )}

      {isLoading ? (
        <View style={styles.center}>
          <LoadingIndicator />
          <Text variant="caption" color={theme.colors.text.muted} style={{ marginTop: 8 }}>
            Loading food details...
          </Text>
        </View>
      ) : !food ? (
        <View style={styles.center}>
          <Text variant="muted">Food not found.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Food Info Card */}
          <Card style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <View style={styles.nameArea}>
                <Text variant="heading" style={styles.name}>
                  {food.name}
                </Text>
                <Text variant="muted" style={styles.serving}>
                  Standard Serving: {food.servingSize} {food.servingUnit}
                </Text>
              </View>
              <FoodTypeBadge isCustom={food.isCustom} />
            </View>

            {food.description && (
              <Text variant="body" style={styles.description}>
                {food.description}
              </Text>
            )}

            {/* Nutrition Facts Section */}
            <View style={styles.nutritionFacts}>
              <Text variant="caption" style={styles.factsHeader}>
                NUTRITION FACTS PER SERVING
              </Text>

              <View style={styles.factRow}>
                <Text variant="body" style={styles.factLabel}>
                  Calories
                </Text>
                <Text variant="body" style={styles.factCalorie}>
                  {Math.round(food.calories)} kcal
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.factRow}>
                <Text variant="body" style={styles.factLabel}>
                  Protein
                </Text>
                <Text variant="body" style={styles.factValue}>
                  {food.protein} g
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.factRow}>
                <Text variant="body" style={styles.factLabel}>
                  Total Carbohydrates
                </Text>
                <Text variant="body" style={styles.factValue}>
                  {food.carbohydrates} g
                </Text>
              </View>

              {food.fiber !== null && food.fiber !== undefined && (
                <>
                  <View style={styles.divider} />
                  <View style={[styles.factRow, { paddingLeft: 12 }]}>
                    <Text variant="body" style={styles.factSubLabel}>
                      Dietary Fiber
                    </Text>
                    <Text variant="body" style={styles.factValue}>
                      {food.fiber} g
                    </Text>
                  </View>
                </>
              )}

              <View style={styles.divider} />

              <View style={styles.factRow}>
                <Text variant="body" style={styles.factLabel}>
                  Total Fat
                </Text>
                <Text variant="body" style={styles.factValue}>
                  {food.fat} g
                </Text>
              </View>
            </View>
          </Card>

          {/* Custom Food Actions */}
          {food.isCustom ? (
            <View style={styles.customActions}>
              <Button
                variant="outline"
                size="md"
                label="Edit Custom Food"
                onPress={() => navigateFuel('CustomFoodEditor', { foodId: food.id })}
                testID="edit-custom-food-btn"
              />
              <Button
                variant="danger"
                size="md"
                label="Deactivate Food"
                onPress={() => setConfirmDeactivateVisible(true)}
                isLoading={isMutating}
                style={{ marginTop: theme.spacing.xs }}
                testID="deactivate-food-btn"
              />
            </View>
          ) : (
            <View style={styles.systemFoodNote}>
              <Text variant="caption" color={theme.colors.text.muted} align="center">
                Verified system food. Read-only.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Deactivate Confirmation Modal */}
      <Modal
        visible={confirmDeactivateVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDeactivateVisible(false)}
        testID="deactivate-confirm-modal"
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text variant="title" style={styles.modalTitle}>
              Deactivate Food?
            </Text>
            <Text variant="body" color={theme.colors.text.secondary} style={styles.modalBody}>
              Are you sure you want to deactivate "{food?.name}"? It will no longer appear in your active food catalog. Past meals with this food will preserve their stored nutrition snapshot.
            </Text>
            <View style={styles.modalActions}>
              <Button
                variant="ghost"
                size="md"
                label="Cancel"
                fullWidth={false}
                onPress={() => setConfirmDeactivateVisible(false)}
                disabled={isMutating}
              />
              <Button
                variant="danger"
                size="md"
                label="Deactivate"
                fullWidth={false}
                onPress={handleDeactivate}
                isLoading={isMutating}
                testID="confirm-deactivate-btn"
              />
            </View>
          </Card>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
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
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxxl,
  },
  mainCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  nameArea: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
  },
  serving: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.brand.amber,
    marginTop: 2,
  },
  description: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  nutritionFacts: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: theme.spacing.xs,
  },
  factsHeader: {
    fontSize: 10,
    letterSpacing: 1,
    color: theme.colors.text.muted,
    marginBottom: theme.spacing.sm,
  },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  factLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
  },
  factSubLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
  },
  factCalorie: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.brand.amber,
  },
  factValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginVertical: 4,
  },
  customActions: {
    marginTop: theme.spacing.xs,
  },
  systemFoodNote: {
    padding: theme.spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    width: '100%',
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  modalBody: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
});

import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Card } from '../../../components/layout/Card';
import { Text } from '../../../components/common/Text';
import { Input } from '../../../components/forms/Input';
import { Button } from '../../../components/common/Button';
import { theme } from '../../../theme/theme';

export interface FoodQuantityInputProps {
  visible: boolean;
  foodName: string;
  unit: string;
  initialQuantity: number;
  onConfirm: (newQuantity: number) => Promise<void> | void;
  onClose: () => void;
  isSubmitting?: boolean;
  testID?: string;
}

export const FoodQuantityInput: React.FC<FoodQuantityInputProps> = ({
  visible,
  foodName,
  unit,
  initialQuantity,
  onConfirm,
  onClose,
  isSubmitting = false,
  testID = 'food-quantity-modal',
}) => {
  const [quantityStr, setQuantityStr] = useState<string>(String(initialQuantity));
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    const parsed = parseFloat(quantityStr.trim());
    if (isNaN(parsed) || parsed <= 0) {
      setError('Quantity must be a positive number');
      return;
    }

    try {
      await onConfirm(parsed);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update quantity');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={styles.overlay}>
        <Card style={styles.card}>
          <Text variant="title" style={styles.title} numberOfLines={1}>
            Edit Quantity
          </Text>
          <Text variant="body" style={styles.foodInfo}>
            {foodName}
          </Text>

          <View style={styles.inputContainer}>
            <Input
              label={`Quantity (${unit})`}
              value={quantityStr}
              onChangeText={(text) => {
                setQuantityStr(text);
                if (error) setError(null);
              }}
              keyboardType="decimal-pad"
              error={error}
              testID={`${testID}-input`}
            />
          </View>

          <View style={styles.actions}>
            <Button
              variant="ghost"
              size="md"
              label="Cancel"
              fullWidth={false}
              onPress={onClose}
              disabled={isSubmitting}
              testID={`${testID}-cancel-btn`}
            />
            <Button
              variant="primary"
              size="md"
              label="Save"
              fullWidth={false}
              onPress={handleSave}
              isLoading={isSubmitting}
              testID={`${testID}-confirm-btn`}
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  card: {
    width: '100%',
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
  },
  foodInfo: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
});

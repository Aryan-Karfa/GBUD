import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Text } from '../../../components/common/Text';
import { Button } from '../../../components/common/Button';
import { theme } from '../../../theme/theme';

export interface SetInputRowProps {
  initialReps?: number | null;
  initialWeight?: number | null;
  onSave: (values: { reps?: number; weight?: number }) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: 'add' | 'edit';
  setNumber?: number;
  testID?: string;
}

export const SetInputRow: React.FC<SetInputRowProps> = ({
  initialReps,
  initialWeight,
  onSave,
  onCancel,
  isSubmitting = false,
  mode = 'add',
  setNumber,
  testID = 'set-input-row',
}) => {
  const [reps, setReps] = useState<string>(
    initialReps !== null && initialReps !== undefined ? String(initialReps) : ''
  );
  const [weight, setWeight] = useState<string>(
    initialWeight !== null && initialWeight !== undefined ? String(initialWeight) : ''
  );
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);

    const parsedReps = reps.trim() ? parseInt(reps.trim(), 10) : undefined;
    const parsedWeight = weight.trim() ? parseFloat(weight.trim()) : undefined;

    // Validation: At least one of reps or weight must be provided
    if (parsedReps === undefined && parsedWeight === undefined) {
      setError('Enter reps, weight, or both');
      return;
    }

    if (parsedReps !== undefined && (isNaN(parsedReps) || parsedReps <= 0)) {
      setError('Reps must be a positive number');
      return;
    }

    if (parsedWeight !== undefined && (isNaN(parsedWeight) || parsedWeight < 0)) {
      setError('Weight must be 0 or greater');
      return;
    }

    try {
      await onSave({ reps: parsedReps, weight: parsedWeight });
      if (mode === 'add') {
        setReps('');
        setWeight('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save set');
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.inputRow}>
        {setNumber !== undefined && (
          <View style={styles.badge}>
            <Text variant="caption" style={styles.badgeText}>
              {setNumber}
            </Text>
          </View>
        )}

        {/* Weight Input */}
        <View style={styles.inputWrapper}>
          <Text variant="caption" style={styles.label}>
            WEIGHT (KG)
          </Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={(text) => {
              setWeight(text);
              if (error) setError(null);
            }}
            placeholder="0"
            placeholderTextColor={theme.colors.text.muted}
            keyboardType="decimal-pad"
            testID={`${testID}-weight-input`}
          />
        </View>

        {/* Reps Input */}
        <View style={styles.inputWrapper}>
          <Text variant="caption" style={styles.label}>
            REPS
          </Text>
          <TextInput
            style={styles.input}
            value={reps}
            onChangeText={(text) => {
              setReps(text);
              if (error) setError(null);
            }}
            placeholder="0"
            placeholderTextColor={theme.colors.text.muted}
            keyboardType="number-pad"
            testID={`${testID}-reps-input`}
          />
        </View>

        {/* Save / Cancel Button */}
        <View style={styles.btnWrapper}>
          <Button
            variant="primary"
            size="sm"
            label={mode === 'add' ? 'Log Set' : 'Save'}
            fullWidth={false}
            onPress={handleSave}
            isLoading={isSubmitting}
            testID={`${testID}-save-btn`}
          />
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              label="Cancel"
              fullWidth={false}
              onPress={onCancel}
              disabled={isSubmitting}
              testID={`${testID}-cancel-btn`}
            />
          )}
        </View>
      </View>

      {error && (
        <Text variant="error" style={styles.errorText} testID={`${testID}-error`}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: theme.radius.sm,
    marginVertical: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  badge: {
    width: 28,
    height: 38,
    borderRadius: theme.radius.xs,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.brand.emerald,
  },
  inputWrapper: {
    flex: 1,
  },
  label: {
    fontSize: 9,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.muted,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  input: {
    height: 38,
    backgroundColor: theme.colors.surfaces.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaces.cardBorder,
    borderRadius: theme.radius.xs,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  btnWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  errorText: {
    fontSize: 11,
    marginTop: 4,
    color: theme.colors.status.error,
  },
});

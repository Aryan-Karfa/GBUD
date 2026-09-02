import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Text } from '../../../components/common/Text';
import { Card } from '../../../components/layout/Card';
import { theme } from '../../../theme/theme';

export interface WorkoutActionBarProps {
  onComplete: () => Promise<void> | void;
  onAbandon: () => Promise<void> | void;
  isCompleting?: boolean;
  isAbandoning?: boolean;
  testID?: string;
}

export const WorkoutActionBar: React.FC<WorkoutActionBarProps> = ({
  onComplete,
  onAbandon,
  isCompleting = false,
  isAbandoning = false,
  testID = 'workout-action-bar',
}) => {
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [showAbandonModal, setShowAbandonModal] = useState<boolean>(false);

  const handleConfirmComplete = async () => {
    setShowCompleteModal(false);
    await onComplete();
  };

  const handleConfirmAbandon = async () => {
    setShowAbandonModal(false);
    await onAbandon();
  };

  return (
    <>
      <View style={styles.container} testID={testID}>
        <View style={styles.buttonWrapper}>
          <Button
            variant="outline"
            size="md"
            label="Abandon"
            onPress={() => setShowAbandonModal(true)}
            disabled={isCompleting || isAbandoning}
            isLoading={isAbandoning}
            style={styles.abandonButton}
            testID="workout-abandon-button"
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            variant="primary"
            size="md"
            label="Complete Workout"
            onPress={() => setShowCompleteModal(true)}
            disabled={isCompleting || isAbandoning}
            isLoading={isCompleting}
            testID="workout-complete-button"
          />
        </View>
      </View>

      {/* Complete Workout Confirmation Modal */}
      <Modal
        visible={showCompleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCompleteModal(false)}
        testID="complete-workout-modal"
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text variant="title" style={styles.modalTitle}>
              Finish Workout?
            </Text>
            <Text variant="body" style={styles.modalBody}>
              Are you sure you want to finish and complete this workout session?
              Recorded sets will be saved to your workout history.
            </Text>
            <View style={styles.modalActions}>
              <Button
                variant="ghost"
                size="md"
                label="Keep Training"
                fullWidth={false}
                onPress={() => setShowCompleteModal(false)}
                testID="cancel-complete-button"
              />
              <Button
                variant="primary"
                size="md"
                label="Yes, Complete"
                fullWidth={false}
                onPress={handleConfirmComplete}
                testID="confirm-complete-button"
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Abandon Workout Confirmation Modal */}
      <Modal
        visible={showAbandonModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAbandonModal(false)}
        testID="abandon-workout-modal"
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text variant="title" style={[styles.modalTitle, { color: theme.colors.status.error }]}>
              Abandon Workout?
            </Text>
            <Text variant="body" style={styles.modalBody}>
              This will mark the current workout session as abandoned and end training.
              This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <Button
                variant="ghost"
                size="md"
                label="Cancel"
                fullWidth={false}
                onPress={() => setShowAbandonModal(false)}
                testID="cancel-abandon-button"
              />
              <Button
                variant="danger"
                size="md"
                label="Yes, Abandon"
                fullWidth={false}
                onPress={handleConfirmAbandon}
                testID="confirm-abandon-button"
              />
            </View>
          </Card>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borders.border,
  },
  buttonWrapper: {
    flex: 1,
  },
  abandonButton: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
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
    backgroundColor: theme.colors.surfaces.card,
    borderColor: theme.colors.surfaces.cardBorder,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  modalBody: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
});

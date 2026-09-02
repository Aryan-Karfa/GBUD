import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Text, Button } from '../../../components';
import { theme } from '../../../theme/theme';
import { progressService } from '../services/progress.service';

export interface ExerciseOption {
  id: string;
  name: string;
}

export interface ExerciseSelectorProps {
  visible: boolean;
  onSelect: (exerciseId: string, exerciseName: string) => void;
  onClose: () => void;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  visible,
  onSelect,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    setLoading(true);

    progressService
      .listExercises({ search: search.trim() || undefined, limit: 50 })
      .then((res) => {
        if (isMounted) {
          const mapped = (res?.items || []).map((e: any) => ({
            id: e.id,
            name: e.name,
          }));
          setExercises(mapped);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setExercises([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [visible, search]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
              Select Exercise
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close exercise selector"
              style={styles.closeBtn}
            >
              <Text variant="body" color={theme.colors.text.muted}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Search exercises..."
            placeholderTextColor={theme.colors.text.muted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            autoCapitalize="none"
            accessibilityLabel="Search exercises"
          />

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={theme.colors.brand.emerald} />
            </View>
          ) : exercises.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="body" color={theme.colors.text.muted}>
                No exercises found.
              </Text>
            </View>
          ) : (
            <FlatList
              data={exercises}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.exerciseItem}
                  onPress={() => {
                    onSelect(item.id, item.name);
                    onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${item.name}`}
                >
                  <Text variant="body" weight="medium" color={theme.colors.text.primary}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}

          <Button label="Cancel" variant="secondary" size="md" onPress={onClose} style={styles.cancelButton} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  dialog: {
    backgroundColor: theme.colors.surfaces.card,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  closeBtn: {
    padding: theme.spacing.xs,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background.secondary,
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.md,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.colors.borders.border,
    marginBottom: theme.spacing.md,
  },
  loadingContainer: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: theme.spacing.md,
  },
  exerciseItem: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borders.border,
  },
  cancelButton: {
    marginTop: theme.spacing.sm,
  },
});

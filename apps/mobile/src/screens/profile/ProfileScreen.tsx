import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Screen, Text, Card, Button, Divider } from '../../components';
import { useAuth } from '../../auth/AuthProvider';
import { env } from '../../config/env';
import { theme } from '../../theme/theme';

export const ProfileScreen: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const handleLogout = async () => {
    setShowConfirmLogout(false);
    try {
      await logout();
    } catch {
      // Handled in AuthProvider
    }
  };

  return (
    <Screen scrollable padding="lg" testID="profile-screen">
      <View style={styles.header}>
        <Text variant="heading" weight="bold" style={styles.title}>
          Athlete Profile
        </Text>
        <Text variant="caption" color={theme.colors.text.secondary}>
          Account settings, security, and environment telemetry
        </Text>
      </View>

      {/* User Information Card */}
      <Card elevation="elevation2" style={styles.sectionCard} testID="profile-user-card">
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text variant="subheading" weight="bold">
              {user?.username || 'Unknown'}
            </Text>
            <Text variant="caption" color={theme.colors.text.secondary}>
              {user?.email || 'No email registered'}
            </Text>
          </View>
        </View>

        <Divider marginVertical={theme.spacing.md} />

        <View style={styles.infoRow}>
          <Text variant="caption" color={theme.colors.text.muted}>
            User ID
          </Text>
          <Text variant="caption" weight="medium" color={theme.colors.text.primary} testID="profile-user-id">
            {user?.id || 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="caption" color={theme.colors.text.muted}>
            Account Status
          </Text>
          <View style={styles.statusBadge}>
            <Text variant="caption" weight="bold" color={theme.colors.brand.emerald} testID="profile-user-status">
              {user?.status ? user.status.toUpperCase() : 'ACTIVE'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Security & Token Session Card */}
      <Card elevation="elevation2" style={styles.sectionCard} testID="profile-security-card">
        <Text variant="subheading" weight="semibold" style={styles.cardSectionTitle}>
          Security & Session
        </Text>

        <View style={styles.infoRow}>
          <Text variant="caption" color={theme.colors.text.muted}>
            Access Token Storage
          </Text>
          <Text variant="caption" weight="medium" color={theme.colors.brand.emerald}>
            In-Memory Only
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="caption" color={theme.colors.text.muted}>
            Refresh Token Storage
          </Text>
          <Text variant="caption" weight="medium" color={theme.colors.brand.emerald}>
            Expo SecureStore (Hardware Encrypted)
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="caption" color={theme.colors.text.muted}>
            Rotation Strategy
          </Text>
          <Text variant="caption" weight="medium" color={theme.colors.text.secondary}>
            Single-Flight Atomic Rotation
          </Text>
        </View>
      </Card>

      {/* Environment Diagnostics Card */}
      <Card elevation="elevation2" style={styles.sectionCard} testID="profile-environment-card">
        <Text variant="subheading" weight="semibold" style={styles.cardSectionTitle}>
          Environment & Runtime
        </Text>

        <View style={styles.infoRow}>
          <Text variant="caption" color={theme.colors.text.muted}>
            Application Version
          </Text>
          <Text variant="caption" weight="medium" color={theme.colors.text.primary}>
            0.1.0 (Android-First Foundation)
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="caption" color={theme.colors.text.muted}>
            API Endpoint
          </Text>
          <Text variant="caption" weight="medium" color={theme.colors.brand.cyan} testID="profile-api-url">
            {env.apiUrl}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="caption" color={theme.colors.text.muted}>
            Client Architecture
          </Text>
          <Text variant="caption" weight="medium" color={theme.colors.text.secondary}>
            @gbud/api-client
          </Text>
        </View>
      </Card>

      {/* Logout Action Button */}
      <Button
        label={isLoading ? 'Logging out...' : 'Log Out'}
        onPress={() => setShowConfirmLogout(true)}
        variant="danger"
        size="lg"
        isLoading={isLoading}
        disabled={isLoading}
        style={styles.logoutButton}
        testID="profile-logout-button"
      />

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showConfirmLogout}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmLogout(false)}
      >
        <View style={styles.modalOverlay}>
          <Card elevation="elevation8" style={styles.modalContent}>
            <Text variant="heading" weight="bold" style={styles.modalTitle}>
              Log Out?
            </Text>
            <Text variant="body" color={theme.colors.text.secondary} align="center" style={styles.modalMessage}>
              Are you sure you want to log out? Your active session credentials will be cleared from this device.
            </Text>

            <View style={styles.modalActions}>
              <Button
                label="Cancel"
                onPress={() => setShowConfirmLogout(false)}
                variant="secondary"
                size="md"
                style={styles.modalButton}
                testID="logout-confirm-cancel"
              />
              <Button
                label="Log Out"
                onPress={handleLogout}
                variant="danger"
                size="md"
                style={styles.modalButton}
                testID="logout-confirm-proceed"
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
    marginBottom: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  title: {
    marginBottom: theme.spacing.xs / 2,
  },
  sectionCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: 26,
  },
  avatarInfo: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.radius.xs,
  },
  cardSectionTitle: {
    marginBottom: theme.spacing.md,
  },
  logoutButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalTitle: {
    marginBottom: theme.spacing.sm,
  },
  modalMessage: {
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});

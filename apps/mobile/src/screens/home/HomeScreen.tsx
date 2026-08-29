import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen, Text, Card } from '../../components';
import { useAuth } from '../../auth/AuthProvider';
import { useNavigation } from '../../navigation/NavigationProvider';
import { theme } from '../../theme/theme';

export const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const { navigateTab } = useNavigation();

  return (
    <Screen scrollable padding="lg" testID="home-screen">
      {/* Header with branding and profile shortcut */}
      <View style={styles.topBar}>
        <View>
          <Text variant="title" weight="heavy" color={theme.colors.brand.emerald} style={styles.brand}>
            GBUD
          </Text>
          <Text variant="caption" color={theme.colors.text.muted}>
            ATHLETIC ECOSYSTEM
          </Text>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigateTab('Profile')}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          testID="home-profile-shortcut"
        >
          <Text style={styles.profileAvatar}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Greeting banner */}
      <View style={styles.greetingSection}>
        <Text variant="caption" weight="semibold" color={theme.colors.text.secondary} style={styles.greetingSub}>
          WELCOME BACK
        </Text>
        <Text variant="hero" weight="bold" style={styles.username}>
          {user?.username || 'Athlete'}
        </Text>
      </View>

      {/* Primary Domain Action Cards */}
      <View style={styles.cardsGrid}>
        <Card
          onPress={() => navigateTab('Train')}
          style={styles.domainCard}
          testID="home-train-card"
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🏋️</Text>
            <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text variant="caption" weight="bold" color={theme.colors.brand.emerald}>
                TRAIN
              </Text>
            </View>
          </View>
          <Text variant="subheading" weight="bold" style={styles.cardTitle}>
            Workouts
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            Log sessions, build templates, and track your lifts
          </Text>
        </Card>

        <Card
          onPress={() => navigateTab('Fuel')}
          style={styles.domainCard}
          testID="home-fuel-card"
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🥗</Text>
            <View style={[styles.badge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Text variant="caption" weight="bold" color={theme.colors.brand.amber}>
                FUEL
              </Text>
            </View>
          </View>
          <Text variant="subheading" weight="bold" style={styles.cardTitle}>
            Nutrition
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            Track meals, monitor macros, and reach daily targets
          </Text>
        </Card>

        <Card
          onPress={() => navigateTab('Progress')}
          style={styles.domainCardWide}
          testID="home-progress-card"
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📈</Text>
            <View style={[styles.badge, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
              <Text variant="caption" weight="bold" color={theme.colors.brand.cyan}>
                PROGRESS
              </Text>
            </View>
          </View>
          <Text variant="subheading" weight="bold" style={styles.cardTitle}>
            Training Analytics
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            View strength progression, 1RM milestones, and volume trends
          </Text>
        </Card>
      </View>

      {/* Today's Overview placeholder shell */}
      <View style={styles.overviewSection}>
        <Text variant="subheading" weight="bold" style={styles.sectionHeading}>
          Today's Overview
        </Text>

        <Card elevation="elevation2" style={styles.overviewCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text variant="caption" color={theme.colors.text.muted}>
                WORKOUT
              </Text>
              <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
                Rest Day
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text variant="caption" color={theme.colors.text.muted}>
                CALORIES
              </Text>
              <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
                -- / --
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text variant="caption" color={theme.colors.text.muted}>
                STREAK
              </Text>
              <Text variant="subheading" weight="bold" color={theme.colors.brand.emerald}>
                1 Day
              </Text>
            </View>
          </View>
          <Text variant="caption" color={theme.colors.text.muted} align="center" style={styles.overviewNote}>
            Full daily telemetry active in Phase 10–12
          </Text>
        </Card>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  brand: {
    letterSpacing: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaces.card,
    borderWidth: 1,
    borderColor: theme.colors.borders.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: {
    fontSize: 20,
  },
  greetingSection: {
    marginBottom: theme.spacing.xl,
  },
  greetingSub: {
    letterSpacing: 1.5,
    marginBottom: theme.spacing.xs / 2,
  },
  username: {
    color: theme.colors.text.primary,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  domainCard: {
    width: '48%',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  domainCardWide: {
    width: '100%',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardIcon: {
    fontSize: 28,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.radius.xs,
  },
  cardTitle: {
    marginBottom: theme.spacing.xs,
  },
  overviewSection: {
    marginBottom: theme.spacing.xxl,
  },
  sectionHeading: {
    marginBottom: theme.spacing.sm,
  },
  overviewCard: {
    padding: theme.spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.colors.borders.border,
  },
  overviewNote: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borders.border,
  },
});

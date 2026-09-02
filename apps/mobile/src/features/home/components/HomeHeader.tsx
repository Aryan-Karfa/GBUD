import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../../components';
import { theme } from '../../../theme/theme';
import { formatCalendarGreeting } from '../home.types';

export interface HomeHeaderProps {
  username?: string;
  dateStr: string;
  onProfilePress?: () => void;
  style?: object;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  username,
  dateStr,
  onProfilePress,
  style,
}) => {
  const formattedDate = formatCalendarGreeting(dateStr);
  const displayName = username ? username.toUpperCase() : 'ATHLETE';

  return (
    <View style={[styles.container, style]} testID="home-header">
      <View style={styles.topBar}>
        <View>
          <Text variant="caption" weight="bold" color={theme.colors.brand.emerald} style={styles.brandTitle}>
            GBUD
          </Text>
          <Text variant="caption" color={theme.colors.text.muted}>
            DAILY COMMAND CENTER
          </Text>
        </View>

        {onProfilePress && (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={onProfilePress}
            accessibilityRole="button"
            accessibilityLabel="Open user profile"
            testID="home-profile-button"
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.greetingArea}>
        <Text variant="caption" weight="bold" color={theme.colors.text.secondary} style={styles.greetingSub}>
          WELCOME BACK
        </Text>
        <Text variant="title" weight="bold" color={theme.colors.text.primary} style={styles.username}>
          {displayName}
        </Text>
        <Text variant="caption" color={theme.colors.text.muted} style={styles.dateText}>
          {formattedDate}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  brandTitle: {
    letterSpacing: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaces.card,
    borderWidth: 1,
    borderColor: theme.colors.borders.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 18,
  },
  greetingArea: {
    marginTop: theme.spacing.xs,
  },
  greetingSub: {
    letterSpacing: 1.5,
    marginBottom: theme.spacing.xs / 2,
  },
  username: {
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs / 2,
  },
  dateText: {
    marginTop: theme.spacing.xs / 2,
  },
});

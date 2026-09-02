import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from './NavigationProvider';
import { MainTab } from './navigation.types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { TrainNavigator } from './TrainNavigator';
import { FuelNavigator } from './FuelNavigator';
import { ProgressNavigator } from './ProgressNavigator';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { Text } from '../components/common/Text';
import { theme } from '../theme/theme';

interface TabConfig {
  key: MainTab;
  label: string;
  icon: string;
  testID: string;
}

const TABS: TabConfig[] = [
  { key: 'Home', label: 'Home', icon: '🏠', testID: 'tab-home' },
  { key: 'Train', label: 'Train', icon: '🏋️', testID: 'tab-train' },
  { key: 'Fuel', label: 'Fuel', icon: '🥗', testID: 'tab-fuel' },
  { key: 'Progress', label: 'Progress', icon: '📈', testID: 'tab-progress' },
  { key: 'Profile', label: 'Profile', icon: '👤', testID: 'tab-profile' },
];

export const MainNavigator: React.FC = () => {
  const { currentTab, navigateTab } = useNavigation();

  const renderActiveScreen = () => {
    switch (currentTab) {
      case 'Home':
        return <HomeScreen />;
      case 'Train':
        return <TrainNavigator />;
      case 'Fuel':
        return <FuelNavigator />;
      case 'Progress':
        return <ProgressNavigator />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenArea}>{renderActiveScreen()}</View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar} testID="main-bottom-bar">
        {TABS.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              onPress={() => navigateTab(tab.key)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
              testID={tab.testID}
            >
              <Text style={[styles.tabIcon, isActive ? styles.tabIconActive : undefined]}>
                {tab.icon}
              </Text>
              <Text
                variant="caption"
                weight={isActive ? 'bold' : 'regular'}
                color={isActive ? theme.colors.brand.emerald : theme.colors.text.muted}
                style={styles.tabLabel}
              >
                {tab.label}
              </Text>
              {isActive ? <View style={styles.activeIndicator} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  screenArea: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borders.border,
    paddingVertical: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    position: 'relative',
    minWidth: 56,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -theme.spacing.xs,
    width: 16,
    height: 3,
    backgroundColor: theme.colors.brand.emerald,
    borderRadius: theme.radius.full,
  },
});

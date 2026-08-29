import React from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme/theme';

export interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padding?: keyof typeof theme.spacing | number;
  backgroundColor?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  contentContainerStyle?: ViewStyle | ViewStyle[];
  testID?: string;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  padding = 'md',
  backgroundColor = theme.colors.background.primary,
  header,
  footer,
  style,
  contentContainerStyle,
  testID,
}) => {
  const paddingValue =
    typeof padding === 'number' ? padding : theme.spacing[padding] ?? theme.spacing.md;

  const innerStyle: ViewStyle = {
    paddingHorizontal: paddingValue,
    flexGrow: 1,
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }, style]} testID={testID}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={backgroundColor}
        translucent={false}
      />
      {header}
      {scrollable ? (
        <ScrollView
          style={styles.container}
          contentContainerStyle={[innerStyle, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.container, innerStyle, contentContainerStyle]}>
          {children}
        </View>
      )}
      {footer}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

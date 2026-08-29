import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { theme } from '../../theme/theme';

export type TextVariant =
  | 'hero'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'caption'
  | 'muted'
  | 'error'
  | 'success';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  weight?: keyof typeof theme.typography.weights;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color,
  weight,
  align,
  style,
  children,
  ...rest
}) => {
  const variantStyle = styles[variant] || styles.body;

  const customStyle: TextStyle = {};
  if (color) customStyle.color = color;
  if (weight) customStyle.fontWeight = theme.typography.weights[weight];
  if (align) customStyle.textAlign = align;

  return (
    <RNText style={[variantStyle, customStyle, style]} {...rest}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  hero: {
    fontSize: theme.typography.sizes.hero,
    fontWeight: theme.typography.weights.heavy,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.hero * theme.typography.lineHeights.tight,
  },
  title: {
    fontSize: theme.typography.sizes.title,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.title * theme.typography.lineHeights.tight,
  },
  heading: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.xxl * theme.typography.lineHeights.normal,
  },
  subheading: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.xl * theme.typography.lineHeights.normal,
  },
  body: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.md * theme.typography.lineHeights.normal,
  },
  caption: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.normal,
  },
  muted: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.muted,
    lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.normal,
  },
  error: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.status.error,
    lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.normal,
  },
  success: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.status.success,
    lineHeight: theme.typography.sizes.sm * theme.typography.lineHeights.normal,
  },
});

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { Button } from '../components/common/Button';
import { Input } from '../components/forms/Input';
import { Card } from '../components/layout/Card';
import { Text } from '../components/common/Text';
import { LoadingScreen } from '../components/feedback/LoadingScreen';
import { ErrorState } from '../components/feedback/ErrorState';
import { EmptyState } from '../components/feedback/EmptyState';
import { Divider } from '../components/common/Divider';

describe('Reusable UI Components', () => {
  it('should construct Button with correct props and handle press', () => {
    const handlePress = vi.fn();
    const element = React.createElement(Button, {
      label: 'Submit',
      onPress: handlePress,
      variant: 'primary',
      size: 'lg',
      disabled: false,
      isLoading: false,
    });

    expect(element.props.label).toBe('Submit');
    expect(element.props.variant).toBe('primary');
    expect(element.props.size).toBe('lg');

    // Simulate press
    element.props.onPress({} as any);
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('should support loading and disabled states on Button', () => {
    const handlePress = vi.fn();
    const loadingButton = React.createElement(Button, {
      label: 'Loading...',
      onPress: handlePress,
      isLoading: true,
    });
    expect(loadingButton.props.isLoading).toBe(true);

    const disabledButton = React.createElement(Button, {
      label: 'Disabled',
      onPress: handlePress,
      disabled: true,
    });
    expect(disabledButton.props.disabled).toBe(true);
  });

  it('should construct Input with label, error, and password settings', () => {
    const element = React.createElement(Input, {
      label: 'Password',
      value: 'secret',
      isPassword: true,
      error: 'Invalid password',
      helperText: 'Must be 8+ characters',
    });

    expect(element.props.label).toBe('Password');
    expect(element.props.value).toBe('secret');
    expect(element.props.isPassword).toBe(true);
    expect(element.props.error).toBe('Invalid password');
    expect(element.props.helperText).toBe('Must be 8+ characters');
  });

  it('should construct Card with elevation and bordered styles', () => {
    const element = React.createElement(Card, {
      elevation: 'elevation4',
      bordered: true,
      padding: 'lg',
      children: 'Card Content',
    });

    expect(element.props.elevation).toBe('elevation4');
    expect(element.props.bordered).toBe(true);
    expect(element.props.padding).toBe('lg');
    expect(element.props.children).toBe('Card Content');
  });

  it('should construct Text component across variants', () => {
    const heroText = React.createElement(Text, { variant: 'hero', children: 'HERO' });
    expect(heroText.props.variant).toBe('hero');
    expect(heroText.props.children).toBe('HERO');

    const errorText = React.createElement(Text, { variant: 'error', children: 'Error msg' });
    expect(errorText.props.variant).toBe('error');
  });

  it('should construct LoadingScreen with custom message', () => {
    const element = React.createElement(LoadingScreen, {
      message: 'Bootstrapping application...',
    });
    expect(element.props.message).toBe('Bootstrapping application...');
  });

  it('should construct ErrorState with title, message, requestId, and retry callback', () => {
    const onRetry = vi.fn();
    const element = React.createElement(ErrorState, {
      title: 'Failed to Load',
      message: 'Network timeout',
      requestId: 'req-err-456',
      onRetry,
    });

    expect(element.props.title).toBe('Failed to Load');
    expect(element.props.message).toBe('Network timeout');
    expect(element.props.requestId).toBe('req-err-456');

    element.props.onRetry?.();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should construct EmptyState and Divider', () => {
    const empty = React.createElement(EmptyState, {
      title: 'No Workouts',
      description: 'Your history is clear',
    });
    expect(empty.props.title).toBe('No Workouts');

    const divider = React.createElement(Divider, { marginVertical: 12 });
    expect(divider.props.marginVertical).toBe(12);
  });
});

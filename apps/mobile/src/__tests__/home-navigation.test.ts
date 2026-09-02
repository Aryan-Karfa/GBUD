import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NavigationManager } from '../navigation/navigation.manager';
import { BackHandler } from 'react-native';

describe('Home Cross-Domain Navigation', () => {
  let nav: NavigationManager;

  beforeEach(() => {
    vi.restoreAllMocks();
    (BackHandler as any)._reset();
    nav = new NavigationManager();
    nav.setAuthStatus('AUTHENTICATED');
  });

  it('starts at Home tab by default', () => {
    expect(nav.getCurrentTab()).toBe('Home');
  });

  it('navigates from Home to TRAIN templates when Start Workout is triggered', () => {
    nav.navigateTrain('WorkoutTemplates');
    expect(nav.getCurrentTab()).toBe('Train');
    expect(nav.getTrainScreen()).toBe('WorkoutTemplates');
  });

  it('navigates from Home to TRAIN Active Workout with sessionId when Continue Workout is triggered', () => {
    nav.navigateTrain('ActiveWorkout', { sessionId: 'sess-active-123' });
    expect(nav.getCurrentTab()).toBe('Train');
    expect(nav.getTrainScreen()).toBe('ActiveWorkout');
    expect(nav.getTrainParams()).toEqual({ sessionId: 'sess-active-123' });
  });

  it('navigates from Home to TRAIN history', () => {
    nav.navigateTrain('WorkoutHistory');
    expect(nav.getCurrentTab()).toBe('Train');
    expect(nav.getTrainScreen()).toBe('WorkoutHistory');
  });

  it('navigates from Home to FUEL meals with date parameter', () => {
    nav.navigateFuel('Meals', { date: '2026-09-03' });
    expect(nav.getCurrentTab()).toBe('Fuel');
    expect(nav.getFuelScreen()).toBe('Meals');
    expect(nav.getFuelParams()).toEqual({ date: '2026-09-03' });
  });

  it('navigates from Home to PROGRESS home analytics', () => {
    nav.navigateProgress('ProgressHome');
    expect(nav.getCurrentTab()).toBe('Progress');
    expect(nav.getProgressScreen()).toBe('ProgressHome');
  });

  it('navigates from Home to PROGRESS personal records', () => {
    nav.navigateProgress('PersonalRecords');
    expect(nav.getCurrentTab()).toBe('Progress');
    expect(nav.getProgressScreen()).toBe('PersonalRecords');
  });

  it('navigates from Home to Profile tab', () => {
    nav.navigateTab('Profile');
    expect(nav.getCurrentTab()).toBe('Profile');
  });

  it('returns false on Back from Home tab to let Android system minimize the app', () => {
    expect(nav.getCurrentTab()).toBe('Home');
    const handled = nav.goBack();
    expect(handled).toBe(false);
  });
});

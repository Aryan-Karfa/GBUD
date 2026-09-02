import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NavigationManager } from '../navigation/navigation.manager';

describe('PROGRESS Navigation Stack & Behavior', () => {
  let nav: NavigationManager;

  beforeEach(() => {
    nav = new NavigationManager();
    nav.setAuthStatus('AUTHENTICATED');
  });

  it('initializes on Home tab with ProgressHome as root of progress stack', () => {
    expect(nav.getCurrentTab()).toBe('Home');
    expect(nav.getProgressScreen()).toBe('ProgressHome');
  });

  it('navigateProgress sets currentTab to Progress and pushes screen', () => {
    nav.navigateProgress('TrainingVolume');
    expect(nav.getCurrentTab()).toBe('Progress');
    expect(nav.getProgressScreen()).toBe('TrainingVolume');
  });

  it('navigateProgress with params stores params correctly', () => {
    nav.navigateProgress('ExercisePerformance', { exerciseId: 'ex-bench', exerciseName: 'Bench Press' });
    expect(nav.getCurrentTab()).toBe('Progress');
    expect(nav.getProgressScreen()).toBe('ExercisePerformance');
    expect(nav.getProgressParams()).toEqual({ exerciseId: 'ex-bench', exerciseName: 'Bench Press' });
  });

  it('navigateProgress to ProgressHome resets the progress stack', () => {
    nav.navigateProgress('TrainingVolume');
    nav.navigateProgress('ExerciseVolume');
    expect(nav.getProgressScreen()).toBe('ExerciseVolume');

    nav.navigateProgress('ProgressHome');
    expect(nav.getProgressScreen()).toBe('ProgressHome');
  });

  it('goBack pops the progress stack until root', () => {
    nav.navigateProgress('TrainingVolume');
    nav.navigateProgress('ExerciseVolume');

    expect(nav.getProgressScreen()).toBe('ExerciseVolume');

    // First back: pops ExerciseVolume -> back to TrainingVolume
    const handled1 = nav.goBack();
    expect(handled1).toBe(true);
    expect(nav.getProgressScreen()).toBe('TrainingVolume');

    // Second back: pops TrainingVolume -> back to ProgressHome
    const handled2 = nav.goBack();
    expect(handled2).toBe(true);
    expect(nav.getProgressScreen()).toBe('ProgressHome');

    // Third back: at root ProgressHome -> transitions to Home tab
    const handled3 = nav.goBack();
    expect(handled3).toBe(true);
    expect(nav.getCurrentTab()).toBe('Home');
  });

  it('respects registered back interceptor', () => {
    nav.navigateProgress('ExerciseTrend', { exerciseId: 'ex-1' });

    const interceptor = vi.fn().mockReturnValue(true);
    nav.registerBackInterceptor(interceptor);

    const handled = nav.goBack();
    expect(handled).toBe(true);
    expect(interceptor).toHaveBeenCalled();
    // Screen should not have popped because interceptor consumed it
    expect(nav.getProgressScreen()).toBe('ExerciseTrend');

    // When interceptor returns false, navigation proceeds
    nav.registerBackInterceptor(() => false);
    nav.goBack();
    expect(nav.getProgressScreen()).toBe('ProgressHome');
  });

  it('reset clears the progress stack to ProgressHome', () => {
    nav.navigateProgress('PersonalRecords');
    expect(nav.getProgressScreen()).toBe('PersonalRecords');

    nav.reset();
    expect(nav.getCurrentTab()).toBe('Home');
    expect(nav.getProgressScreen()).toBe('ProgressHome');
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NavigationManager } from '../navigation/navigation.manager';
import { BackHandler } from 'react-native';

describe('TRAIN Navigation & Android Back Button Interceptor', () => {
  let nav: NavigationManager;

  beforeEach(() => {
    (BackHandler as any)._reset();
    nav = new NavigationManager();
    nav.setAuthStatus('AUTHENTICATED');
  });

  it('initializes with TrainHome as default TRAIN screen and empty params', () => {
    expect(nav.getTrainScreen()).toBe('TrainHome');
    expect(nav.getTrainParams()).toEqual({});
  });

  it('navigates between TRAIN screens and maintains stack', () => {
    nav.navigateTrain('WorkoutTemplates');
    expect(nav.getTrainScreen()).toBe('WorkoutTemplates');

    nav.navigateTrain('WorkoutTemplateDetail', { templateId: 'tpl-1' });
    expect(nav.getTrainScreen()).toBe('WorkoutTemplateDetail');
    expect(nav.getTrainParams()).toEqual({ templateId: 'tpl-1' });

    // Going back should return to WorkoutTemplates
    const handled = nav.goBack();
    expect(handled).toBe(true);
    expect(nav.getTrainScreen()).toBe('WorkoutTemplates');
  });

  it('pops all the way back to TrainHome and then to Home tab', () => {
    nav.navigateTab('Train');
    nav.navigateTrain('ExerciseLibrary');
    nav.navigateTrain('ExerciseDetail', { exerciseId: 'ex-1' });

    // Back 1: ExerciseDetail -> ExerciseLibrary
    expect(nav.goBack()).toBe(true);
    expect(nav.getTrainScreen()).toBe('ExerciseLibrary');

    // Back 2: ExerciseLibrary -> TrainHome
    expect(nav.goBack()).toBe(true);
    expect(nav.getTrainScreen()).toBe('TrainHome');

    // Back 3: TrainHome -> Home tab
    expect(nav.goBack()).toBe(true);
    expect(nav.getCurrentTab()).toBe('Home');
  });

  it('intercepts back press when a back interceptor is registered (e.g. ActiveWorkout dialog)', () => {
    nav.navigateTrain('ActiveWorkout', { sessionId: 'ws-123' });

    const interceptorSpy = vi.fn().mockReturnValue(true); // Return true = handled (prevent back)
    nav.registerBackInterceptor(interceptorSpy);

    // Call goBack
    const handled = nav.goBack();

    expect(interceptorSpy).toHaveBeenCalledTimes(1);
    expect(handled).toBe(true);
    // Screen should NOT have changed because interceptor returned true!
    expect(nav.getTrainScreen()).toBe('ActiveWorkout');
    expect(nav.getTrainParams().sessionId).toBe('ws-123');
  });

  it('allows back navigation when interceptor is cleared', () => {
    nav.navigateTrain('WorkoutTemplates');
    nav.navigateTrain('ActiveWorkout', { sessionId: 'ws-123' });

    const interceptor = vi.fn().mockReturnValue(true);
    nav.registerBackInterceptor(interceptor);

    // Unregister interceptor
    nav.registerBackInterceptor(null);

    // Now goBack should proceed normally
    const handled = nav.goBack();
    expect(handled).toBe(true);
    expect(interceptor).not.toHaveBeenCalled();
    expect(nav.getTrainScreen()).toBe('WorkoutTemplates');
  });

  it('notifies listeners when trainScreen changes', () => {
    const listener = vi.fn();
    nav.subscribe(listener);

    nav.navigateTrain('WorkoutHistory');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(nav.getTrainScreen()).toBe('WorkoutHistory');
  });
});

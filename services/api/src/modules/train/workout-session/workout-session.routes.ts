import { Router } from 'express';
import { workoutSessionController } from './workout-session.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import {
  createWorkoutSessionSchema,
  addWorkoutSetSchema,
  updateWorkoutSetSchema,
  workoutSessionQuerySchema,
} from '@gbud/validation';

const router: Router = Router();

// Require authentication for all workout session endpoints
router.use(authenticate);

router.post('/', validateRequest({ body: createWorkoutSessionSchema }), workoutSessionController.start);
router.get('/active', workoutSessionController.getActive);
router.get('/', validateRequest({ query: workoutSessionQuerySchema }), workoutSessionController.listHistory);
router.get('/:id', workoutSessionController.getById);

router.post(
  '/:sessionId/exercises/:sessionExerciseId/sets',
  validateRequest({ body: addWorkoutSetSchema }),
  workoutSessionController.addSet
);
router.patch(
  '/:sessionId/exercises/:sessionExerciseId/sets/:setId',
  validateRequest({ body: updateWorkoutSetSchema }),
  workoutSessionController.updateSet
);
router.delete(
  '/:sessionId/exercises/:sessionExerciseId/sets/:setId',
  workoutSessionController.deleteSet
);

router.post('/:id/complete', workoutSessionController.complete);
router.post('/:id/abandon', workoutSessionController.abandon);

export default router;

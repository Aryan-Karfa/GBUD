import { Router } from 'express';
import { workoutTemplateController } from './workout-template.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import {
  createWorkoutTemplateSchema,
  updateWorkoutTemplateSchema,
  addTemplateExerciseSchema,
  reorderTemplateExercisesSchema,
} from '@gbud/validation';

const router: Router = Router();

router.use(authenticate);

router.get('/', workoutTemplateController.list);
router.post('/', validateRequest({ body: createWorkoutTemplateSchema }), workoutTemplateController.create);
router.get('/:id', workoutTemplateController.getById);
router.patch('/:id', validateRequest({ body: updateWorkoutTemplateSchema }), workoutTemplateController.update);
router.delete('/:id', workoutTemplateController.delete);

router.post('/:id/exercises', validateRequest({ body: addTemplateExerciseSchema }), workoutTemplateController.addExercise);
router.patch('/:id/exercises/reorder', validateRequest({ body: reorderTemplateExercisesSchema }), workoutTemplateController.reorderExercises);
router.delete('/:id/exercises/:templateExerciseId', workoutTemplateController.removeExercise);

export default router;

import { Router } from 'express';
import { mealController } from './meal.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import {
  createMealSchema,
  updateMealSchema,
  addMealFoodEntrySchema,
  updateMealFoodEntrySchema,
} from '@gbud/validation';

const router: Router = Router();

router.use(authenticate);

// Meal CRUD
router.get('/', mealController.list);
router.get('/:id', mealController.getById);
router.post('/', validateRequest({ body: createMealSchema }), mealController.create);
router.patch('/:id', validateRequest({ body: updateMealSchema }), mealController.update);
router.delete('/:id', mealController.delete);

// Meal Food Entries
router.post(
  '/:mealId/foods',
  validateRequest({ body: addMealFoodEntrySchema }),
  mealController.addFoodEntry
);
router.patch(
  '/:mealId/foods/:entryId',
  validateRequest({ body: updateMealFoodEntrySchema }),
  mealController.updateFoodEntry
);
router.delete('/:mealId/foods/:entryId', mealController.deleteFoodEntry);

export default router;

import { Router } from 'express';
import { mealController } from '../meal/meal.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import { progressDateRangeSchema } from '@gbud/validation';

const router: Router = Router();

router.use(authenticate);

router.get('/summary/compare', mealController.getSummaryCompare);
router.get('/summary', mealController.getSummary);
router.get('/history', validateRequest({ query: progressDateRangeSchema }), mealController.getHistory);

export default router;

import { Router } from 'express';
import foodRoutes from './food/food.routes';
import mealRoutes from './meal/meal.routes';
import targetRoutes from './target/target.routes';
import summaryRoutes from './summary/summary.routes';

const router: Router = Router();

router.use('/foods', foodRoutes);
router.use('/meals', mealRoutes);
router.use('/targets', targetRoutes);
router.use('/', summaryRoutes);

export default router;

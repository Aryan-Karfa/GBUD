import { Router } from 'express';
import { targetController } from './target.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import { nutritionTargetSchema, updateNutritionTargetSchema } from '@gbud/validation';

const router: Router = Router();

router.use(authenticate);

router.get('/current', targetController.getCurrent);
router.get('/', targetController.list);
router.post('/', validateRequest({ body: nutritionTargetSchema }), targetController.create);
router.patch('/:id', validateRequest({ body: updateNutritionTargetSchema }), targetController.update);
router.delete('/:id', targetController.delete);

export default router;

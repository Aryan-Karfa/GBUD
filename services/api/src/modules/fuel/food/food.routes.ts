import { Router } from 'express';
import { foodController } from './food.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import { createFoodSchema, updateFoodSchema, foodQuerySchema } from '@gbud/validation';

const router: Router = Router();

router.use(authenticate);

router.get('/', validateRequest({ query: foodQuerySchema }), foodController.list);
router.get('/:id', foodController.getById);
router.post('/', validateRequest({ body: createFoodSchema }), foodController.create);
router.patch('/:id', validateRequest({ body: updateFoodSchema }), foodController.update);
router.delete('/:id', foodController.delete);

export default router;

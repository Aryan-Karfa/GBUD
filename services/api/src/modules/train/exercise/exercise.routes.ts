import { Router } from 'express';
import { exerciseController } from './exercise.controller';
import { validateRequest } from '../../../middleware/validation.middleware';
import { exerciseQuerySchema } from '@gbud/validation';

const router: Router = Router();

router.get('/', validateRequest({ query: exerciseQuerySchema }), exerciseController.list);
router.get('/:id', exerciseController.getById);

export default router;

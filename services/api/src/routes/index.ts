import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from '../modules/auth/auth.routes';
<<<<<<< HEAD
=======
import exerciseRoutes from '../modules/train/exercise/exercise.routes';
import workoutTemplateRoutes from '../modules/train/workout-template/workout-template.routes';
import workoutSessionRoutes from '../modules/train/workout-session/workout-session.routes';
import progressRoutes from '../modules/progress/progress.routes';
import fuelRoutes from '../modules/fuel/fuel.routes';
>>>>>>> b83a35e (Completed Phase 9)

const router: Router = Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
<<<<<<< HEAD
=======
router.use('/exercises', exerciseRoutes);
router.use('/workout-templates', workoutTemplateRoutes);
router.use('/workout-sessions', workoutSessionRoutes);
router.use('/progress', progressRoutes);
router.use('/fuel', fuelRoutes);
>>>>>>> b83a35e (Completed Phase 9)

export default router;

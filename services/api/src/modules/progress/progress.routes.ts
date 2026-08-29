import { Router } from 'express';
import { progressController } from './progress.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { progressDateRangeSchema } from '@gbud/validation';

const router: Router = Router();

// Require authentication for all progress endpoints
router.use(authenticate);

router.get('/summary', validateRequest({ query: progressDateRangeSchema }), progressController.getSummary);
router.get('/frequency', validateRequest({ query: progressDateRangeSchema }), progressController.getFrequency);
router.get('/volume', validateRequest({ query: progressDateRangeSchema }), progressController.getVolume);
router.get('/volume/exercises', validateRequest({ query: progressDateRangeSchema }), progressController.getVolumeByExercise);
router.get('/volume/muscles', validateRequest({ query: progressDateRangeSchema }), progressController.getVolumeByMuscleGroup);
router.get('/prs', validateRequest({ query: progressDateRangeSchema }), progressController.getPRs);

router.get('/exercises/:exerciseId', progressController.getExercisePerformance);
router.get('/exercises/:exerciseId/trend', progressController.getExerciseTrend);

router.get('/dashboard', progressController.getDashboard);

export default router;

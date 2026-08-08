import { Router, Request, Response } from 'express';
import { healthController } from '../controllers/health.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { testBodySchema } from '@gbud/validation';
import { APIResponse } from '@gbud/types';
import { formatTimestamp } from '@gbud/utils';

const router: Router = Router();

router.get('/health', healthController.checkHealth);

// Phase 1 test route to verify Zod validation middleware contract (returns 422 VALIDATION_ERROR if invalid)
router.post(
  '/test-validation',
  validateRequest({ body: testBodySchema }),
  (req: Request, res: Response<APIResponse<{ validated: boolean }>>) => {
    res.status(200).json({
      success: true,
      message: 'Validation passed successfully',
      data: { validated: true },
      timestamp: formatTimestamp(),
    });
  }
);

export default router;

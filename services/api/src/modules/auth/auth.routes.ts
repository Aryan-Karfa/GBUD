import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../middleware/rate-limit.middleware';
import { registerSchema, loginSchema, refreshSchema } from '@gbud/validation';

const router: Router = Router();

router.post('/register', authRateLimiter, validateRequest({ body: registerSchema }), authController.register);
router.post('/login', authRateLimiter, validateRequest({ body: loginSchema }), authController.login);
router.post('/refresh', authRateLimiter, validateRequest({ body: refreshSchema }), authController.refresh);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authenticate, authController.me);

export default router;

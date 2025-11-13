import express from 'express';
import * as ctrl from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', authenticate, ctrl.me);

// Development helper: check whether request carries a refresh cookie and
// whether the server recognizes it. Useful for debugging cross-origin cookie issues.
// production: debug routes removed

export default router;

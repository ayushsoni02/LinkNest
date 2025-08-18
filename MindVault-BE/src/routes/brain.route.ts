import { Router } from 'express';
import { userMiddleware } from '../middlewares/middleware';
import { shareBrain, getSharedBrain } from '../controllers/brain.controllers';

const router = Router();

router.post('/share', userMiddleware, shareBrain);
router.get('/:shareLink', getSharedBrain);

export default router;



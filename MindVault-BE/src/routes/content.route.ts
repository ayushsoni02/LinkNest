import { Router } from 'express';
import { userMiddleware } from '../middlewares/middleware';
import { createContent, listContent, deleteContentById } from '../controllers/content.controllers';

const router = Router();

router.post('/', userMiddleware, createContent);
router.get('/', userMiddleware, listContent);
router.delete('/:id', userMiddleware, deleteContentById);

export default router;



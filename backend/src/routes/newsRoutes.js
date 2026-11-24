import { Router } from 'express';
import { getNewsById, listNews } from '../controllers/newsController.js';

const router = Router();
router.get('/', listNews);
router.get('/:id', getNewsById);

export default router;

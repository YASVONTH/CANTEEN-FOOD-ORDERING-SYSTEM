import express from 'express';
import {
    getMenu,
    createFoodItem,
    updateFoodItem,
    deleteFoodItem,
} from '../controllers/menuController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getMenu)
    .post(protect, admin, createFoodItem);

router.route('/:id')
    .put(protect, admin, updateFoodItem)
    .delete(protect, admin, deleteFoodItem);

export default router;

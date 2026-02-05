import express from 'express';
import { authenticateToken } from '../middelware/authMiddleware.js';
import { upload } from '../middelware/uploadMiddleware.js';

import { login } from '../controller/authController.js';
import { getProducts, createProduct, deleteProduct } from '../controller/productController.js';
import { getAllMitra, createMitra, deleteMitra } from '../controller/mitraController.js';
import { getOrders, createOrder, updateOrderStatus } from '../controller/orderController.js';
import { handleWebhook } from '../controller/webhookController.js';

const router = express.Router();

// Auth
router.post('/login', login);

// Product Routes
router.get('/products', getProducts);
router.post('/products', authenticateToken, upload.single('image'), createProduct);
router.delete('/products/:id', authenticateToken, deleteProduct);

// Mitra Routes
router.get('/mitra', authenticateToken, getAllMitra);
router.post('/mitra', authenticateToken, createMitra);
router.delete('/mitra/:id', authenticateToken, deleteMitra);

// Order Routes
router.get('/orders', authenticateToken, getOrders);
router.post('/orders', createOrder);
router.patch('/orders/:id/status', authenticateToken, updateOrderStatus);

// Webhook Route
router.post('/webhook', handleWebhook);

export default router;
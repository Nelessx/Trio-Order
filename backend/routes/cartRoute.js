import express from 'express'
import authMiddleware from '../middleware/auth.js';
import { addToCart, clearCart, deleteCartItem, getCart, updateCartItem } from '../controllers/cartController.js';


const router = express.Router();

router.route('/')
.get(authMiddleware,getCart)
.post(authMiddleware,addToCart)

router.post('/clear',authMiddleware,clearCart)

router.route('/:id')
.put(authMiddleware,updateCartItem)
.delete(authMiddleware,deleteCartItem)

export default router

import express from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { validateAddToCart } from '../validator/cart.validator.js'
import { addToCart, getCart, updateCartItem, removeCartItem } from '../controllers/cart.controller.js'

const router = express.Router()


router.post('/add/:productId/:variantId',authenticate,validateAddToCart,addToCart)
router.get('/',authenticate,getCart)
router.patch('/item/:itemId', authenticate, updateCartItem)
router.delete('/item/:itemId', authenticate, removeCartItem)

export default router
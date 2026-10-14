import express from 'express'
import { authenticate } from '../middlewares/auth.middleware.js'
import { validateAddToCart } from '../validator/cart.validator.js'
import { addToCart, getCart, updateCartItem, removeCartItem, createOrderController, verifyOrderController, getCheckoutConfig, getSellerOrders } from '../controllers/cart.controller.js'

const router = express.Router()


router.post('/add/:productId/:variantId',authenticate,validateAddToCart,addToCart)
router.get('/',authenticate,getCart)
router.patch('/item/:itemId', authenticate, updateCartItem)
router.delete('/item/:itemId', authenticate, removeCartItem)
router.get('/payment/config',authenticate,getCheckoutConfig)
router.post('/payment/create/order',authenticate,createOrderController)
router.post('/payment/verify/order',authenticate,verifyOrderController)
router.get('/seller/orders',authenticate,getSellerOrders)
export default router
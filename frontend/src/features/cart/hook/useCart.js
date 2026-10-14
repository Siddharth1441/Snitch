import { addItem, getCart, updateItem, removeItem, createCartOrder,verifyCartOrder, getCheckoutConfig } from '../service/cart.api.js'
import { useDispatch } from 'react-redux'
import { setItems, clearCart } from '../state/cart.slice.js'

export const useCart = () => {
    const dispatch  = useDispatch()
    async function handleAddItemToCart({productId, variantId, quantity = 1}) {
        const data = await addItem({productId, variantId, quantity})
        dispatch(setItems(data.cart?.items || []))
        return data
    }

    async function handleGetCart() {
        const data = await getCart()
        dispatch(setItems(data.cart?.items || []))
        return data.cart
    }

    async function handleUpdateCartItem(itemId, quantity) {
        const data = await updateItem(itemId, quantity)
        dispatch(setItems(data.cart?.items || []))
        return data.cart
    }

    async function handleRemoveCartItem(itemId) {
        const data = await removeItem(itemId)
        dispatch(setItems(data.cart?.items || []))
        return data.cart
    }

    async function handleCreateCartOrder(shippingAddress) {
        const data = await createCartOrder(shippingAddress)
        return data.order
    }

    async function handleVerifyCartOrder({razorpay_order_id, razorpay_payment_id, razorpay_signature}) {
        const data = await verifyCartOrder({razorpay_order_id, razorpay_payment_id, razorpay_signature})
        if (data.success) dispatch(clearCart())
        return data.success
    }    

    return { handleAddItemToCart, handleGetCart, handleUpdateCartItem, handleRemoveCartItem ,handleCreateCartOrder, handleVerifyCartOrder, getCheckoutConfig }
}
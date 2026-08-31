import { addItem, getCart, updateItem, removeItem, createCartOrder,verifyCartOrder } from '../service/cart.api.js'
import { useDispatch } from 'react-redux'
import { setItems } from '../state/cart.slice.js'

export const useCart = () => {
    const dispatch  = useDispatch()
    async function handleAddItemToCart({productId, variantId}) {
        const data = await addItem({productId, variantId})
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

    async function handleCreateCartOrder() {
        
        const data = await createCartOrder()
        return data.order
    }

    async function handleVerifyCartOrder({razorpay_order_id, razorpay_payment_id, razorpay_signature}) {
        const data = await verifyCartOrder({razorpay_order_id, razorpay_payment_id, razorpay_signature})
        return data.success
    }    

    return { handleAddItemToCart, handleGetCart, handleUpdateCartItem, handleRemoveCartItem ,handleCreateCartOrder, handleVerifyCartOrder}
}
import { addItem, getCart, updateItem, removeItem } from '../service/cart.api.js'
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

    return { handleAddItemToCart, handleGetCart, handleUpdateCartItem, handleRemoveCartItem }
}
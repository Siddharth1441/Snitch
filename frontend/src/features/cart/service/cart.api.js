import axios from "axios";

const cartApiInstance = axios.create({
    baseURL: "/api/cart",
    withCredentials: true,
})

export const addItem = async ({productId, variantId, quantity = 1}) => {
    const response = await cartApiInstance.post(`/add/${productId}/${variantId}`, { quantity })
    return response.data
}

export const getCheckoutConfig = async () => {
    const response = await cartApiInstance.get("/payment/config")
    return response.data
}

export const createCartOrder = async (shippingAddress) => {
    const response = await cartApiInstance.post("/payment/create/order", { shippingAddress })
    return response.data
}

export const verifyCartOrder  = async ({razorpay_order_id, razorpay_payment_id, razorpay_signature}) => {
    const response = await cartApiInstance.post('/payment/verify/order',{
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    })
    return response.data   
}

export const getCart = async () => (await cartApiInstance.get('')).data
export const updateItem = async (itemId, quantity) => (await cartApiInstance.patch(`/item/${itemId}`, { quantity })).data
export const removeItem = async (itemId) => (await cartApiInstance.delete(`/item/${itemId}`)).data
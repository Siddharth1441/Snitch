import axios from "axios";

const cartApiInstance = axios.create({
    baseURL: "/api/cart",
    withCredentials: true,
})

export const addItem = async ({productId, variantId}) => {
    const response = await cartApiInstance.post(`/add/${productId}/${variantId}`, { quantity: 1 })
    return response.data
}

export const createCartOrder = async () => {
    const response = await cartApiInstance.post("/payment/create/order")
    return response.data
}

export const getCart = async () => (await cartApiInstance.get('/')).data
export const updateItem = async (itemId, quantity) => (await cartApiInstance.patch(`/item/${itemId}`, { quantity })).data
export const removeItem = async (itemId) => (await cartApiInstance.delete(`/item/${itemId}`)).data
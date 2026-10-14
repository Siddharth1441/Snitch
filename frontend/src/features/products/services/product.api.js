import axios from "axios";

const productApiInstance = axios.create({
    baseURL: "/api/products/",
    withCredentials: true,
})

export async function createProduct(formData) {
    const response = await productApiInstance.post("/", formData)

    return response.data
}


export async function getSellerProducts() {
    const response = await productApiInstance.get("/seller")

    return response.data
}

export async function getAllproducts() {
    
    const response = await productApiInstance.get('/')

    return response.data
}

export async function getproductById(productId) {
    
    const response = await productApiInstance.get(`detail/${productId}`)

    return response.data
}

export async function getRelatedProducts(productId) {
    const response = await productApiInstance.get(`detail/${productId}/related`)
    return response.data
}

export async function createProductVariant(productId, variantPayload) {
    const response = await productApiInstance.post(`detail/${productId}/variants`, variantPayload)
    return response.data
}

export async function updateVariantStock(productId, variantId, stock) {
    const response = await productApiInstance.patch(`detail/${productId}/variants/${variantId}/stock`, { stock })
    return response.data
}

export async function deleteProductVariant(productId, variantId) {
    const response = await productApiInstance.delete(`detail/${productId}/variants/${variantId}`)
    return response.data
}

export async function deleteProduct(productId) {
    const response = await productApiInstance.delete(`detail/${productId}`)
    return response.data
}

import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
    name: "product",
    initialState: {
        sellerProducts: [],
        products: [],
        loading: false,
        error: null,
        success: false
    },
    reducers: {
        setSellerProducts(state, action) {
            state.sellerProducts = action.payload;
        },
        setProducts(state, action) {
            state.products = action.payload;
        },
        setProductLoading(state, action) {
            state.loading = action.payload;
        },
        setProductError(state, action) {
            state.error = action.payload;
        },
        setProductSuccess(state, action) {
            state.success = action.payload;
        },
        clearProductStatus(state) {
            state.error = null;
            state.success = false;
            state.loading = false;
        }
    }
})

export const { 
    setSellerProducts,
    setProducts, 
    setProductLoading, 
    setProductError, 
    setProductSuccess, 
    clearProductStatus 
} = productSlice.actions;

export default productSlice.reducer;


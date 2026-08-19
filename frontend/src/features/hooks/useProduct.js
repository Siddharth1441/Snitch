import { createProduct, getSellerProducts } from "../products/services/product.api.js";
import { 
    setSellerProducts, 
    setProductLoading, 
    setProductError, 
    setProductSuccess,
    clearProductStatus 
} from "../products/state/product.state.js";
import { useDispatch, useSelector } from "react-redux";

export const useProduct = () => {
    const dispatch = useDispatch();
    const productState = useSelector((state) => state.product);

    async function handleCreateProduct(formData) {
        try {
            dispatch(setProductLoading(true));
            dispatch(setProductError(null));
            dispatch(setProductSuccess(false));

            const data = await createProduct(formData);
            dispatch(setProductSuccess(true));
            
            // Refetch seller products to keep list updated
            try {
                const sellerProductsData = await getSellerProducts();
                if (sellerProductsData?.products) {
                    dispatch(setSellerProducts(sellerProductsData.products));
                }
            } catch (refetchErr) {
                console.warn('Could not refresh seller products:', refetchErr);
            }

            return data;
        } catch (err) {
            let errorMessage = 'Failed to create product drop. Please try again.';
            if (err?.response?.data?.message) {
                errorMessage = err.response.data.message;
                if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                    errorMessage += ': ' + err.response.data.errors.map((e) => e.msg).join(' | ');
                }
            } else if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                errorMessage = err.response.data.errors.map((e) => e.msg).join(' | ');
            } else if (err?.message) {
                errorMessage = err.message;
            }
            dispatch(setProductError(errorMessage));
            throw err;
        } finally {
            dispatch(setProductLoading(false));
        }
    }

    async function handleGetSellerProducts() {
        try {
            dispatch(setProductLoading(true));
            dispatch(setProductError(null));
            const data = await getSellerProducts();
            dispatch(setSellerProducts(data.products || []));
            return data.products;
        } catch (err) {
            let errorMessage = 'Failed to fetch seller products.';
            if (err?.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            dispatch(setProductError(errorMessage));
            throw err;
        } finally {
            dispatch(setProductLoading(false));
        }
    }

    const resetStatus = () => {
        dispatch(clearProductStatus());
    };

    return {
        handleCreateProduct,
        handleGetSellerProducts,
        resetStatus,
        loading: productState?.loading || false,
        error: productState?.error || null,
        success: productState?.success || false,
        sellerProducts: productState?.sellerProducts || []
    };
};
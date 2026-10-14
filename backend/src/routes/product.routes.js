import express from "express";
import { authenticateSeller } from "../middlewares/auth.middleware.js";
import { createProduct, getAllProducts, getProductDetail, createProductVariant, updateVariantStock, deleteProductVariant, deleteProduct, getRelatedProducts } from "../controllers/product.controller.js";
import multer from "multer"
import { createProductValidator } from "../validator/product.validator.js";
import { getSellerProducts } from "../controllers/product.controller.js";
const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
    }
})



router.post('/', authenticateSeller, upload.array('images', 7), createProductValidator, createProduct);

router.get('/seller', authenticateSeller, getSellerProducts);

router.get('/',getAllProducts)

router.get('/detail/:id',getProductDetail)
router.get('/detail/:id/related', getRelatedProducts)

router.post('/detail/:id/variants', authenticateSeller, upload.array('images', 7), createProductVariant)

router.patch('/detail/:id/variants/:variantId/stock', authenticateSeller, updateVariantStock)

router.delete('/detail/:id/variants/:variantId', authenticateSeller, deleteProductVariant)

router.delete('/detail/:id', authenticateSeller, deleteProduct)


export default router;


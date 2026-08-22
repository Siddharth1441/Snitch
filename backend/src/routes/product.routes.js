import express from "express";
import { authenticateSeller } from "../middlewares/auth.middleware.js";
import { createProduct, getAllProducts, getProductDetail } from "../controllers/product.controller.js";
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


export default router;

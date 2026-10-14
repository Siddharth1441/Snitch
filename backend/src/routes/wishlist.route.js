import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getWishlist, toggleWishlist } from "../controllers/wishlist.controller.js";

const router = express.Router();
router.get("/", authenticate, getWishlist);
router.post("/:productId", authenticate, toggleWishlist);
export default router;

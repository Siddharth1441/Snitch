import cartModel from "../model/cart.model.js";
import productModel from "../model/product.model.js";

const getCartForUser = (userId) => cartModel.findOne({ user: userId });

export const addToCart = async (req, res) => {
    const { productId, variantId } = req.params;
    const quantity = Number(req.body?.quantity || 1);
    if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ message: "Quantity must be a positive whole number", success: false });

    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found", success: false });
    const variant = product.varients.id(variantId);
    if (!variant) return res.status(404).json({ message: "Variant not found", success: false });
    if (quantity > (variant.stock || 0)) return res.status(400).json({ message: "This variant is out of stock", success: false });

    const cart = (await getCartForUser(req.user._id)) || await cartModel.create({ user: req.user._id, items: [] });
    const existingItem = cart.items.find((item) => item.product.toString() === productId && item.variant.toString() === variantId);
    if (existingItem) {
        if (existingItem.quantity + quantity > variant.stock) return res.status(400).json({ message: "Requested quantity exceeds available stock", success: false });
        existingItem.quantity += quantity;
    } else {
        cart.items.push({ product: productId, variant: variantId, quantity, price: variant.price || product.price });
    }
    await cart.save();
    await cart.populate("items.product");
    return res.status(200).json({ message: "Product added to cart", success: true, cart });
};

export const getCart = async (req, res) => {
    const cart = (await getCartForUser(req.user._id)) || await cartModel.create({ user: req.user._id, items: [] });
    await cart.populate("items.product");
    return res.status(200).json({ message: "Cart fetched successfully", success: true, cart });
};

export const updateCartItem = async (req, res) => {
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ message: "Quantity must be a positive whole number", success: false });
    const cart = await getCartForUser(req.user._id);
    const item = cart?.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Cart item not found", success: false });
    const product = await productModel.findById(item.product);
    const variant = product?.varients.id(item.variant);
    if (!variant || quantity > (variant.stock || 0)) return res.status(400).json({ message: "Requested quantity exceeds available stock", success: false });
    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product");
    return res.status(200).json({ message: "Cart updated successfully", success: true, cart });
};

export const removeCartItem = async (req, res) => {
    const cart = await getCartForUser(req.user._id);
    if (!cart || !cart.items.id(req.params.itemId)) return res.status(404).json({ message: "Cart item not found", success: false });
    cart.items.pull(req.params.itemId);
    await cart.save();
    await cart.populate("items.product");
    return res.status(200).json({ message: "Item removed from cart", success: true, cart });
};

import mongoose from "mongoose";
import cartModel from "../model/cart.model.js";
import productModel from "../model/product.model.js";
import { createOrder } from "../services/payment.service.js";
import paymentModel from "../model/payment.model.js";
import razorpayUtils from "razorpay/dist/utils/razorpay-utils.js";
import { config } from "../config/config.js";

const { validatePaymentVerification } = razorpayUtils;

const getCartForUser = (userId) => cartModel.findOne({ user: userId });
const getCartWithTotal = (userId) =>
  cartModel.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
      },
    },
    { $unwind: { path: "$items" } },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "items.product",
      },
    },
    { $unwind: { path: "$items.product" } },
    {
      $set: {
        "items.product.varients": {
          $filter: {
            input: "$items.product.varients",
            as: "variant",
            cond: { $eq: ["$$variant._id", "$items.variant"] },
          },
        },
      },
    },
    {
      $match: {
        "items.product.varients.0": { $exists: true },
      },
    },
    {
      $addFields: {
        itemPrice: {
          price: {
            $multiply: ["$items.quantity", "$items.price.amount"],
          },
          currency: "$items.price.currency",
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        totalPrice: { $sum: "$itemPrice.price" },
        currency: { $first: "$itemPrice.currency" },
        items: { $push: "$items" },
      },
    },
  ]);

export const addToCart = async (req, res) => {
  const { productId, variantId } = req.params;
  const quantity = Number(req.body?.quantity || 1);
  if (!Number.isInteger(quantity) || quantity < 1)
    return res.status(400).json({
      message: "Quantity must be a positive whole number",
      success: false,
    });

  const product = await productModel.findById(productId);
  if (!product)
    return res
      .status(404)
      .json({ message: "Product not found", success: false });
  const variant = product.varients.id(variantId);
  if (!variant)
    return res
      .status(404)
      .json({ message: "Variant not found", success: false });
  if (quantity > (variant.stock || 0))
    return res
      .status(400)
      .json({ message: "This variant is out of stock", success: false });

  const cart =
    (await getCartForUser(req.user._id)) ||
    (await cartModel.create({ user: req.user._id, items: [] }));
  const existingItem = cart.items.find(
    (item) =>
      item.product.toString() === productId &&
      item.variant.toString() === variantId,
  );
  if (existingItem) {
    if (existingItem.quantity + quantity > variant.stock)
      return res.status(400).json({
        message: "Requested quantity exceeds available stock",
        success: false,
      });
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      variant: variantId,
      quantity,
      price: variant.price || product.price,
    });
  }
  await cart.save();
  await cart.populate("items.product");
  return res
    .status(200)
    .json({ message: "Product added to cart", success: true, cart });
};

export const getCart = async (req, res) => {
  const existingCart = await getCartForUser(req.user._id);
  const cartDocument =
    existingCart || (await cartModel.create({ user: req.user._id, items: [] }));
  const [aggregatedCart] = await getCartWithTotal(req.user._id);
  const cart = aggregatedCart || {
    ...cartDocument.toObject(),
    totalPrice: 0,
    currency: null,
  };
  return res
    .status(200)
    .json({ message: "Cart fetched successfully", success: true, cart });
};

export const updateCartItem = async (req, res) => {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1)
    return res.status(400).json({
      message: "Quantity must be a positive whole number",
      success: false,
    });
  const cart = await getCartForUser(req.user._id);
  const item = cart?.items.id(req.params.itemId);
  if (!item)
    return res
      .status(404)
      .json({ message: "Cart item not found", success: false });
  const product = await productModel.findById(item.product);
  const variant = product?.varients.id(item.variant);
  if (!variant || quantity > (variant.stock || 0))
    return res.status(400).json({
      message: "Requested quantity exceeds available stock",
      success: false,
    });
  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.product");
  return res
    .status(200)
    .json({ message: "Cart updated successfully", success: true, cart });
};

export const removeCartItem = async (req, res) => {
  const cart = await getCartForUser(req.user._id);
  if (!cart || !cart.items.id(req.params.itemId))
    return res
      .status(404)
      .json({ message: "Cart item not found", success: false });
  cart.items.pull(req.params.itemId);
  await cart.save();
  await cart.populate("items.product");
  return res
    .status(200)
    .json({ message: "Item removed from cart", success: true, cart });
};

const FREE_SHIPPING_THRESHOLD = 1999;
const SHIPPING_FEE = 99;

const normalizeAddress = (address = {}) => ({
  fullname: String(address.fullname || "").trim(),
  phone: String(address.phone || "").replace(/\D/g, ""),
  line1: String(address.line1 || "").trim(),
  line2: String(address.line2 || "").trim(),
  city: String(address.city || "").trim(),
  state: String(address.state || "").trim(),
  pincode: String(address.pincode || "").trim(),
  country: String(address.country || "India").trim() || "India",
});

const isValidAddress = (address) =>
  address.fullname.length >= 2 &&
  address.phone.length >= 10 &&
  address.line1.length >= 3 &&
  address.city.length >= 2 &&
  address.state.length >= 2 &&
  /^\d{6}$/.test(address.pincode);

export const getCheckoutConfig = async (_req, res) => {
  return res.status(200).json({
    success: true,
    keyId: config.RAZORPAY_KEY_ID,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    shippingFee: SHIPPING_FEE,
  });
};

export const createOrderController = async (req, res) => {
  const [cart] = await getCartWithTotal(req.user._id);

  if (!cart || !cart.items || cart.items.length === 0) {
    return res.status(400).json({
      message: "Cart is empty",
      success: false,
    });
  }

  const shippingAddress = normalizeAddress(req.body?.shippingAddress);
  if (!isValidAddress(shippingAddress)) {
    return res.status(400).json({
      message: "A complete shipping address is required",
      success: false,
    });
  }

  const subtotal = Number(cart.totalPrice || 0);
  if (!subtotal || subtotal <= 0) {
    return res.status(400).json({
      message: "Cart total is invalid",
      success: false,
    });
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const amount = subtotal + shipping;

  const order = await createOrder({
    amount,
    currency: cart.currency || "INR",
  });

  const orderItems = cart.items.map((item) => {
    const product = item.product || {};
    const variant =
      product.varients?.find(
        (v) => v?._id?.toString() === item.variant?.toString(),
      ) ||
      product.varients?.[0] ||
      null;
    const productPrice = product.price || {};
    const variantPrice = variant?.price || {};

    return {
      title: product.title,
      productId: product._id,
      variantId: item.variant,
      seller: product.seller,
      quantity: item.quantity,
      description: product.description,
      images: variant?.images?.length ? variant.images : product.images || [],
      price: {
        amount: Number(variantPrice.amount ?? productPrice.amount ?? 0),
        currency:
          variantPrice.currency ||
          productPrice.currency ||
          cart.currency ||
          "INR",
      },
    };
  });

  const paymentPayload = {
    user: req.user._id,
    status: "pending",
    razorpay: {
      orderId: order.id,
    },
    price: {
      amount,
      currency: cart.currency || "INR",
    },
    shippingAddress,
    fulfillmentStatus: "processing",
    orderItems,
  };

  const payment = await paymentModel.findOneAndUpdate(
    { user: req.user._id, status: "pending" },
    paymentPayload,
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  );

  return res.status(200).json({
    message: "Order created successfully",
    success: true,
    order: {
      ...order,
      paymentId: payment?._id,
    },
  });
};

export const verifyOrderController = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const payment = await paymentModel.findOne({
    "razorpay.orderId": razorpay_order_id,
    status: "pending",
  });

  if (!payment) {
    return res.status(404).json({
      message: "Payment not found ",
      success: false,
    });
  }

  const isPaymentVaild = validatePaymentVerification(
    {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
    },
    razorpay_signature,
    config.RAZORPAY_KEY_SECRET,
  );

  if (!isPaymentVaild) {
    ((payment.status = "failed"), await payment.save());

    return res.status(400).json({
      message: "Payment Failed",
      success: false,
    });
  }

  payment.status = "paid";
  payment.fulfillmentStatus = "processing";
  payment.razorpay.paymentId = razorpay_payment_id;
  payment.razorpay.signature = razorpay_signature;

  await payment.save();

  for (const item of payment.orderItems || []) {
    if (!item.productId || !item.variantId) continue;
    await productModel.updateOne(
      { _id: item.productId, "varients._id": item.variantId },
      { $inc: { "varients.$.stock": -Math.max(1, Number(item.quantity) || 1) } },
    );
  }

  await cartModel.findOneAndUpdate(
    { user: payment.user },
    { $set: { items: [] } },
  );

  return res.status(200).json({
    message: "Payment verify successfull",
    success: true,
  });
};

export const getSellerOrders = async (req, res) => {
  const orders = await paymentModel.find({
    status: "paid",
    "orderItems.seller": req.user._id,
  }).sort({ createdAt: -1 });

  const sellerOrders = orders.map((order) => ({
    ...order.toObject(),
    orderItems: (order.orderItems || []).filter(
      (item) => String(item.seller) === String(req.user._id),
    ),
  }));

  return res.status(200).json({
    message: "Seller orders fetched",
    success: true,
    orders: sellerOrders,
  });
};

import wishlistModel from "../model/wishlist.model.js";

export const getWishlist = async (req, res) => {
  const wishlist = await wishlistModel.findOne({ user: req.user._id }).populate("products");
  return res.status(200).json({
    success: true,
    products: wishlist?.products || [],
  });
};

export const toggleWishlist = async (req, res) => {
  const { productId } = req.params;
  let wishlist = await wishlistModel.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await wishlistModel.create({ user: req.user._id, products: [productId] });
  } else {
    const exists = wishlist.products.some((id) => String(id) === String(productId));
    if (exists) {
      wishlist.products = wishlist.products.filter((id) => String(id) !== String(productId));
    } else {
      wishlist.products.push(productId);
    }
    await wishlist.save();
  }
  await wishlist.populate("products");
  return res.status(200).json({
    success: true,
    products: wishlist.products || [],
  });
};

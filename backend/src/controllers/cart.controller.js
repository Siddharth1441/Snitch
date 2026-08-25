import cartModel from "../model/cart.model";
import productModel from "../model/product.model";

export const addToCart = async (req,res) => {
    const {productId,variantId}  = req.params

    const product = await productModel.findOne({
        _id : productId,
        "variants._id" : variantId

    })

    if (!product) {
        return res.status(404).json({
            message:"Product or variant not found",
            success:false
        })
    }

    const cart = (await cartModel.findOne({user:user._id}))|| (await cartModel.create({user:req.user._id}))

    const isProductInCart = cart.items.find(item => item.product.toString() === productId && item.variant.toString() === variantId)

}
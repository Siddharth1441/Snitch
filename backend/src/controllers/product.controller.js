import productModel from "../model/product.model.js";
import { uploadFile } from "../services/storage.service.js";

export async function createProduct(req,res) {

    const {title, description, priceAmount,priceCurrency} = req.body
    const seller = req.user

    const images = await Promise.all(req.files.map(async (file) => {
        return await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname,
        })
    }))

    const product = await productModel.create({
        title,
        description,
        price:{
            amount: priceAmount,
            currency: priceCurrency || 'INR'
        },
        seller: seller._id,
        images
    })

    return res.status(201).json({
        message: "Product created successfully",
        success: true,
        product
    })

}

export async function getSellerProducts(req,res){

    const seller = req.user

    const products = await productModel.find({seller: seller._id})

    return res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
}

export async function getAllProducts (req,res){
    const products = await productModel.find()

    return res.status(200).json({
        message:"Product Fetch",
        success:true,
        products
    })
}
export async function getProductDetail(req,res) {

    const {id} = req.params
    const product = await productModel.findById(id)

    if(!product){
        return res.status(404).json({
            message:"Product not found",
            success:false
        })
    }


    return res.status(200).json({
        message:"Product detail fetched successfully",
        success:true,
        product
    })
    
}

export async function createProductVariant(req, res) {
    try {
        const { id } = req.params
        const { attributes, stock } = req.body

        let parsedAttributes = attributes
        if (typeof attributes === 'string') {
            try {
                parsedAttributes = JSON.parse(attributes)
            } catch {
                parsedAttributes = null
            }
        }

        if (!parsedAttributes || typeof parsedAttributes !== 'object' || Array.isArray(parsedAttributes)) {
            return res.status(400).json({ message: "Variant attributes are required", success: false })
        }

        // Clean out empty attribute values
        const cleanAttributes = {}
        for (const [key, value] of Object.entries(parsedAttributes)) {
            if (value !== undefined && value !== null && String(value).trim() !== '') {
                cleanAttributes[key.trim()] = String(value).trim()
            }
        }

        if (Object.keys(cleanAttributes).length === 0) {
            return res.status(400).json({ message: "At least one valid attribute is required", success: false })
        }

        let images = []
        if (Array.isArray(req.files) && req.files.length > 0) {
            images = await Promise.all(req.files.map(async (file) => {
                const uploaded = await uploadFile({ buffer: file.buffer, fileName: file.originalname, folder: 'snitch/variants' })
                return { uri: uploaded.url || uploaded.uri || uploaded.fileId }
            }))
        }

        const newVariant = {
            attributes: cleanAttributes,
            stock: Math.max(0, Number(stock) || 0),
            images
        }

        // Use atomic $push so existing variants are preserved and new variant is appended
        const updatedProduct = await productModel.findOneAndUpdate(
            { _id: id, seller: req.user._id },
            { $push: { varients: newVariant } },
            { new: true, runValidators: true }
        )

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found", success: false })
        }

        const addedVariant = updatedProduct.varients[updatedProduct.varients.length - 1]

        return res.status(201).json({
            message: "Product variant created successfully",
            success: true,
            variant: addedVariant,
            product: updatedProduct
        })
    } catch (err) {
        console.error("Error creating variant:", err)
        return res.status(500).json({ message: err?.message || "Internal server error", success: false })
    }
}

export async function updateVariantStock(req, res) {
    try {
        const { id, variantId } = req.params
        const stock = Number(req.body.stock)

        if (!Number.isInteger(stock) || stock < 0) {
            return res.status(400).json({ message: "Stock must be a non-negative whole number", success: false })
        }

        // Use positional $set operator so only the targeted variant's stock is updated
        const updatedProduct = await productModel.findOneAndUpdate(
            { _id: id, seller: req.user._id, "varients._id": variantId },
            { $set: { "varients.$.stock": stock } },
            { new: true }
        )

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product or variant not found", success: false })
        }

        const updatedVariant = updatedProduct.varients.find((v) => v._id && v._id.toString() === variantId)

        return res.status(200).json({
            message: "Variant stock updated successfully",
            success: true,
            variant: updatedVariant,
            product: updatedProduct
        })
    } catch (err) {
        console.error("Error updating variant stock:", err)
        return res.status(500).json({ message: err?.message || "Internal server error", success: false })
    }
}

export async function deleteProductVariant(req, res) {
    try {
        const { id, variantId } = req.params

        // Use atomic $pull operator to remove only the targeted variant from varients array
        const updatedProduct = await productModel.findOneAndUpdate(
            { _id: id, seller: req.user._id },
            { $pull: { varients: { _id: variantId } } },
            { new: true }
        )

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found", success: false })
        }

        return res.status(200).json({
            message: "Variant deleted successfully",
            success: true,
            product: updatedProduct
        })
    } catch (err) {
        console.error("Error deleting variant:", err)
        return res.status(500).json({ message: err?.message || "Internal server error", success: false })
    }
}














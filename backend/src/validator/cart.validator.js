import { param, validationResult } from "express-validator";

const validateRequest = (req,res,next)=>{
    const error = validationResult(req)
    if(!error.isEmpty()){
        return res.status(400).json({
            error : error.array()
        })
    }
    next()
}

export const validateAddToCart = [
    param('productId').isMongoId().withMessage("Invaild product id "),
    param('variantId').isMongoId().withMessage("Invalid variant id"),
    validateRequest

]
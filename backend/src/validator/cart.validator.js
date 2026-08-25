import { body,param,validationResult } from "express-validator";

const validateRequest = (req,res,next)=>{
    const error = validateResult(req)
    if(!error.isEmpty()){
        return res.status(400).json({
            error : error.array()
        })
    }
    next()
}

export const validateAddToCart = [
    param('productId').isMongoId().withMessage("Invaild product id "),
    param('variantId').optional().isMongoId().withMessage("Invaild variant id "),
    param('qantity').optional().isInt({min:1}).withMessage("Quantity must be 1"),    
    validateRequest

]
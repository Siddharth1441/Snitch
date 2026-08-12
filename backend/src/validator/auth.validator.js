import { body, validationResult } from "express-validator";

function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: errors.array()[0]?.msg || 'Validation failed',
            errors: errors.array() 
        });
    }
    next();
}

export const validateRegisterUser = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address'),
    body('contact')
        .trim()
        .notEmpty().withMessage('Contact is required')
        .matches(/^\d{10}$/).withMessage('Contact must be a valid 10-digit number'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('fullname')
        .trim()
        .notEmpty().withMessage('Fullname is required')
        .isLength({ min: 3 }).withMessage('Fullname must be at least 3 characters long'),
    body('isSeller')
        .optional()
        .isBoolean().withMessage('isSeller must be a boolean value'),
    validateRequest
];

export const validateLoginUser = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address'),
    body('password')
        .notEmpty().withMessage('Password is required'),
    validateRequest
];



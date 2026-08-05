import{body,validationResult } from "express-validator";

function vaildateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

export const vaildateRegisterUser = [
    body('email')
    .isEmail().withMessage('Invalid email address'),
    body('contact')
    .notEmpty().withMessage('Contact is required'),
    body('contact')
    .matches(/^\d{10}$/).withMessage('Contact must be a valid 10-digit number'),
    body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('fullname')
    .notEmpty().withMessage('Fullname is required')
    .isLength({ min: 3 }).withMessage('Fullname must be at least 3 characters long'),

    vaildateRequest
]


import { Router } from "express";
import { vaildateRegisterUser } from "../validator/auth.validator.js";
import { register } from "../controllers/auth.controller.js";

const router = Router();

router.post('/register', vaildateRegisterUser, register )

export default router;
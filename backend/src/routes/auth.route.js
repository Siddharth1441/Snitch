import { Router } from "express";
import { vaildateRegisterUser } from "../validator/auth.validator.js";

const router = Router();

router.get('/register', vaildateRegisterUser,)

export default router;
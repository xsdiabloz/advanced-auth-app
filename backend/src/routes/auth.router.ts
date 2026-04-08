import { Router } from "express";
import {
  login,
  logout,
  signup,
  verifyEmail,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.delete("/logout", logout);

export default router;

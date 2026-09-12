import express from "express";
import { parseAndSaveEmail } from "../controllers/emailController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/parse", protect, parseAndSaveEmail);

export default router;

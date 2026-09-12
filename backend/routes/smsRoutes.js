import express from "express";
import { parseAndSave } from "../controllers/smsController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/parse", protect, parseAndSave);

export default router;

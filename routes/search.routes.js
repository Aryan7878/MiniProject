import { Router } from "express";
import { searchProducts } from "../controllers/search.controller.js";

const router = Router();

// GET /api/search?q=<keyword>
router.get("/", searchProducts);

export default router;

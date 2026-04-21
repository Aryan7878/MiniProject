import { Router } from "express";
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    analyzeProduct,
    getExternalProductReviews,
    getFlipkartCategories,
    getExternalProductDetails,
} from "../controllers/product.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { validate, createProductSchema, updateProductSchema } from "../middleware/validate.js";

const router = Router();

// ── Public routes ─────────────────────────────────────────────────────────────

/** GET /api/products  - list all products with latest price */
router.get("/", getAllProducts);

/** 
 * GET /api/products/reviews/external 
 * Needs to be above /:id to avoid collision
 */
router.get("/reviews/external", getExternalProductReviews);

/**
 * GET /api/products/categories/flipkart
 */
router.get("/categories/flipkart", getFlipkartCategories);

/**
 * GET /api/products/details/external
 */
router.get("/details/external", getExternalProductDetails);



/**
 * GET /api/products/:id/analyze
 * IMPORTANT: must come BEFORE /:id to avoid Express treating "analyze" as an id
 */
router.get("/:id/analyze", analyzeProduct);

/** GET /api/products/:id  - single product */
router.get("/:id", getProductById);

// ── Protected routes (require valid JWT & Admin role) ────────────────────────

/** POST /api/products  - create new product (admin) */
router.post("/", protect, authorize("admin"), validate(createProductSchema), createProduct);

/** PUT /api/products/:id  - update product (admin) */
router.put("/:id", protect, authorize("admin"), validate(updateProductSchema), updateProduct);

/** DELETE /api/products/:id  - hard delete (admin) */
router.delete("/:id", protect, authorize("admin"), deleteProduct);

export default router;
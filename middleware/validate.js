import { z } from "zod";
import AppError from "../utils/AppError.js";

/**
 * validate
 * ─────────────────────────────────────────────────────────────────────────────
 * Factory middleware that validates request body against a Zod schema.
 * Passes to next() on success. Throws AppError 422 on failure.
 *
 * @param {z.ZodSchema} schema
 * @returns Express middleware
 *
 * @example
 *   router.post("/", validate(createProductSchema), createProduct);
 */
export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const details = result.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
        }));
        return next(new AppError("Validation failed", 422, details));
    }
    // Replace req.body with the parsed (safe, coerced) data
    req.body = result.data;
    next();
};

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const createProductSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(200),
    description: z.string().max(1000).optional().default(""),
    price: z.number({ required_error: "price is required" }).nonnegative("Price must be ≥ 0"),
    category: z.string().min(1, "Category is required").max(100),
    stock: z.number().int().nonnegative().optional().default(0),
    image: z.string().url("image must be a valid URL").or(z.literal("")).optional().default(""),
    brand: z.string().max(100).optional().default(""),
    marketplaces: z.array(
        z.object({
            name: z.string().min(1, "Marketplace name is required"),
            price: z.number().nonnegative("Price must be ≥ 0"),
            url: z.string().url("Valid URL is required")
        })
    ).optional().default([]),
});

export const updateProductSchema = createProductSchema.partial();

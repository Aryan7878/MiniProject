import AppError from "../utils/AppError.js";

/**
 * errorHandler
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Express error-handling middleware. Mount this LAST in server.js.
 *
 * Handles:
 *   - AppError (operational, intentionally thrown)
 *   - Mongoose CastError      → 400 Bad Request (invalid ObjectId)
 *   - Mongoose ValidationError → 422 Unprocessable Entity
 *   - Mongoose Duplicate Key  → 409 Conflict
 *   - JWT errors              → 401 Unauthorized
 *   - Unhandled programmer errors → 500
 */
export const errorHandler = (err, req, res, next) => {
    let error = err;

    // ── Mongoose: invalid ObjectId ────────────────────────────────────────────
    if (err.name === "CastError") {
        error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
    }

    // ── Mongoose: schema validation failed ────────────────────────────────────
    if (err.name === "ValidationError") {
        const details = Object.values(err.errors).map((e) => e.message);
        error = new AppError("Validation failed", 422, details);
    }

    // ── Mongoose: unique-index violation ─────────────────────────────────────
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] ?? "field";
        error = new AppError(`Duplicate value for '${field}'`, 409);
    }

    // ── JWT: token errors ─────────────────────────────────────────────────────
    if (err.name === "JsonWebTokenError") {
        error = new AppError("Invalid token – please log in again", 401);
    }
    if (err.name === "TokenExpiredError") {
        error = new AppError("Token expired – please log in again", 401);
    }

    // ── Determine final status & message ─────────────────────────────────────
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    // Log all 500-level errors (programmer bugs) for ops visibility
    if (statusCode >= 500) {
        console.error("💥 Unhandled error:", err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        // Include structured details for validation errors
        ...(error.details && { errors: error.details }),
        // Include stack trace only during development
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

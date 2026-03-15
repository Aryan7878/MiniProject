/**
 * AppError
 * ─────────────────────────────────────────────────────────────────────────────
 * Production-grade custom error class used across controllers and services.
 *
 * Usage:
 *   throw new AppError("Product not found", 404);
 *   throw new AppError("Validation failed", 422, details);
 *
 * Benefits over bare `new Error()`:
 *   - Carries an HTTP statusCode (default 500)
 *   - Optional `details` payload for validation errors
 *   - Marked isOperational = true to differentiate from programmer bugs
 */
class AppError extends Error {
    /**
     * @param {string}    message     - Human readable message.
     * @param {number}    statusCode  - HTTP status code (default 500).
     * @param {any}       [details]   - Optional extra context (e.g. validation errors).
     */
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true; // Distinguishes expected errors from programmer bugs
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;

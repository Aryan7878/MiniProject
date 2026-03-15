/**
 * asyncHandler
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps an async Express route handler so that any thrown error is forwarded
 * to the global error-handling middleware automatically.
 *
 * Eliminates the need to write try/catch in every controller.
 *
 * @param {Function} fn - Async controller function (req, res, next) => Promise
 * @returns {Function}  - Express-compatible middleware
 *
 * @example
 *   router.get("/", asyncHandler(async (req, res) => {
 *     const products = await productService.getAll();
 *     res.json({ success: true, data: products });
 *   }));
 */
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;

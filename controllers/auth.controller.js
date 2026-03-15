import * as authService from "../services/auth.service.js";

/**
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const { user, token } = await authService.registerUser({ name, email, password });
        res.status(201).json({ success: true, token, user });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.loginUser({ email, password });
        res.status(200).json({ success: true, token, user });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/auth/me  (protected)
 */
export const getMe = async (req, res, next) => {
    try {
        const user = await authService.getProfile(req.user.id);
        res.status(200).json({ success: true, user });
    } catch (err) {
        next(err);
    }
};

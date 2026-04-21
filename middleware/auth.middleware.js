import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/**
 * Protects routes by verifying the JWT Bearer token.
 *
 * Attaches the database user object to req.user on success.
 */
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorised – no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch user from DB to ensure they still exist and have correct roles
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Not authorised – invalid token" });
    }
};

/**
 * Authorizes specific roles to access a route.
 * 
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'customer')
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user?.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

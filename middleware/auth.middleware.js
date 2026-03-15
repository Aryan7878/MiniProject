import jwt from "jsonwebtoken";

/**
 * Protects routes by verifying the JWT Bearer token.
 *
 * Attaches the decoded user payload to req.user on success.
 */
export const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Not authorised – no token" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Not authorised – invalid token" });
    }
};

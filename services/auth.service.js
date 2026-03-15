import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

export const registerUser = async ({ name, email, password }) => {
    const exists = await User.findOne({ email });
    if (exists) {
        const err = new Error("Email already in use");
        err.statusCode = 409;
        throw err;
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    return {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
    };
};

export const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
        const err = new Error("Invalid email or password");
        err.statusCode = 401;
        throw err;
    }

    const token = signToken(user._id);
    return {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
    };
};

export const getProfile = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }
    return user;
};

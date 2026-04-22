import Order from "../models/order.model.js";

export const createOrder = async (userId, { items, shippingAddress }) => {
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return Order.create({ user: userId, items, totalAmount, shippingAddress });
};

export const getUserOrders = async (userId) =>
    Order.find({ user: userId }).populate("items.product", "name price image").sort({ createdAt: -1 });

export const getOrderById = async (orderId, userId) => {
    const order = await Order.findOne({ _id: orderId, user: userId }).populate(
        "items.product",
        "name price image"
    );
    if (!order) {
        const err = new Error("Order not found");
        err.statusCode = 404;
        throw err;
    }
    return order;
};

export const updateStatus = async (orderId, status) => {
    const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true, runValidators: true }
    );
    if (!order) {
        const err = new Error("Order not found");
        err.statusCode = 404;
        throw err;
    }
    return order;
};

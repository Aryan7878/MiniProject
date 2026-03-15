import * as orderService from "../services/order.service.js";

/** POST /api/orders */
export const placeOrder = async (req, res, next) => {
    try {
        const order = await orderService.createOrder(req.user.id, req.body);
        res.status(201).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

/** GET /api/orders/my */
export const getMyOrders = async (req, res, next) => {
    try {
        const orders = await orderService.getUserOrders(req.user.id);
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        next(err);
    }
};

/** GET /api/orders/:id */
export const getOrderById = async (req, res, next) => {
    try {
        const order = await orderService.getOrderById(req.params.id, req.user.id);
        res.status(200).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

/** PATCH /api/orders/:id/status  (admin) */
export const updateOrderStatus = async (req, res, next) => {
    try {
        const order = await orderService.updateStatus(req.params.id, req.body.status);
        res.status(200).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

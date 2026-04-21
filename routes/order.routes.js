import { Router } from "express";
import {
    placeOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
} from "../controllers/order.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// All order routes require authentication
router.use(protect);

router.post("/", placeOrder);
router.get("/my", getMyOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", authorize("admin"), updateOrderStatus);

export default router;

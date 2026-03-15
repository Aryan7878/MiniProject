import express from "express";
import { 
    addToWatchlist, 
    getMyWatchlist, 
    removeFromWatchlist 
} from "../controllers/watchlist.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect); // All watchlist routes need authentication

router.route("/")
    .get(getMyWatchlist)
    .post(addToWatchlist);

router.route("/:id")
    .delete(removeFromWatchlist);

export default router;

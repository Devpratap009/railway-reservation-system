import express from "express";
import {
  bookTicket,
  getAllBookings,
  cancelTicket,
} from "../controllers/ticketController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/book", authorize("user"), bookTicket);
router.get("/", getAllBookings);
router.patch("/:ticketId/cancel", cancelTicket);

export default router;

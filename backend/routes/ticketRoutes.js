import express from "express";
import {
  bookTicket,
  getAllBookings,
  cancelTicket,
} from "../controllers/ticketController.js";

const router = express.Router();

router.post("/book", bookTicket);
router.get("/", getAllBookings);
router.patch("/:ticketId/cancel", cancelTicket);

export default router;
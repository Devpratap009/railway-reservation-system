import express from "express";
import {
  addTrain,
  getAllTrains,
  checkAvailability,
} from "../controllers/trainController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("admin"), addTrain);
router.get("/", getAllTrains);
router.get("/:trainId/availability", checkAvailability);

export default router;

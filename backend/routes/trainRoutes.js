import express from "express";
import {
  addTrain,
  getAllTrains,
  checkAvailability,
} from "../controllers/trainController.js";

const router = express.Router();

router.post("/", addTrain);
router.get("/", getAllTrains);
router.get("/:trainId/availability", checkAvailability);

export default router;
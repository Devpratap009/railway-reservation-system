import Train from "../models/Train.js";
import { emitTrainCreated } from "../config/socket.js";

// @desc    Add a new train
// @route   POST /api/trains
export const addTrain = async (req, res) => {
  try {
    const { name, source, destination, totalSeats } = req.body;

    if (!name || !source || !destination || !totalSeats) {
      return res.status(400).json({
        message: "Please provide name, source, destination, and totalSeats",
      });
    }

    const seats = Number(totalSeats);
    if (Number.isNaN(seats) || seats < 1) {
      return res.status(400).json({
        message: "totalSeats must be a number greater than 0",
      });
    }

    const train = new Train({
      name,
      source,
      destination,
      totalSeats: seats,
      availableSeats: seats,
    });

    const savedTrain = await train.save();
    emitTrainCreated(savedTrain);
    res.status(201).json(savedTrain);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all trains (with optional source/destination filter)
// @route   GET /api/trains
export const getAllTrains = async (req, res) => {
  try {
    const { source, destination } = req.query;
    const filter = {};

    if (source) {
      filter.source = new RegExp(source.trim(), "i");
    }
    if (destination) {
      filter.destination = new RegExp(destination.trim(), "i");
    }

    const trains = await Train.find(filter).sort({ trainId: 1 });
    res.status(200).json(trains);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check seat availability for a single train by trainId
// @route   GET /api/trains/:trainId/availability
export const checkAvailability = async (req, res) => {
  try {
    const trainIdNum = Number(req.params.trainId);
    const train = await Train.findOne({ trainId: trainIdNum });

    if (!train) {
      return res.status(404).json({ message: "No train found with that ID" });
    }

    res.status(200).json({
      trainId: train.trainId,
      name: train.name,
      source: train.source,
      destination: train.destination,
      totalSeats: train.totalSeats,
      availableSeats: train.availableSeats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
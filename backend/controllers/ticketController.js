import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";
import Train from "../models/Train.js";

// @desc    Get all bookings / tickets
// @route   GET /api/tickets
export const getAllBookings = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("train", "trainId name source destination")
      .sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTickets = getAllBookings;

// @desc    Book a ticket (supports multiple passengers / seats)
// @route   POST /api/tickets/book
export const bookTicket = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { trainId, passengerNames, passengerName, seatsToBook } = req.body;
    const seatsCount = Number(seatsToBook);

    let rawNames = [];
    if (Array.isArray(passengerNames)) {
      rawNames = passengerNames.map((name) => String(name || "").trim());
    } else if (typeof passengerName === "string" && passengerName.trim()) {
      rawNames = passengerName
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
    }

    if (!trainId || !seatsCount || seatsCount < 1) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Please provide valid trainId and seatsToBook",
      });
    }

    if (rawNames.length !== seatsCount || rawNames.some((name) => !name)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: `Please enter ${seatsCount} passenger name(s) - one for each seat.`,
      });
    }

    const train = await Train.findOne({ trainId: Number(trainId) }).session(
      session
    );

    if (!train) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "No train found" });
    }

    if (train.availableSeats < seatsCount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: `Not enough available seats. Only ${train.availableSeats} seat(s) left.`,
      });
    }

    train.availableSeats -= seatsCount;
    await train.save({ session });

    const ticket = new Ticket({
      train: train._id,
      trainId: train.trainId,
      passengerNames: rawNames,
      passengerName: rawNames.join(", "),
      seatsBooked: seatsCount,
      status: "BOOKED",
    });

    const savedTicket = await ticket.save({ session });
    await session.commitTransaction();
    session.endSession();

    const populatedTicket = await Ticket.findById(savedTicket._id).populate(
      "train",
      "trainId name source destination"
    );

    res.status(201).json({
      message: "Seats booked successfully",
      ticket: populatedTicket,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a ticket and restore seats
// @route   PATCH /api/tickets/:ticketId/cancel
export const cancelTicket = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ticketIdNum = Number(req.params.ticketId);
    const ticket = await Ticket.findOne({ ticketId: ticketIdNum }).session(
      session
    );

    if (!ticket) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.status === "CANCELLED") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Ticket is already cancelled" });
    }

    const train = await Train.findById(ticket.train).session(session);
    if (train) {
      train.availableSeats = Math.min(
        train.totalSeats,
        train.availableSeats + ticket.seatsBooked
      );
      await train.save({ session });
    }

    ticket.status = "CANCELLED";
    await ticket.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Ticket cancelled and seats restored",
      ticket,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};
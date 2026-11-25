import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";
import Train from "../models/Train.js";
import { emitTrainAvailability } from "../config/socket.js";

const isTransactionConflict = (error) =>
  error?.code === 112 || error?.hasErrorLabel?.("TransientTransactionError");

// Admins can view every booking; regular users only see their own tickets.
export const getAllBookings = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };
    const tickets = await Ticket.find(filter)
      .populate("train", "trainId name source destination")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTickets = getAllBookings;

// @desc Book a ticket for the currently authenticated user
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

    if (!trainId || !Number.isInteger(seatsCount) || seatsCount < 1) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Please provide a valid trainId and seatsToBook.",
      });
    }

    if (rawNames.length !== seatsCount || rawNames.some((name) => !name)) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Please enter ${seatsCount} passenger name(s) - one for each seat.`,
      });
    }

    // Reserve seats atomically so two simultaneous requests cannot sell the same seat.
    const updatedTrain = await Train.findOneAndUpdate(
      {
        trainId: Number(trainId),
        availableSeats: { $gte: seatsCount },
      },
      { $inc: { availableSeats: -seatsCount } },
      { new: true, session, runValidators: true }
    );

    if (!updatedTrain) {
      const existingTrain = await Train.findOne({ trainId: Number(trainId) }).session(session);
      await session.abortTransaction();

      if (!existingTrain) {
        return res.status(404).json({ message: "No train found." });
      }

      return res.status(400).json({
        message: `Not enough available seats. Only ${existingTrain.availableSeats} seat(s) left.`,
      });
    }

    const ticket = new Ticket({
      user: req.user._id,
      train: updatedTrain._id,
      trainId: updatedTrain.trainId,
      passengerNames: rawNames,
      passengerName: rawNames.join(", "),
      seatsBooked: seatsCount,
      status: "BOOKED",
    });

    const savedTicket = await ticket.save({ session });
    await session.commitTransaction();

    // Notify connected clients only after MongoDB has committed the booking.
    emitTrainAvailability(updatedTrain);

    const populatedTicket = await Ticket.findById(savedTicket._id)
      .populate("train", "trainId name source destination")
      .populate("user", "name email");

    return res.status(201).json({
      message: "Seats booked successfully",
      ticket: populatedTicket,
    });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    if (isTransactionConflict(error)) {
      return res.status(409).json({
        message: "Seat availability changed while you were booking. Please check the latest count and try again.",
      });
    }
    return res.status(500).json({ message: error.message });
  } finally {
    await session.endSession();
  }
};

// @desc Cancel a ticket and restore seats. Admins may cancel any ticket;
// regular users may only cancel tickets linked to their own account.
export const cancelTicket = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ticketIdNum = Number(req.params.ticketId);
    const ticket = await Ticket.findOne({ ticketId: ticketIdNum }).session(session);

    if (!ticket) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Ticket not found." });
    }

    if (
      req.user.role !== "admin" &&
      String(ticket.user || "") !== String(req.user._id)
    ) {
      await session.abortTransaction();
      return res.status(403).json({ message: "You can only cancel your own bookings." });
    }

    if (ticket.status === "CANCELLED") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Ticket is already cancelled." });
    }

    const train = await Train.findById(ticket.train).session(session);
    let updatedTrain = null;
    if (train) {
      train.availableSeats = Math.min(
        train.totalSeats,
        train.availableSeats + ticket.seatsBooked
      );
      updatedTrain = await train.save({ session });
    }

    ticket.status = "CANCELLED";
    await ticket.save({ session });
    await session.commitTransaction();

    // Notify connected clients after the cancellation and seat restoration commit.
    if (updatedTrain) emitTrainAvailability(updatedTrain);

    return res.status(200).json({
      message: "Ticket cancelled and seats restored.",
      ticket,
    });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    if (isTransactionConflict(error)) {
      return res.status(409).json({
        message: "This booking was updated at the same time. Refresh your bookings and try again.",
      });
    }
    return res.status(500).json({ message: error.message });
  } finally {
    await session.endSession();
  }
};

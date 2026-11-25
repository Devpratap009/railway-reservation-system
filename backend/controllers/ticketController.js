import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";
import Train from "../models/Train.js";

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

    const train = await Train.findOne({ trainId: Number(trainId) }).session(session);

    if (!train) {
      await session.abortTransaction();
      return res.status(404).json({ message: "No train found." });
    }

    if (train.availableSeats < seatsCount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Not enough available seats. Only ${train.availableSeats} seat(s) left.`,
      });
    }

    train.availableSeats -= seatsCount;
    await train.save({ session });

    const ticket = new Ticket({
      user: req.user._id,
      train: train._id,
      trainId: train.trainId,
      passengerNames: rawNames,
      passengerName: rawNames.join(", "),
      seatsBooked: seatsCount,
      status: "BOOKED",
    });

    const savedTicket = await ticket.save({ session });
    await session.commitTransaction();

    const populatedTicket = await Ticket.findById(savedTicket._id)
      .populate("train", "trainId name source destination")
      .populate("user", "name email");

    return res.status(201).json({
      message: "Seats booked successfully",
      ticket: populatedTicket,
    });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
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

    return res.status(200).json({
      message: "Ticket cancelled and seats restored.",
      ticket,
    });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    return res.status(500).json({ message: error.message });
  } finally {
    await session.endSession();
  }
};

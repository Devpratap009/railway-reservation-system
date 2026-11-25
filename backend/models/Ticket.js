import mongoose from "mongoose";
import { getNextSequence } from "./Counter.js";

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: Number,
      unique: true,
    },
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train",
      required: [true, "Train reference is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    trainId: {
      type: Number,
      required: true,
    },
    passengerNames: {
      type: [String],
      required: [true, "At least one passenger name is required"],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length > 0 && arr.every((n) => n.trim().length > 0);
        },
        message: "Every seat must have a non-empty passenger name",
      },
    },
    passengerName: {
      type: String,
      trim: true,
    },
    seatsBooked: {
      type: Number,
      required: [true, "Number of seats to book is required"],
      min: [1, "At least 1 seat must be booked"],
    },
    status: {
      type: String,
      enum: ["BOOKED", "CANCELLED"],
      default: "BOOKED",
    },
  },
  { timestamps: true }
);

ticketSchema.pre("save", async function () {
  if (this.isNew && !this.ticketId) {
    this.ticketId = await getNextSequence("ticketId", 1001);
  }
  if (Array.isArray(this.passengerNames) && this.passengerNames.length > 0) {
    this.passengerName = this.passengerNames.join(", ");
  }
});

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
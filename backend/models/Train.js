import mongoose from "mongoose";
import { getNextSequence } from "./Counter.js";

const trainSchema = new mongoose.Schema(
  {
    trainId: {
      type: Number,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Train name is required"],
      trim: true,
    },
    source: {
      type: String,
      required: [true, "Source station is required"],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, "Destination station is required"],
      trim: true,
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats is required"],
      min: [1, "Total seats must be at least 1"],
    },
    availableSeats: {
      type: Number,
      required: true,
      min: [0, "Available seats cannot be negative"],
    },
  },
  { timestamps: true }
);

// Automatically assign sequential trainId starting at 1 and initialize availableSeats
trainSchema.pre("save", async function () {
  if (this.isNew) {
    if (!this.trainId) {
      this.trainId = await getNextSequence("trainId", 1);
    }
    if (this.availableSeats === undefined || this.availableSeats === null) {
      this.availableSeats = this.totalSeats;
    }
  }
});

const Train = mongoose.model("Train", trainSchema);
export default Train;
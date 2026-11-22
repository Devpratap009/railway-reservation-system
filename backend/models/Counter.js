import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

export const getNextSequence = async (name, startAt = 1) => {
  const existing = await Counter.findById(name);
  if (!existing) {
    const created = await Counter.create({ _id: name, seq: startAt });
    return created.seq;
  }
  const updated = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true }
  );
  return updated.seq;
};

export default Counter;
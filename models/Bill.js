import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  howOwes: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  user: { type: mongoose.Schema.Types.ObjectId },
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  createdAt: { type: Date, default: Date.now },
});

const Bill = mongoose.model("Bill", billSchema);

export default Bill;

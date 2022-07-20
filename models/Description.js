import mongoose from "mongoose";

const descriptionSchema =  new mongoose.Schema({
  description: { type: String, required: true },
  bill: { type: mongoose.Schema.Types.ObjectId, ref: "Bill" },
  belongs_users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

const Description = mongoose.model("Description", descriptionSchema);
export default Description;

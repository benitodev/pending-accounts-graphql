import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bill" }],
  belong_users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});



const Account = mongoose.model("Account", accountSchema);
export default Account;

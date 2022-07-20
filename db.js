import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URL);
    console.log("mongodb connected");
  } catch (err) {
    console.log(err);
  }
};

export default connectDB;

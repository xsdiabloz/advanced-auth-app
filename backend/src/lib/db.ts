import mongoose from "mongoose";
import "dotenv/config";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) return;
    const connect = await mongoose.connect(mongoUri);
    console.log("mongoDb connected");
  } catch (error) {
    console.log("cannot connect to db", error);
    process.exit(1);
  }
};

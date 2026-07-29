import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined");
    }
    const dbName = process.env.DB_NAME || "test";
    await mongoose.connect(mongoURI, { dbName });
    console.log(`✅ MongoDB Connected to database: ${dbName}`);
  } catch (err) {
    console.log(err.message);
  }
};

export default connectDB;
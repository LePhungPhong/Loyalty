import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUrl =
      process.env.MONGO_URL || "mongodb://localhost:27017/loyalty";
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB:", mongoUrl);
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

export default connectDB;

import serverlessExpress from "@vendia/serverless-express";
import mongoose from "mongoose";
import app from "./app.js"; // Import your existing Express app

// Mongoose connection setup
let isConnected = false;

async function connectToDatabase() {
  if (!isConnected) {
    try {
      await mongoose.connect(process.env.MONGO_URL);
      isConnected = true;
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }
}

// Initialize the serverless express app
const server = serverlessExpress({ app });

// Lambda handler function
export const handler = async (event, context) => {
  await connectToDatabase(); // Ensure the database is connected for each invocation
  return server(event, context);
};

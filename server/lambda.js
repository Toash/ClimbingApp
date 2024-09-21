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

const server = serverlessExpress({ app });

// Lambda handler function
export const handler = async (event, context) => {
  await connectToDatabase();

  const response = await server(event, context);

  response.headers = {
    ...response.headers,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  };

  return response;
};

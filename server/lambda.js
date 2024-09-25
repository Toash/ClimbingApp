import serverlessExpress from "@codegenie/serverless-express";
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

// Lambda handler function called when lambda is triggered.
// export const handler = async (event, context) => {
//   await connectToDatabase();

//   const response = await server(event, context);

//   response.headers = {
//     ...response.headers,
//     "Access-Control-Allow-Headers": "Content-Type",
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
//   };

//   if (!response.statusCode) {
//     response.statusCode = 200;
//   }
//   return response;
// };

export const handler = async (event, context) => {
  await connectToDatabase();
  return server(event, context);
};

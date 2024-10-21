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



export const handler = async (event, context) => {
  await connectToDatabase();

  // Check for preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": process.env.ORIGIN,
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "GET,POST,DELETE,UPDATE,OPTIONS,PATCH",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token"
      },
      body: null
    };
  } else {
    const response = await server(event, context);

    // add the cors headers to the already existing headers.
    response.headers = {
      ...response.headers,
      "Access-Control-Allow-Origin": process.env.ORIGIN,
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Methods": "GET,POST,DELETE,UPDATE,OPTIONS,PATCH",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token"
    }

    return response;
  }
};

// export const handler = async (event, context) => {
//   await connectToDatabase();
//   const response = await server(event, context);
//   return response;
// }
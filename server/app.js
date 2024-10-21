// app.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import authRoutes from "./routes/auth.js";
import mediaRoutes from "./routes/media.js";

/* CONFIGURATIONS */
dotenv.config();
const app = express();

// enable cors
const corsOptions = {
  origin: process.env.ORIGIN, // your allowed origin
  credentials: true, // for cookies or other credentials
  methods: "GET,POST,DELETE,UPDATE,OPTIONS,PATCH", // allowed methods
  allowedHeaders:
    "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token", // allowed headers
};

/* MIDDLEWARE */
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)) // include before other route

app.use(express.json());
//app.use(helmet()); // put a helmet on 
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/media", mediaRoutes);

// Export the app for use in lambda.js
export default app;

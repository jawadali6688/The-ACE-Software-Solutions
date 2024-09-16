import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


import { ApiError } from "./utils/ApiError.js";

import authRouter from "./routes/auth.routes.js"

const app = express();


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "416kb" }));
app.use(express.urlencoded({ extended: true, limit: "416kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Attach routes
app.use("/auth", authRouter);


// Error handling
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
      success: err.success,
      data: err.data,
    });
  } else {
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      errors: [],
      success: false,
      data: null,
    });
  }
});

export { app };

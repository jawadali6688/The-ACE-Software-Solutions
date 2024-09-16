
import connectDB from "../src/db/dbConnection.js"
import { app } from "./app.js";

import dotenv from 'dotenv';
dotenv.config();
console.log(process.env.DATABASE_URI, process.env.PORT);

// Connect to the database
connectDB()
  .then(() => {
    // Start the server after successful database connection
    app.listen(process.env.PORT || 4500, () => {
      console.log(" SERVER IS RUNNING ON:", process.env.PORT );
    });
  })

  .catch((error) => {
    // If any error to the database connection
    console.error("ERROR WHILE CONNECTING TO THE DATABASE:", error);
  });

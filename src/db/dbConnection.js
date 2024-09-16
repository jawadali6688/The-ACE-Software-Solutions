
import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";


const connectDB = async () => {
  try {
    // Connection to the database
    const connectionInstance = await mongoose.connect(
      `${process.env.DATABASE_URI}/${DB_NAME}`
    );
    console.log(
      `\n MONGODB connected successfully\n CONNECTION HOST: ${connectionInstance.connection.host} `
    );
  } catch (error) {
    // If any error while connecting to the database
    console.log(`MONGODB CONNECTION ERROR: ${error}`);
    console.log(process.env.DATABASE_URI)
    process.exit(1);
  }
};

export default connectDB;


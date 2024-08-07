import mongoose from "mongoose";

type ConnectionType = {
  isConnected?: number;
};

const connection: ConnectionType = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("already connected to database");
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGO_URL || "");
    connection.isConnected = db.connections[0].readyState;
    console.log("db connected successfully");
  } catch (error) {
    console.log("error in connecting database");

    process.exit(1);
  }
}

export default dbConnect;

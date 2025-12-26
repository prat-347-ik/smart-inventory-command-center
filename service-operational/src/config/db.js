import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // UPDATED: Pass the dbName option to ensure we connect to 'inventory_analytics'
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || 'inventory_analytics'
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Target Database: ${conn.connection.name}`); // Optional: logs the DB name to confirm
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
import mongoose from "mongoose";

async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("MongoDB conectado exitosamente");
    console.log(`Base de datos: ${mongoose.connection.name}`);

    
  } catch (err) {
    const error = err as Error;
    console.error("Error conectando a MongoDB:", error.message);
    process.exit(1);
  }
}

export default connectDB;

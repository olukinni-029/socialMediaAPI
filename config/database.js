import mongoose from 'mongoose';

mongoose.set('strictQuery', false);
const { MONGO_URI } = process.env;

const connectDB = () => {
  // Connecting to the database
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });
};
export default connectDB;



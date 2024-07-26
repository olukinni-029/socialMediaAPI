import mongoose, { Schema } from "mongoose";

const mediaSchema = new Schema({
  hash: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true }
}, {
  timestamps: true,
  versionKey: false
});

export default mongoose.model("Media", mediaSchema);

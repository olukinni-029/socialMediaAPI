// models/User.js
import mongoose, { Schema } from "mongoose";
import { hashPassword, comparePassword } from "../utils/bcrypt.js"
const userSchema = new mongoose.Schema(
  {
      username: {
          type: String,
          trim: true,
        },
        bios: {
          type: String,
          trim: true

        },
    profilePic:{
        type: String

      },
    password: {
      type: String,
      required: true,
      alphanumeric: true,
      trim: true,
      minLength: 6,
    },
    email: {
      type: String,
      unique: true,
      required: true, 
      trim: true,
      lowercase: true,
    },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    resetLinkToken: {
      type: String,
      default: "",
      expiresIn: "5m",
    },
    otpCode: {
      type: String,
      expire: "5m",
    },
    otpExpirationTime: {
      type: Date,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
      this.password = await hashPassword(this.password);
    }
    next();
  });
  
  userSchema.methods.comparePassword = function(hashedPassword) {
    return comparePassword(hashedPassword, this.password);
  };



export default mongoose.model("User", userSchema);

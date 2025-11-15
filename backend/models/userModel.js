import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    default: null
  },
  profilePhoto: {
    type: String,
    default: null
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationPin: {
    type: String,
    default: null
  },
  verificationPinExpires: {
    type: Date,
    default: null
  },
  resetPin: {
    type: String,
    default: null
  },
  resetPinExpires: {
    type: Date,
    default: null
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;

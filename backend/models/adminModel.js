import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'superadmin']
  },
  isApprovedByOwner: {
    type: Boolean,
    default: false
  },
  approvalToken: {
    type: String,
    default: null
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  }
});

const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema);

export default adminModel;


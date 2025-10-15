import mongoose from "mongoose";
import bcrypt from "bcryptjs";   // ✅ use bcrypt (not bcryptjs)
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phone: {
      type: String,
      required: [false, "Please provide a phone number"],
      default: '',
      match: [/^\+?[1-9]\d{9,14}$/, "Please provide a valid phone number"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6, 
      // ✅ safer (password not returned unless explicitly asked)
    },
    role: {
      type: String,
      enum: ["customer", "admin", "delivery_agent"],
      default: "customer",
    },
    isOnline: {
  type: Boolean,
  default: true,
},
status: {
  type: String,
  enum: ["available", "busy", "offline"],
  default: "available",
},
    address: {
      street: String,
      city: String,
      state: String,
      pincode: {
        type: String,
        match: [/^\d{6}$/, "Please provide a valid pincode"],
      },
      coordinates: {
        lat: { type: Number, min: -90, max: 90 },
        lng: { type: Number, min: -180, max: 180 },
      },
    },
    profileImage: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full address
userSchema.virtual("fullAddress").get(function () {
  if (!this.address.street) return "";
  return `${this.address.street}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}`;
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });



// JWT token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Match password
// Match password (plain-text)
userSchema.methods.matchPassword = function (enteredPassword) {
  return enteredPassword === this.password;
};


// Reset password token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
  return resetToken;
};

// Update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Static method to get user stats
userSchema.statics.getUserStats = async function () {
  return await this.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
      },
    },
  ]);
};

// Prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

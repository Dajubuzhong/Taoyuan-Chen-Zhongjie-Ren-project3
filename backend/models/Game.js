const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, index: true },
    difficulty: { type: String, enum: ["EASY", "NORMAL"], required: true },
    createdBy: { type: String, required: true, trim: true, default: "anonymous" },
    createdByEmail: { type: String, required: true, trim: true, lowercase: true, index: true },
    publicId: { type: String, unique: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Game", gameSchema);

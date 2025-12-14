const mongoose = require("mongoose");

const highscoreSchema = new mongoose.Schema(
  {
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    email: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

highscoreSchema.index({ gameId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Highscore", highscoreSchema);

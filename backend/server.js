require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const Game = require("./models/Game");
const Highscore = require("./models/Highscore");
const Counter = require("./models/Counter");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected via Mongoose");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });


app.use(cors());
app.use(express.json());


const WORDS = [
  "Coconut",
  "Red",
  "House",
  "Ocean",
  "Sun",
  "Moon",
  "Forest",
  "Mountain",
  "River",
  "Star",
  "Cloud",
  "Galaxy",
];

async function generateUniqueGameName() {
  function randomWord() {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
  }

  while (true) {
    const name = `${randomWord()} ${randomWord()} ${randomWord()}`;
    const exists = await Game.findOne({ name }).lean();
    if (!exists) return name;
  }
}

async function getNextGameNumber() {
  const doc = await Counter.findOneAndUpdate(
    { name: "game" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  ).lean();
  return doc.value;
}


// -------- User Auth APIs --------
app.post("/api/register", async (req, res) => {
  try {
    const { email, username, password } = req.body || {};

    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ message: "email, username and password are required" });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedUsername = String(username).trim();

    if (!trimmedEmail) return res.status(400).json({ message: "email cannot be empty" });
    if (!trimmedUsername) return res.status(400).json({ message: "username cannot be empty" });

    const existing = await User.findOne({ email: trimmedEmail }).lean();
    if (existing) {
      return res.status(400).json({ message: "email already exists" });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      email: trimmedEmail,
      username: trimmedUsername,
      password: hashedPassword,
    });

    return res.status(201).json({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(400).json({ message: "email already exists" });
    }
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: trimmedEmail }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "invalid email or password" });
    }

    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) {
      return res.status(401).json({ message: "invalid email or password" });
    }

    return res.json({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "server error" });
  }
});


// -------- Sudoku APIs --------
app.get("/api/sudoku", async (req, res) => {
  try {
    const games = await Game.find({}).sort({ createdAt: -1 }).lean();

    res.json(
      games.map((g) => ({
        id: g.publicId,
        name: g.name,
        difficulty: g.difficulty,
        createdBy: g.createdBy,
        createdByEmail: g.createdByEmail,
        createdAt: g.createdAt,
      }))
    );
  } catch (err) {
    console.error("GET /api/sudoku error:", err);
    res.status(500).json({ message: "server error" });
  }
});

app.post("/api/sudoku", async (req, res) => {
  try {
    const { difficulty, createdBy, createdByEmail } = req.body || {};

    if (difficulty !== "EASY" && difficulty !== "NORMAL") {
      return res.status(400).json({ message: "Invalid difficulty" });
    }

    const name = await generateUniqueGameName();

    const n = await getNextGameNumber();
    const publicId = `game${n}`;

    const email = String(createdByEmail || "").trim().toLowerCase();

    const game = await Game.create({
      name,
      difficulty,
      createdBy: createdBy && String(createdBy).trim() ? String(createdBy).trim() : "anonymous",
      createdByEmail: email,
      publicId,
    });

    res.status(201).json({ gameId: game.publicId });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "conflict, please retry" });
    }
    console.error("POST /api/sudoku error:", err);
    res.status(500).json({ message: "server error" });
  }
});


app.get("/api/sudoku/:id", async (req, res) => {
  try {
    const id = String(req.params.id || "").trim().toLowerCase();
    const game = await Game.findOne({ publicId: id }).lean(); 

    if (!game) return res.status(404).json({ message: "Game not found" });

    res.json({
      id: game.publicId,
      name: game.name,
      difficulty: game.difficulty,
      createdBy: game.createdBy,
      createdByEmail: game.createdByEmail,
      createdAt: game.createdAt,
    });
  } catch (err) {
    console.error("GET /api/sudoku/:id error:", err);
    res.status(400).json({ message: "Invalid game id" });
  }
});

app.put("/api/sudoku/:id", async (req, res) => {
  try {
    const id = String(req.params.id || "").trim().toLowerCase();
    const { name, difficulty } = req.body || {};

    const update = {};
    if (name && String(name).trim()) update.name = String(name).trim();
    if (difficulty) {
      if (difficulty !== "EASY" && difficulty !== "NORMAL") {
        return res.status(400).json({ message: "Invalid difficulty" });
      }
      update.difficulty = difficulty;
    }

    const game = await Game.findOneAndUpdate({ publicId: id }, update, { new: true }).lean();
    if (!game) return res.status(404).json({ message: "Game not found" });

    res.json({
      id: game.publicId,
      name: game.name,
      difficulty: game.difficulty,
      createdBy: game.createdBy,
      createdByEmail: game.createdByEmail,
      createdAt: game.createdAt,
    });
  } catch (err) {
    console.error("PUT /api/sudoku/:id error:", err);
    res.status(400).json({ message: "Invalid game id" });
  }
});

app.delete("/api/sudoku/:id", async (req, res) => {
  try {
    const id = String(req.params.id || "").trim().toLowerCase();
    const email = String(req.query.email || "").trim().toLowerCase();

    if (!email) return res.status(401).json({ message: "email is required" });

    const game = await Game.findOne({ publicId: id });
    if (!game) return res.status(404).json({ message: "Game not found" });

    if (String(game.createdByEmail || "").toLowerCase() !== email) {
      return res.status(403).json({ message: "Only the creator can delete this game" });
    }

    await Highscore.deleteMany({ gameId: game._id });
    await Game.deleteOne({ _id: game._id });

    res.json({ message: "Game deleted" });
  } catch (err) {
    console.error("DELETE /api/sudoku/:id error:", err);
    res.status(400).json({ message: "Invalid request" });
  }
});



// -------- Highscore APIs --------
app.post("/api/highscore", async (req, res) => {
  try {
    const { gameId, email } = req.body || {};
    if (!gameId) return res.status(400).json({ message: "gameId is required" });
    if (!email) return res.status(400).json({ message: "email is required" });

    const publicId = String(gameId).trim().toLowerCase();
    const game = await Game.findOne({ publicId }).lean();
    if (!game) return res.status(400).json({ message: "Game does not exist" });

    const userEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: userEmail }).lean();
    if (!user) return res.status(400).json({ message: "User does not exist" });

    const doc = await Highscore.findOneAndUpdate(
      { gameId: game._id, userId: user._id },
      {
        $setOnInsert: {
          gameId: game._id,
          userId: user._id,
          email: user.email,
          username: user.username,
          completedAt: new Date(),
        },
      },
      { new: true, upsert: true }
    ).lean();

    res.status(201).json({
      id: doc._id.toString(),
      gameId: publicId,
      email: doc.email,
      username: doc.username,
      completedAt: doc.completedAt,
    });
  } catch (err) {
    if (err?.code === 11000) return res.status(200).json({ message: "already completed" });
    console.error("POST /api/highscore error:", err);
    res.status(500).json({ message: "server error" });
  }
});


app.get("/api/highscore", async (req, res) => {
  try {
    const agg = await Highscore.aggregate([
      {
        $group: {
          _id: "$gameId",
          completedCountUsers: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          gameId: "$_id",
          completedCount: { $size: "$completedCountUsers" },
        },
      },
      { $match: { completedCount: { $gt: 0 } } },
      { $sort: { completedCount: -1 } },
    ]);

    const gameMongoIds = agg.map((x) => x.gameId);
    const games = await Game.find({ _id: { $in: gameMongoIds } }).lean();
    const gameMap = new Map(games.map((g) => [g._id.toString(), g]));

    const result = agg
      .map((x) => {
        const g = gameMap.get(x.gameId.toString());
        if (!g) return null;
        return {
          gameId: g.publicId,
          name: g.name,
          difficulty: g.difficulty,
          completedCount: x.completedCount,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (b.completedCount !== a.completedCount) return b.completedCount - a.completedCount;
        return a.name.localeCompare(b.name);
      });

    res.json(result);
  } catch (err) {
    console.error("GET /api/highscore error:", err);
    res.status(500).json({ message: "server error" });
  }
});

app.get("/api/highscore/status/:gameId", async (req, res) => {
  try {
    const publicId = String(req.params.gameId || "").trim().toLowerCase();
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "email is required" });

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(200).json({ completed: false });

    const game = await Game.findOne({ publicId }).lean();
    if (!game) return res.status(200).json({ completed: false });

    const exists = await Highscore.findOne({
      gameId: game._id,
      userId: user._id,
    }).lean();

    res.json({ completed: !!exists, completedAt: exists?.completedAt || null });
  } catch (err) {
    console.error("GET /api/highscore/status/:gameId error:", err);
    res.status(400).json({ message: "Invalid request" });
  }
});


// -------- Home Page Stats API --------
app.get("/api/stats", async (req, res) => {
  try {
    const userCount = await User.countDocuments();

    const agg = await Highscore.aggregate([
      {
        $group: {
          _id: "$gameId",
          completedCount: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          completedCount: { $size: "$completedCount" },
        },
      },
      { $sort: { completedCount: -1 } },
      { $limit: 1 },
    ]);

    const highestScore = agg.length > 0 ? agg[0].completedCount : 0;

    res.json({
      users: userCount,
      highestScore,
    });
  } catch (err) {
    console.error("GET /api/stats error:", err);
    res.status(500).json({ message: "server error" });
  }
});


const buildPath = path.join(__dirname, "..", "frontend", "build");

app.use(express.static(buildPath));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});


app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});

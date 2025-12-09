require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const itineraryRoutes = require("./routes/itineraries");

const generateRoutes = require("./routes/generate");

const chatRoutes = require("./routes/chat.js");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api/generate", generateRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)     // ← THIS LINE RIGHT HERE
  .then(() => {
    console.log("Mongo connected");
    app.listen(process.env.PORT || 4000, () =>
      console.log("Server running on port " + (process.env.PORT || 4000))
    );
  })
  .catch((err) => {
    console.error("Mongo connection error", err);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/itineraries", require("./routes/itineraries"));


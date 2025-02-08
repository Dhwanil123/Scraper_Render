require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const scrapeRoutes = require("./routes/scrapeRoutes");

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api", scrapeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

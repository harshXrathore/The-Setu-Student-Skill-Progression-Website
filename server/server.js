const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();
const connectDB = require("./config/db");
const { seedBadges } = require("./services/achievementEngine");
const cron = require("node-cron");
const JobFetcherService = require("./services/jobFetcher.service");

// Connect to Database
// Note: Requires MONGO_URI in .env
try {
  connectDB().then(() => {
    // Seed default badges after DB connects
    seedBadges();

    // Hybrid Data System: Schedule external job syncing
    cron.schedule("0 */6 * * *", async () => {
      console.log("[Cron] Running scheduled Adzuna job fetch...");
      await JobFetcherService.fetchAdzunaJobs("us", 30);
    });
  });
} catch (err) {
  console.error("Failed to initiate DB connection:", err);
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

// Static Directories
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/skills", require("./routes/skills"));
app.use("/api/users", require("./routes/users"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/mentors", require("./routes/mentors"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/community", require("./routes/community"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/mistakes", require("./routes/mistakes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/learning-progress", require("./routes/learningProgressRoutes"));
app.use("/api/ai", require("./routes/aiAssistant")); // Grok AI Assistant
app.use("/api/careers", require("./routes/careerRoutes"));
app.use("/api/gamification", require("./routes/gamification"));
app.use("/api/resources", require("./routes/resources"));

// Root Endpoint
// Serve frontend in production
app.use(express.static(path.join(__dirname, "../dist")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

// Error handling middleware (Simple)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

app.listen(port, () => {
  console.log(`CareerPath AI Server running at http://localhost:${port}`);
});

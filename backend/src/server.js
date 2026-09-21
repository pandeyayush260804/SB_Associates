const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const materialRoutes = require("./routes/materialRoutes");
const requirementRoutes = require("./routes/requirementRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dispatchRoutes = require("./routes/dispatchRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/requirements", requirementRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dispatches", dispatchRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health Check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Solar Supply Backend is running",
        company: "Shree Balaji Associates",
    });
});

// Root Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message:
            "Shree Balaji Associates - Solar Supply Management API",
    });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});
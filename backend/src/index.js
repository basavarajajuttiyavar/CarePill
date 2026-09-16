import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import familyRoutes from "./routes/family.js";
import medicineRoutes from "./routes/medicines.js";
import doctorRoutes from "./routes/doctors.js";
import dashboardRoutes, { publicRouter } from "./routes/dashboard.js";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

import superAdminRoutes from "./routes/superadmin.js";

app.use("/auth", authRoutes);
app.use("/family", familyRoutes);
app.use("/", medicineRoutes);   // exposes /members/:id/medicines, /medicines, /medicines/:id/dose-log
app.use("/doctors", doctorRoutes);
app.use("/superadmin", superAdminRoutes);
app.use("/", dashboardRoutes);  // exposes /dashboard/today, /analytics/medicines, /members/:id/emergency-card
app.use("/", publicRouter);     // exposes /public/emergency-card/:token (no auth)

app.use((req, res) => res.status(404).json({ error: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Family Medicine Tracker API listening on port ${PORT}`));

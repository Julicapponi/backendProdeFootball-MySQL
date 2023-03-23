import express from "express";
import morgan from "morgan";
import cors from "cors";
// Routes
import userRoutes from "./routes/user.routes.js";
import competitionRoutes from "./routes/competition.routes.js";
import enfrentamientosRoutes from "./routes/enfrentamientos.routes.js";
import groupsRoutes from "./routes/groups.routes.js";
const app = express();

// Settings
app.set("port", process.env.PORT || 5000);
//app.set('host', process.env.HOST || 'localhost');
app.set('host', process.env.HOST_PROD || 'localhost');
// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/enfrentamientos", enfrentamientosRoutes);
app.use("/api/groups", groupsRoutes);


export default app;

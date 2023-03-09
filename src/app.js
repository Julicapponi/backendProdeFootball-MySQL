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
app.set("port", process.env.PORT );
//app.set("port", process.env.PORT || process.env.PORT_HEROKU || 80);
app.set("host", 'localhost');
// app.set("host", '0.0.0.0'); NO PUSHEAR CON LOCAL HOST A HEROKU, PERO SI CON 0.0.0.0
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

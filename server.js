import express from "express";
import bodyparser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv"
import { AdminRoute } from "./routes/admin.route.js";
import { HyperAgentRoute } from "./routes/hyperAgent.route.js";
import { MasterAgentRoute } from "./routes/masterAgent.route.js";
import { SubAdminRoute } from "./routes/subAdmin.route.js";
import { SuperAgentRoute } from "./routes/superAgent.route.js";
import { UserRoute } from "./routes/user.route.js";
import { WhiteLabelRoute } from "./routes/whitelabel.route.js";
import { SubHypergentRoute } from "./routes/subHyperAgent.route.js";
import cors from 'cors';


dotenv.config()

const app = express();

app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:3000', 
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));


mongoose.connect(process.env.DB_URL, {
}).then(() => {
  console.log('Connection to MongoDB successful');
}).catch((err) => {
  console.error('Connection to MongoDB failed:', err);
});

AdminRoute(app);
WhiteLabelRoute(app);
HyperAgentRoute(app);
MasterAgentRoute(app);
SubAdminRoute(app);
SuperAgentRoute(app);
UserRoute(app);
SubHypergentRoute(app);

app.listen(process.env.PORT, ()=>{
    console.log(`Read the docs - http://localhost:${process.env.PORT || 8080}`)
})
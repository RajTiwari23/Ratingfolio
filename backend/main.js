import express from "express";
import bodyParser from "body-parser";
import pino from "pino-http"
import cors from "cors"
const app = express();
const apiRouter = express.Router();
import { getSearchProfileController } from "./controllers/profile.controller.js";
import AuthRouter from "./routes/auth.route.js";
import UserRouter from "./routes/user.route.js";
import ProfileRouter from "./routes/profile.route.js";
import cron from "node-cron"

import { PORT } from "./config.js";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(pino());
app.use(cors());
app.get("/", async (req, res) => {
  return res.json({ message: `Hello message` });
});
console.log("Started ", new Date().toISOString())
cron.schedule("*/5 * * * *",()=>{
  console.log("Starting the 5 min cron jobs.")
  contestExtraction()
}) 

apiRouter.get("/profiles/search", getSearchProfileController)
apiRouter.use("/auth", AuthRouter);
apiRouter.use("/user", UserRouter);
apiRouter.use("/profile", ProfileRouter)
app.use("/api", apiRouter);
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

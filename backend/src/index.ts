import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import router from "./routes/auth.router.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", router);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server started on port: ${PORT}`);
});

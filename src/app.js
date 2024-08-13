import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"
import { DATA_LIMIT } from "./constants.js";

const app =express();

app.use(cors({
    origin: process.env.CORS_ORIGIN
}))

app.use(express.json({limit:DATA_LIMIT}))
app.use(express.urlencoded({limit:DATA_LIMIT}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import

import userRouter from "./routes/user.routes.js"

//routes declaration 

app.use("/api/v1/users", userRouter)

export { app }


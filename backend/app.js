import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import fileUpload from "express-fileupload"
import userRouter from './routes/userRouter.js'
import jobRouter from './routes/jobRouter.js'
import applicationRouter from './routes/applicationRouter.js'
import otherJobsRouter from './routes/otherJobsRouter.js'
import { dbConnection } from "./database/dbConnection.js"
import {errorMiddleware} from './middlewares/error.js'
const app = express()
dotenv.config({path: "./config/config.env"});
app.use(cors({
    origin: ["https://job-portal-application-q2es.vercel.app"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    preflightContinue: false,
    credentials: true,
    headers : ["Origin", "Content-Type", "Accept"]
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}))
app.use("/api/user", userRouter);
app.use("/api/application", applicationRouter);
app.use("/api/job", jobRouter);
app.use("/api/otherJobs", otherJobsRouter);
dbConnection();
app.use(errorMiddleware)
export default app

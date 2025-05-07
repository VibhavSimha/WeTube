import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { errorHandler } from "./middlewares/error.middlewares.js"

const app = express()

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
)

//standard middleware
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// import routes
import healthCheckRouter from "./routes/healcheck.routes.js"
import userRouter from "./routes/user.routes.js"

//routes
app.use("/api/v1/healthcheck",healthCheckRouter)
app.use("/api/v1/users",userRouter)

app.use(errorHandler)
export {app}
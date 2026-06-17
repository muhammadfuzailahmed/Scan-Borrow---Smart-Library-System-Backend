import dotenv from "dotenv"
import express from "express"
import sql, { connectDB } from "./DB/db.js";
import authRouter from "./routes/auth.route.js";
import studentRouter from "./routes/student.route.js"
import adminRouter from "./routes/admin.route.js"
import bookRouter from "./routes/book.route.js"
import cors from "cors"
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";

dotenv.config({
    path: "./.env"
})

const app = express();
app.use(cors({
    origin: ["http://192.168.100.132:5173","http://localhost:5173"],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use("/api/student", studentRouter)
app.use("/api/admin", adminRouter)
app.use("/api/books", bookRouter)

console.log("Hello world!, running on port:", process.env.PORT)

app.get("/", (req, res) => {
    res.send("Hello")
})

connectDB().then(() => {
    app.listen(process.env.PORT, "0.0.0.0", () => {
        console.log("listening on http://localhost:",process.env.PORT)
    })
}).catch(() => {
    console.log("error")
})


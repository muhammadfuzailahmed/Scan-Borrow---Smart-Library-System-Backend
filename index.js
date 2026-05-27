import dotenv from "dotenv"
import express from "express"
import { connectDB } from "./DB/db.js";

dotenv.config({
    path: "./.env"
})

const app = express();

app.use(express.json())


console.log("Hello world!, running on port:", process.env.PORT)

connectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log("listening on http://localhost:",process.env.PORT)
    })
}).catch(() => {
    console.log("error")
})


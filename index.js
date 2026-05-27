import dotenv from "dotenv"

dotenv.config({
    path: "./.env"
})

console.log("Hello world!, running on port: ", process.env.PORT)
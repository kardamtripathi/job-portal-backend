import mongoose from "mongoose"
export const dbConnection = () => {
    mongoose.connect(process.env.MONGO_URI, {
        dbName: "JOB_PORTAL",
    })
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(`Some Error occured while connecting to DB: ${err}`)
    })
}
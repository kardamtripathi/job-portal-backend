import mongoose from "mongoose"
const UserOTPVerificationSchema = mongoose.Schema({
    userId:{
        type: String
    },
    otp:{
        type: String
    },
    createdAt:{
        type: Date
    },
    expiresAt:{
        type: Date
    }
})
export const UserOTPVerification = mongoose.model("UserOTPVerification", UserOTPVerificationSchema);
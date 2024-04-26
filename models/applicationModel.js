import mongoose, { mongo } from "mongoose";
import validator from "validator";
const applicationSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true, "Name is required"],
        minLength: [3, "Name should contain atleast 3 characters"],
        maxLength: [30, "Name should not exceed 30 characters"]
    },
    email:{
        type: String,
        validator: [validator.isEmail, "Enter a valid email"],
        required: [true, "Email is required"]
    },
    coverLetter:{
        type: String,
        required: [true, "Cover Letter is required"]
    },
    phone:{
        type: Number,
        required: [true, "Phone is required"]
    },
    address:{
        type: String,
        required: [true, "Address is required"]
    },
    resume:{
        public_id: {
            type: String,
            required: true,
        },
        url:{
            type: String,
            required: true
        }
    },
    applicantID:{
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        role:{
            type: String,
            enum: ["Job Seeker"],
            required: true
        }
    },
    employerID:{
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        role:{
            type: String,
            enum: ["Employer"],
            required: true
        }
    }
})
export const Application = mongoose.model("Application", applicationSchema);
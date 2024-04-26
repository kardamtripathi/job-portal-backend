import mongoose from "mongoose";
const jobSchema = new mongoose.Schema({
    title:{
        type: String,
        required: [true, "Job Title is required"],
        minLength: [3, "Job Title should contain atleast 3 characters"],
        maxLength: [50, "Job Title should not exceed 50 characters"]
    },
    description:{
        type: String,
        required: [true, "Job Description is required"],
        minLength: [50, "Job Description should contain atleast 50 characters"],
        maxLength: [400, "Job Description should not exceed 400 characters"]
    },
    category: {
        type: String,
        required: [true, "Job Category is required"]
    },
    country:{
        type: String,
        required: [true, "Job Country is required"]
    },
    city:{
        type: String,
        required: [true, "Job City is required"]
    },
    location:{
        type: String,
        required: [true, "Job Location is required"]
    },
    fixedSalary:{
        type: Number,
        minLength: [4, "Fixed Salary should contain atleast 4 digits"],
        maxLength: [9, "Fixed Salary should not exceed 9 digits"]
    },
    salaryFrom:{
        type: Number,
        minlength: [4, "Salary from should contain atleast 4 digits"],
        maxLength: [9, "Salary from should not exceed 9 digits"]
    },
    salaryTo:{
        type: Number,
        minlength: [4, "Salary to should contain atleast 4 digits"],
        maxLength: [9, "Salary to should not exceed 9 digits"]
    },
    expired:{
        type: Boolean,
        default: false
    },
    jobPostedOn:{
        type: Date,
        default: Date.now
    },
    postedBy:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    }
})
export const Job = mongoose.model("Job", jobSchema)
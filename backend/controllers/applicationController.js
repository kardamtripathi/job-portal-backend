import {catchAsyncErrors} from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';
import { Application } from '../models/applicationModel.js';
import { Job } from '../models/jobModel.js';
import cloudinary from 'cloudinary'
export const getEmployerApplications = catchAsyncErrors(async (req, res, next) => {
    const {role} = req.user;
    if(role !== "Employer"){
        return next(new ErrorHandler("You are not authorized for accessing the resource", 400))
    }
    const {_id} = req.user;
    const applications = await Application.find({'employerID.user': _id});
    res.status(200).json({
        success: true,
        applications
    })
})
export const getJobSeekerApplications = catchAsyncErrors(async (req, res, next) => {
    const {role} = req.user;
    if(role !== "Job Seeker"){
    return next(new ErrorHandler("You are not authorized for accessing the resource", 400))
    }
    const {_id} = req.user;
    const applications = await Application.find({'applicantID.user': _id});
    res.status(200).json({
        success: true,
        applications
    })
})
export const jobSeekerDeleteApplication = catchAsyncErrors(async (req, res, next) => {
    const {role} = req.user;
    if(role === "Employer"){
    return next(new ErrorHandler("You are not authorized for accessing the resource", 400))
    }
    const {id} = req.params;
    const applications = await Application.findById(id);
    if(!applications){
        return next(new ErrorHandler("Oops! Application Not Found", 404))
    }
    await applications.deleteOne();
    res.status(200).json({
        success: true,
        message: "Application Deleted Successfully"
    })
})
export const postApplication = catchAsyncErrors(async (req, res, next) => {
    const {role} = req.user;
    if(role === "Employer"){
        return next(new ErrorHandler("You are not authorized for accessing the resource", 400));
    }
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Resume is required", 400))
    }
    const {resume} = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if(!allowedFormats.includes(resume.mimetype)){
        return next(new ErrorHandler("Invalid File type! Resume should be either PNG, JPG or WEBP format"))
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(
        resume.tempFilePath
    );
    if(!cloudinaryResponse || cloudinaryResponse.error){
        console.log("Cloudinary Error: ", cloudinaryResponse.error || "Unknown Cloudinary Error");
        return next(new ErrorHandler("Failed to upload resume", 500))
    }
    const {name, email, coverLetter, phone, address, jobID} = req.body;
    const applicantID = {
        user: req.user._id,
        role: "Job Seeker"
    };
    if(!jobID){
        return next(new ErrorHandler("Job Not Found", 404));
    }
    const jobDetails = await Job.findById(jobID);
    if(!jobDetails){
        return next(new ErrorHandler("Job Not Found", 404))
    }
    const employerID = {
        user: jobDetails.postedBy,
        role: "Employer"
    };
    if(!name || !email || !coverLetter || !phone || !address || !applicantID || !employerID || !resume){
        return next(new ErrorHandler("All Fields are required", 400))
    }
    const application = await Application.create({
        name, email, coverLetter, phone, address, applicantID, employerID, 
        resume:{
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.url
        }
    })
    res.status(200).json({
        success: true,
        message: "Application Submitted Successfully",
        application
    })
})
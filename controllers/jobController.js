import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Job } from "../models/jobModel.js";
export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
    const jobs = await Job.find({expired: false});
    res.status(200).json({
        success: true,
        jobs
    })
})
export const postJob = catchAsyncErrors(async (req, res, next) => {
    const {role} = req.user;
    if(role === "Job Seeker"){
        return next(new ErrorHandler("You are not authorized for posting the job", 400));
    }
    const {title, description, category, country, city, location, fixedSalary, salaryFrom, salaryTo} = req.body;
    if(!title || !description || !category || !city || !location){
        return next(new ErrorHandler("All fields are required", 400));
    }
    if((!salaryFrom || !salaryTo) && !fixedSalary){
        return next(new ErrorHandler("Either provide fixed salary or ranged salary", 400))
    }
    if(salaryFrom && salaryTo && fixedSalary){
        return next(new ErrorHandler("Adding both salary types are not valid", 400))
    }
    const postedBy = req.user._id;
    const job = await Job.create({
        title, description, category, country, city, location, fixedSalary, salaryFrom, salaryTo, postedBy
    })
    res.status(200).json({
        success: true,
        message: "Job Posted Successfully",
        job
    })
})
export const getMyJobs = catchAsyncErrors(async(req, res, next) => {
    const {role} = req.user;
    if(role === "Job Seeker"){
        return next(new ErrorHandler("You are not authorized for posting the job", 400));
    }
    const myJobs = await Job.find({postedBy: req.user._id})
    res.status(200).json({
        success: true,
        myJobs
    })
})
export const updateJob = catchAsyncErrors(async (req, res, next) => {
    const {role} = req.user;
    if(role === "Job Seeker"){
        return next(new ErrorHandler("You are not authorized for accessing the resource", 400));
    }
    const {id} = req.params;
    let job = await Job.findById(id);
    if(!job){
        return next(new ErrorHandler("Oops! Job Not Found", 404))
    }
    job = await Job.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true,
        job,
        message: "Job Updated Successfully"
    })
}) 
export const deleteJob = catchAsyncErrors(async (req, res, next) => {
    const {role} = req.user;
    if(role === "Job Seeker"){
        return next(new ErrorHandler("You are not authorized for accessing the resource", 400));
    }
    const {id} = req.params;
    let job = await Job.findById(id);
    if(!job){
        return next(new ErrorHandler("Oops! Job Not Found", 404))
    }
    await job.deleteOne();
    res.status(200).json({
        success: true,
        message: "Job Deleted Successfully"
    })
})
export const getSingleJob = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.params;
    try{
        const job = await Job.findById(id);
        if(!job){
            return next(new ErrorHandler("Job Not Found", 404));
        }
        res.status(200).json({
            success: true,
            job
        })
    }
    catch(error){
        return next(new ErrorHandler("Invalid ID", 400))
    }
})
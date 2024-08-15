import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { getJson } from "serpapi";
import dotenv, { config } from "dotenv"
dotenv.config({path: '../config/config.env'})
export const getOtherJobs = catchAsyncErrors(async (req, res, next) => {
    try {
        const jobRole = req.query.jobRole;
        const location = req.query.location;
        console.log(jobRole, location);
        const response = await getJson({
            engine: "google_jobs",
            q: jobRole + " " +  location,
            hl: "en",
            api_key: process.env.API_KEY
          });
        if (response.jobs_results) {
            const jobs = response.jobs_results.map(result => ({
                title: result.title,
                company: result.company_name,
                location: result.location,
                description: result.description,
                links: result.share_link
            }));
            return res.status(200).json({
                success: true,
                message: "Jobs Fetched Successfully",
                jobs: jobs
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "No jobs found"
            });
        }
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
    
})

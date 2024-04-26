import express from "express"
import { getEmployerApplications,  jobSeekerDeleteApplication, getJobSeekerApplications, postApplication} from "../controllers/applicationController.js";
import {isAuthorized} from '../middlewares/auth.js'
const router = express.Router();
router.get("/employer/getAllApplications", isAuthorized, getEmployerApplications);
router.get("/jobSeeker/getAllApplications", isAuthorized, getJobSeekerApplications);
router.delete("/delete/:id", isAuthorized, jobSeekerDeleteApplication);
router.post("/fillApplication", isAuthorized, postApplication);
export default router
import express from "express"
import { getOtherJobs } from "../controllers/otherJobsController.js";
import { isAuthorized } from "../middlewares/auth.js";
const router = express.Router();
router.get('/jobs', isAuthorized, getOtherJobs)
export default router
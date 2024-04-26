import express from "express"
import { getAllJobs, postJob, getMyJobs, updateJob, deleteJob, getSingleJob } from "../controllers/jobController.js";
import { isAuthorized } from "../middlewares/auth.js";
const router = express.Router();
router.get('/getJobs', getAllJobs)
router.post('/addJob', isAuthorized, postJob)
router.get('/myJobs', isAuthorized, getMyJobs)
router.put('/update/:id', isAuthorized, updateJob)
router.delete('/delete/:id', isAuthorized, deleteJob)
router.get('/:id', isAuthorized, getSingleJob);
export default router
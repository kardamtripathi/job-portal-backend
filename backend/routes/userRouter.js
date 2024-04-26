import express from "express"
import { login, logout, register, getUser, verifyOTP, resendOTP, forgotPassword, resetPassword } from "../controllers/userController.js";
import { isAuthorized } from "../middlewares/auth.js";
const router = express.Router();
router.post("/register", register)
router.post('/login', login)
router.post('/verifyOTP', verifyOTP)
router.post('/resendOTP', resendOTP)
router.post('/forgotPassword', forgotPassword)
router.post('/resetPassword/:id/:token', resetPassword)
router.get('/logout', isAuthorized, logout)
router.get('/getUser', isAuthorized, getUser);
export default router
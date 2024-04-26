import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userModel.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";
import nodemailer from "nodemailer"
import bcrypt from "bcrypt"
import { UserOTPVerification } from "../models/userOTPVerification.js";
import dotenv from "dotenv"
import jwt from "jsonwebtoken";
dotenv.config({path: "./config/config.env"});
export const register = catchAsyncErrors(async (req, res, next) => {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !phone || !password || !role) {
        return next(new ErrorHandler("All Fields are required", 400));
    }
    const isEmail = await User.findOne({ email });
    if (isEmail) {
        return next(new ErrorHandler("Email already exists", 400));
    }
    const user = await User.create({
        name,
        email,
        phone,
        password,
        role,
        verified: false,
    });
    user.save().then((result) => {
      sendVerificationEmail(result, res);
    })
    // sendToken(user, 201, res, "User Logged In Successfully");
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("All Fields are required", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email Or Password", 400));
  }
  if (user.role !== role) {
    return next(
      new ErrorHandler(`User with provided email and role not found`, 404)
    );
  }
  if(user.verified !== true){
    sendVerificationEmail({_id: user._id, email: user.email}, res);
  }
  else{
    sendToken(user, 201, res, "User Logged In Successfully");
  }
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: true,
      sameSite: "none"
    })
    .json({
      success: true,
      message: "User Logged Out Successfully",
    });
});


export const getUser = catchAsyncErrors((req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});


let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth:{
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS
  }
})

const sendVerificationEmail = async ({_id, email}, res) => {
  try{
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: `
        <h2>Welcome to Quick Job</h2>
        <p>Enter <b>${otp}</b> onto our portal to verify your email address and complete the registration process</p>
        <i><p>Note: This code will expires in <b>5</b> minutes</p></i>
      `
    }
    const hashedOTP = await bcrypt.hash(otp, 10);
    const newOTPVerification = new UserOTPVerification({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000
    });
    await newOTPVerification.save();
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
      } else {
        console.log("Email sent: ", info.response);
      }
    });
    res.json({
      status: "Pending",
      message: "Verification OTP Email Sent",
      data:{
        userId: _id,
        email
      }
    })
  }
  catch(error){
    res.status(500).json({
      status: "Failed",
      message: error.message
    })
  }
}

export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const {userId, otp} = req.body;
  if(!userId || !otp){
    return next(new ErrorHandler("OTP Required", 400));
  }
  else{
    const userOTPVerification = await UserOTPVerification.findOne({userId});
    if(userOTPVerification == undefined){
      return next(new ErrorHandler("Account record doesn't exist or have been verified already. Please Sign Up or Login", 400))
    }
    else{
      const expiresAt = userOTPVerification.expiresAt;
      const hashedOTP = userOTPVerification.otp;
      if(expiresAt < Date.now()){
        await UserOTPVerification.deleteMany({userId})
        return next(new ErrorHandler("Code has expired. Request another OTP", 400))
      }
      else{
        console.log("OTP is: " + otp)
        const isValidOTP = await bcrypt.compare(otp, hashedOTP);
        if(!isValidOTP){
          return next(new ErrorHandler("Invalid Code!", 400));
        }
        else{
          await User.updateOne({_id: userId}, {verified: true});
          await UserOTPVerification.deleteMany({userId});
          const user = await User.findById(userId);
          sendToken(user, 201, res, "User Verified Successfully");
        }
      }
    }
  }
})
export const resendOTP = catchAsyncErrors(async (req, res, next) => {
  const {userId, email} = req.body;
  if(!userId || !email){
    return next(new ErrorHandler("Empty User details are not allowed", 400));
  }
  const user = await User.findById({_id: userId});
  if(user.verified === true){
    return next(new ErrorHandler("User Already Verified", 400))
  }
  else{
    await UserOTPVerification.deleteMany({userId});
    sendVerificationEmail({_id: userId, email}, res)
  }
})

export const forgotPassword = catchAsyncErrors(async(req, res, next) => {
  const {email} = req.body;
  const user = await User.findOne({email});
  if(!user){
    return next(new ErrorHandler("User with given email not found", 400))
  }
  const token = user.getJWTToken();
  const link = `https://job-portal-application-q2es.vercel.app/resetPassword/${user._id}/${token}`
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Reset Password Link",
    html: `
      <h2>Reset Your Password</h2>
      <p>A reset password request is been send to us. To reset your Quick Job password, click on this this:</p>
      <a href="${link}">Reset Password Link </a>
    `
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      // console.error("Error sending email: ", error);
      return next(new ErrorHandler("Error Sending Email", 500))
    } else {
      console.log("Email sent: ", info.response);
      return res.json({Status: "Success", message: "Reset Password Mail Sent"})
    }
  });
})
export const resetPassword = catchAsyncErrors(async(req, res, next) => {
  const {id, token} = req.params;
  const {password} = req.body;
  if(password.length < 8){
    return next(new ErrorHandler("Password should be atleast of 8 characters", 400))
  }
  if(password.length > 256){
    return next(new ErrorHandler("Password should not exceed 256 characters", 400))
  }
  jwt.verify(token, process.env.JWT_SECRET_KEY, async(error, decoded) => {
    if(error){
      return res.json({Status: "Error with token"})
    }
    else{
      const newPassword = await bcrypt.hash(password, 10);
      const user = await User.findByIdAndUpdate({_id: id}, {password: newPassword})
      return res.json({Status: "Success", message: "Password Updated Successfully"})
    }
  })
})
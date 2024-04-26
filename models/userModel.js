import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Name is required"],
        minLength: [3, "Name should contain atleast 3 characters"],
        maxLength: [30, "Name should not exceed 30 characters"]
    },
    email:{
        type: String,
        required: [true, "Email is required"],
        validate: [validator.isEmail, "Enter a valid email"]
    },
    phone:{
        type: Number,
        required: [true, "Phone is required"],
        validate: {
            validator: function(value) {
                return value.toString().length === 10;
            },
            message: "Not a valid phone number. Must be of 10 digits"
        }
    },
    password:{
        type: String,
        required: [true, "Password is required"],
        minLength: [8, "Password must contain atleast 8 characters"],
        maxLength: [256, "Password cannot exceed 256 characters"],
        select: false
    },
    role:{
        type: String,
        required: [true, "Role is required"],
        enum: ["Job Seeker", "Employer"]
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    verified:{
        type: Boolean,
        default: false
    }
});
userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
})
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
};
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE
    })
}
export const User = mongoose.model("User", userSchema);
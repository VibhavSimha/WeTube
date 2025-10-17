// id string pk --> Auto by MongoDB
//   username string
//   email string
//   fullName string
//   avatar string
//   coverImage string
//   watchHistory ObjectId[] videos
//   password string
//   refreshToken string
//   createdAt Date
//   updatedAt Date

import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {//id is automatically added for primary key
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullname: {
            type:String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //Maybe cloudinary URL
            required:true
        },
        avatarPID: {
            type: String, //Maybe cloudinary Public ID
            required:true
        },
        coverImage: {
            type: String, 
        },
        coverImagePID: {
            type: String, 
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video" //Name of Video Model
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String
        }
    }, {timestamps: true}// createdAt, UpdatedAt automatically added
)

userSchema.pre("save",async function(next){
    if(!this.isModified("password"))return next()
    this.password=await bcrypt.hash(this.password, 10) //Bug fixed: await bcrypt
    next()
})

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken=function(){
    //short lived access jwt token
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
);
}
userSchema.methods.generateRefreshToken=function(){
    //short lived access jwt token
    return jwt.sign({
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
);
}

export const User=mongoose.model("User",userSchema);
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
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //Maybe cloudinary URL
            required:true
        },
        coverImage: {
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

export const User=mongoose.model("User",userSchema);
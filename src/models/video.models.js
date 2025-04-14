// id string pk
//   owner ObjectId users
//   videoFile string
//   thumbnail string
//   title string
//   description string
//   duration number
//   views number
//   isPublished boolean
//   createdAt Date
//   updatedAt Date

import mongoose, {Schema} from "mongoose";

const videoSchema = new Schema(
    {
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        videoFile: {
            type: String,//cloudinary URL
            required: true

        },
        thumbnail: {
            type: String,
            required: true
        },
        title:{
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        duration:{
            type: Number,
            required: ture
        },
        isPublished: {
            type: Boolean,
            default: true
        }
    }, {timestamps: true}// createdAt, UpdatedAt automatically added
)

export const Video=mongoose.model("Video",videoSchema);
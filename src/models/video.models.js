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
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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
            required: true
        },
        isPublished: {
            type: Boolean,
            default: true
        }
    }, {timestamps: true}// createdAt, UpdatedAt automatically added
)

videoSchema.plugin(mongooseAggregatePaginate) // we can now use match, group 

export const Video=mongoose.model("Video",videoSchema);
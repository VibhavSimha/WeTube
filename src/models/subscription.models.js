// id string pk
//   subscriber ObjectId users
//   channel ObjectId users
//   createdAt Date
//   updatedAt Date

import mongoose,{Schema} from "mongoose";

const subsriptionSchema=new Schema(
    {
        subsriber:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        channel:{
            type: Schema.Types.ObjectId,
            ref:"User",
            required: true
        }
    },{timestamps: true}
)

export const Subscription=mongoose.model("Subscription",subsriptionSchema)
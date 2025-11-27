import mongoose, { mongo } from "mongoose"
import { Video } from "../models/video.models.js"
import { Subscription } from "../models/subscription.models.js"
import { Like } from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    if (req.user) {
        try {
            const [totalVideosViews, totalSubscribers, totalLikes] = await Promise.all([
                Video.aggregate([
                    {
                        $match: {
                            owner: new mongoose.Types.ObjectId(req.user._id)
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalVideoViews: {
                                $sum: "$views"
                            },
                            totalVideos: {
                                $sum: 1
                            }
                        }
                    }
                ]),
                Subscription.aggregate([
                    {
                        $match: {
                            channel: new mongoose.Types.ObjectId(req.user._id)
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalSubscribers: {
                                $sum: 1
                            }
                        }
                    }
                ]),
                Video.aggregate([
                    {
                        $match: {
                            owner: new mongoose.Types.ObjectId(req.user._id)
                        }
                    },
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "videoLikes"
                        }
                    },
                    {
                        $addFields: {
                            totalLikesPerVideo: {
                                $size: "$videoLikes"
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalLikes: {
                                $sum: "$totalLikesPerVideo"
                            }
                        }
                    }
                ])
            ])

            const totalVideos = totalVideosViews[0]?.totalVideos || 0;
            const totalViews = totalVideosViews[0]?.totalVideoViews || 0;
            const totalSubscribersCount = totalSubscribers[0]?.totalSubscribers || 0;
            const totalLikesCount = totalLikes[0]?.totalLikes || 0;

            const stats = { totalVideos, totalViews, totalSubscribersCount, totalLikesCount };

            return res.status(200).json(new ApiResponse(200, stats, "Successfully fetched stats"))

        }
        catch (error) {
            throw new ApiError(500, "Failed to Fetch Stats", error)
        }
    }
    else {
        throw new ApiError(401, "Unauthorized attempt")
    }
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats,
    getChannelVideos
}
import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadToCloud } from "../utils/cloudinary.js"
import { getVideoDurationInSeconds } from "get-video-duration"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const user = req.user;
    const videoFilePath = req.files?.videoFile?.[0].path;
    const thumbnailPath = req.files?.thumbnail?.[0].path;
    if (!videoFilePath || !thumbnailPath || !title || !description) {
        throw new ApiError(400, "All fields required");
    }
    else {
        const videoDurationInSec = await getVideoDurationInSeconds(videoFilePath);
        let videoCloudLink;
        try {
            videoCloudLink = await uploadToCloud(videoFilePath);
        }
        catch (error) {
            throw new ApiError(500, "Video Upload to cloud failed");
        }
        let thumbnailCloudLink;
        try {
            thumbnailCloudLink = await uploadToCloud(thumbnailPath);
        }
        catch (error) {
            if (videoCloudLink) {
                await deleteFromCloudinary(videoCloudLink.public_id, "video");
            }
            throw new ApiError(500, "Thumbnail Upload to cloud failed");
        }
        try {
            const video = await Video.create({
                owner: user,
                videoFile: videoCloudLink.url,
                videoPID: videoCloudLink.public_id,
                thumbnail: thumbnailCloudLink.url,
                thumbnailPID: thumbnailCloudLink.public_id,
                title,
                description,
                views: 0,
                duration: videoDurationInSec,
                isPublished: 1
            })

            return res.status(200).json(new ApiResponse(200, video, "Video Successfully Uploaded"))

        }
        catch (error) {
            if (videoCloudLink) {
                try {
                    await deleteFromCloudinary(videoCloudLink.public_id, "video");//With video resource_type
                }
                catch (error) {
                    throw new ApiError(500, "Doc creation failed as well as video deleteFromCloud", error);
                }
            }
            if (thumbnailCloudLink) {
                try {
                    await deleteFromCloudinary(thumbnailCloudLink.public_id);
                }
                catch (error) {
                    throw new ApiError(500, "Doc creation failed as well as thumbnail deleteFromCloud", error);
                }
            }
            throw new ApiError(500, "Document creation failed", error);
        }
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    let video;
    video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video does not exist")
    }
    return res.status(200).json(new ApiResponse(200, video, "Video Found"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    let video;
    video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video does not exist")
    }
    const { title = video.title, description = video.description } = req.body;
    if (!title || !description) {
        throw new ApiError(400, "Empty values not accepted");
    }
    else {
        let newThumbnail = req.file?.path;
        let newThumbnailCloudLink;
        if (newThumbnail) {
            try {
                newThumbnailCloudLink = await uploadToCloud(newThumbnail);
            }
            catch (error) {
                throw new ApiError(500, "New Upload to cloud failed");
            }
        }
        try {
            video.title = title;
            video.description = description;
            if (newThumbnailCloudLink) {
                try {
                    await deleteFromCloudinary(video.thumbnailPID);
                }
                catch (error) {
                    throw new ApiError(500, "Delete old thumbnail failed");
                }
                video.thumbnail = newThumbnailCloudLink.url;
                video.thumbnailPID = newThumbnailCloudLink.public_id;
            }
            await video.save({ validateBeforeSave: true });
            return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
        }
        catch (error) {
            try {
                if (newThumbnailCloudLink) {
                    await deleteFromCloudinary(newThumbnailCloudLink.public_id);
                }
            }
            catch (error) {
                throw new ApiError(500, "Document update as well as cloud delete failed");
            }
            throw new ApiError(500, "Document Update Failed", error);
        }
    }
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
import mongoose from "mongoose"
import { Comment } from "../models/comment.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;


    const comments = await Comment.aggregate([
        {
            $match: {
                video: videoId
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $limit: limit * page
        },
        {
            $project: {
                owner: 1,
                content: 1
            }
        }
    ])

    if (comments.length === 0) {
        return res.status(201).json(new ApiResponse(201, {}, "No comments found"));
    }
    else {
        return res.status(200).json(new ApiResponse(200, comments, "Comments Fetched Successfully"));
    }


})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { owner, content } = req.body;

    if (!videoId || !owner || !content) {
        throw new ApiError(400, "All parameter requests must be sent")
    }

    try {
        const comment = await Comment.create({
            //TODO: uncomment after creating video controller
            // video:videoId,
            owner: owner,
            content: content
        })

        const createdComment = await Comment.findById(comment._id).select("-createdAt -updatedAt");

        if (!createdComment) {
            throw new ApiError(500, "Error adding comment")
        }

        return res.status(200).json(new ApiResponse(200, createdComment, "Comment added successfully"));
    }
    catch (error) {
        throw new ApiError(500, "Error adding comment", error)
    }


})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(400, "Comment Not Found");
    }
    else {
        const { newContent } = req.body;
        if (!newContent) {
            throw new ApiError(400, "New Content Required");
        }
        else {
            try {
                comment.content=newContent;
                await comment.save({validateBeforeSave:false});
                const updatedComment = await Comment.findById(comment._id).select("-createdAt -updatedAt -_id");
                if (!updatedComment) {
                    throw new ApiError(500, "Update Op Fail");
                }
                else {
                    return res.status(200).json(new ApiResponse(200, updatedComment, "Updated Comment Successfully"));
                }
            }
            catch (error) {
                throw new ApiError(500, "Update Failed");
            }
        }
    }

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
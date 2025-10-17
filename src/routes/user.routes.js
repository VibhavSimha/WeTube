import {Router} from "express";
import { registerUser, logoutUser, loginUser , refreshAccessToken, changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage, getUserChannelProfile, getWatchHIstory} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router =Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        },
        {
            name: "coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

router.route("/login").get(loginUser);
router.route("/refresh-token").patch(refreshAccessToken);

//secured routes


//With Middleware
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/change-password").patch(verifyJWT,changeCurrentPassword);
router.route("/get-user").get(verifyJWT,getCurrentUser);
router.route("/change-account-details").patch(verifyJWT,updateAccountDetails);
//Files as well
router.route("/change-avatar").patch(
    verifyJWT,
    upload.single("avatar"), //for single file upload
    updateUserAvatar);
router.route("/change-cover-image").patch(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage);
router.route("/get-channel-profile/:username").get(verifyJWT,getUserChannelProfile);//With :username
router.route("/history").get(verifyJWT,getWatchHIstory);

export default router
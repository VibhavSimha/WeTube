import {Router} from "express";
import { registerUser, logoutUser, loginUser ,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage} from "../controllers/user.controller.js";
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

//secured routes
//With Middleware
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/get-user").post(verifyJWT,getCurrentUser);
router.route("/change-account-details").post(verifyJWT,updateAccountDetails);
router.route("/change-avatar").post(verifyJWT,updateUserAvatar);
router.route("/change-cover-image").post(verifyJWT,updateUserCoverImage);

export default router
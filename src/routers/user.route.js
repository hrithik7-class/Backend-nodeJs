import { Router } from "express";
import { 
    registerUer,
    loginUser,
    logoutUser,
    refreshAccessToken, 
    changeCurrentPassword, 
    currentuser, 
    changeDetails, 
    avatarfileUpdate, 
    getUserChannelProfile
}  from "../controllers/user.controller";

import { upload } from "../middlewares/multer.middleware.js"
import {verifyJwt} from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/register").post( upload(
    [
        {
            name:avatar,
            maxCount:1
        },
        {
            name:coverImage,
            maxCount:1
        }
    ]
),registerUer) //1 way 2nd way  is router.post('/register',registerUser)

router.route("/login").post(loginUser)

//middlwre added routes
router.route("/logout").post(verifyJwt,logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/change-password').post(verifyJwt , changeCurrentPassword);
router.route('/current-user').post(verifyJwt , currentuser);
router.route('/change-details').patch(verifyJwt , changeDetails);
router.route('/avatar-image').patch(verifyJwt , upload.single("avatar") , avatarfileUpdate);
router.route('/cover-image').patch(verifyJwt ,upload.single("coverImage") , coverImagefileUpdate);
router.route('/channel/:username').get(verifyJwt , getUserChannelProfile);
router.route('/history').get(verifyJwt , getUserWatchHistory);


export default router;
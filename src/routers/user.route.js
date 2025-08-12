import { Router } from "express";
import registerUer from "../controllers/user.controller";
import { upload } from "../middlewares/multer.middleware.js"

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

export default router;
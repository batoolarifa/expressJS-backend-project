import { Router } from "express";

const router = Router();

import {publishAVideo, deleteVideo, getVideoById }
 from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"


router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file


router.route("/").post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );


router
      .route("/:videoId?")
                          .delete(deleteVideo)
                          .get(getVideoById)

export default router